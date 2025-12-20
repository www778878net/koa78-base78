"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UidBase78 = exports.CidBase78 = void 0;
const tslib_1 = require("tslib");
require("reflect-metadata");
const DatabaseService_1 = require("../services/DatabaseService");
const CacheService_1 = require("../services/CacheService");
const Config_1 = require("../config/Config");
const QueryBuilder_1 = require("../utils/QueryBuilder");
const decorators_1 = require("../interfaces/decorators");
const ContainerManager_1 = require("../ContainerManager");
const tslog78_1 = require("tslog78");
const elasticsearch78_1 = tslib_1.__importDefault(require("../services/elasticsearch78"));
class Base78 {
    constructor() {
        this.dbname = "default"; //mysql数据库名（非表名） 
        // 使用新的日志服务方式，与DatabaseService中完全一致
        this.logger = ContainerManager_1.ContainerManager.getLogger() || tslog78_1.TsLog78.Instance;
        this.logger.debug(`Base78 constructor called for ${this.constructor.name}`);
        this.tableConfig = this._loadConfig();
        this.tbname = this.constructor.name;
    }
    setup(upInfo) {
        this._up = upInfo;
    }
    get up() {
        if (!this._up) {
            throw new Error('UpInfo not set. Call setup() before using up.');
        }
        return this._up;
    }
    mUpdateElkByid() {
        var _a;
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const up = this.up;
            if ((up.cid !== this.config.get('cidvps') && up.cid !== this.config.get('cidmy')) && !((_a = up.uname) === null || _a === void 0 ? void 0 : _a.indexOf("sys"))) {
                throw new Error("err:只有管理员可以操作");
            }
            if (this.esService === null)
                return null;
            const index = this.tbname; // 替换为你的索引名称
            const id = this.up.pars[0]; // 替换为你的文档 ID
            const updateDoc = JSON.parse(this.up.pars[1]);
            const updatedData = yield this.esService.updateById(index, id, updateDoc);
            return updatedData;
        });
    }
    getCustomCols() {
        return '||||';
    }
    get esService() {
        return elasticsearch78_1.default.getInstance();
    }
    get dbService() {
        return DatabaseService_1.DatabaseService.instance;
    }
    get cacheService() {
        return CacheService_1.CacheService.instance;
    }
    get config() {
        return Config_1.Config.getInstance();
    }
    _handleError(e) {
        this.up.errmsg = e.message;
        this.up.res = -8888;
        this.logger.error("错误:", e);
    }
    _loadConfig() {
        const className = this.constructor.name;
        //this.logger.debug(`正在加载类的配置: ${className}`);
        const config = Config_1.Config.getInstance();
        this.logger.debug(`Config 实例: ${config ? 'exists' : 'undefined'}`);
        if (!config) {
            this.logger.error('Config is not initialized');
            throw new Error('Config is not initialized');
        }
        const tableConfig = config.getTable(className);
        //this.logger.debug(`${className} 的表配置:`, tableConfig);
        if (!tableConfig) {
            this.logger.error(`未找到 ${className} 的表配置`);
            this.logger.debug('完整配置:', JSON.stringify(config.get(''), null, 2));
            throw new Error(`未找到 ${className} 的表配置`);
        }
        return tableConfig;
    }
    _setBack(res, errmsg, kind = "") {
        this.up.backtype = kind || "string";
        this.up.res = res || 0;
        this.up.errmsg = errmsg || "";
    }
    mUpdateMany(colpin) {
        var _a, _b;
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const self = this;
            const up = self.up;
            // 防注入: 校验cid和uname
            if (up.cid !== this.config.get('cidvps') && up.cid !== this.config.get('cidmy') && !((_a = up.uname) === null || _a === void 0 ? void 0 : _a.indexOf("sys"))) {
                throw new Error(`err:只有管理员可以操作 ${up.uname} ${up.cid} ${this.config.get('cidmy')}`);
            }
            let colp = colpin || this.up.cols || self.tableConfig.colsImp; // 修改列
            let order = up.order; // 主键，暂时只支持一个
            let num = colp.length + 1; // 添加额外的字段来更新
            let idlist = []; // 用于存储ID
            let values = []; // 用于存储更新值
            let pars = []; // 最终的查询参数
            // 处理每一组参数并构建更新列表
            while (up.pars.length > 0) {
                let vals = up.pars.splice(0, num);
                idlist.push(vals[num - 1]); // 获取ID列表
                vals[num - 1] = (_b = up.uname) !== null && _b !== void 0 ? _b : ""; // 设置更新者
                vals.push(up.utime); // 添加更新时间
                values.push(vals); // 存储更新值
            }
            // 构建 SQL 查询
            let sb = `UPDATE ${self.tableConfig.tbname} SET `;
            for (let i = 0; i < colp.length; i++) {
                if (i > 0)
                    sb += `, `;
                sb += `\`${colp[i]}\` = CASE idpk `;
                for (let j = 0; j < idlist.length; j++) {
                    sb += `WHEN ? THEN ? `;
                    pars.push(idlist[j], values[j][i]); // 添加查询参数
                }
                sb += `END`;
            }
            // 添加 upby 和 uptime 字段
            sb += ", upby = ?, uptime = ? ";
            // 添加 where 子句
            sb += `WHERE idpk IN (${idlist.map(() => '?').join(',')})`;
            pars.push(up.uname, up.utime, ...idlist);
            // 执行更新操作
            try {
                const result = yield this.dbService.m(sb, pars, up, this.dbname);
                return result.toString();
            }
            catch (error) {
                throw new Error(`数据库操作失败: ${error.message}`);
            }
        });
    }
    mAdd(colp) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            colp = colp || this.tableConfig.colsImp;
            if (this.up.pars.length < colp.length) {
                colp = colp.slice(0, this.up.pars.length);
            }
            const values = this.up.pars.slice(0, colp.length);
            values.push(this.up.mid, this.up.uname || '', this.up.utime, this.up[this.tableConfig.uidcid]);
            const query = `INSERT INTO ${this.tableConfig.tbname} (${colp.join(',')},id,upby,uptime,${this.tableConfig.uidcid}) VALUES (${new Array(colp.length + 4).fill('?').join(',')})`;
            const result = yield this.dbService.mAdd(query, values, this.up, this.dbname);
            // 如果mAdd返回值是0 且tbname=jhs_puton 记录query和values
            if (result === 0) {
                this.logger.warn(`mAdd returned 0 for jhs_puton table. Query: ${query}, Values: ${JSON.stringify(values)}`);
            }
            return result;
        });
    }
    mUpdateIdpk(colp) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            colp = colp || this.up.cols || this.tableConfig.colsImp;
            if (this.up.pars.length < colp.length) {
                colp = colp.slice(0, this.up.pars.length);
            }
            const setClause = colp.map(col => `${col}=?`).join(',');
            const query = `UPDATE ${this.tableConfig.tbname} SET ${setClause}, upby=?, uptime=? WHERE idpk=? AND ${this.tableConfig.uidcid}=? LIMIT 1`;
            const values = this.up.pars.slice(0, colp.length);
            values.push(this.up.uname || '', this.up.utime, this.up.midpk.toString(), this.up[this.tableConfig.uidcid]);
            const result = yield this.dbService.m(query, values, this.up, this.dbname);
            if (result == 0)
                return this.up.midpk.toString() + " " + this.tableConfig.uidcid + " "
                    + this.up[this.tableConfig.uidcid] + " " + JSON.stringify(this.up);
            return result === 1 ? this.up.mid.toString() : result;
        });
    }
    mUpdate(colp) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            colp = colp || this.up.cols || this.tableConfig.cols;
            if (this.up.pars.length < colp.length) {
                colp = colp.slice(0, this.up.pars.length);
            }
            const setClause = colp.map(col => `${col}=?`).join(',');
            const query = `UPDATE ${this.tableConfig.tbname} SET ${setClause}, upby=?, uptime=? WHERE id=? AND ${this.tableConfig.uidcid}=? LIMIT 1`;
            const values = this.up.pars.slice(0, colp.length);
            values.push(this.up.uname || '', this.up.utime, this.up.mid, this.up[this.tableConfig.uidcid]);
            const result = yield this.dbService.m(query, values, this.up, this.dbname);
            return result === 1 ? this.up.mid.toString() : result;
        });
    }
    midpk(colp) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const query = `SELECT id,idpk FROM ${this.tableConfig.tbname} WHERE idpk=? AND ${this.tableConfig.uidcid}=?`;
            const result = yield this.dbService.get(query, [this.up.midpk, this.up[this.tableConfig.uidcid]], this.up, this.dbname);
            if (result.length === 1) {
                this.up.midpk = result[0]["idpk"];
                return this.mUpdateIdpk(colp);
            }
            else {
                return (yield this.mAdd(colp)).toString();
            }
        });
    }
    m(colp) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const query = `SELECT id,idpk FROM ${this.tableConfig.tbname} WHERE id=? AND ${this.tableConfig.uidcid}=?`;
            const result = yield this.dbService.get(query, [this.up.mid, this.up[this.tableConfig.uidcid]], this.up, this.dbname);
            if (result.length === 1) {
                this.up.midpk = result[0]["idpk"];
                return this.mUpdateIdpk(colp);
            }
            else {
                return (yield this.mAdd(colp)).toString();
            }
        });
    }
    get(colp) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // colp现在控制WHERE条件字段名
            // up.pars控制WHERE条件的值
            // SELECT字段改为*
            colp = colp || this.up.cols || this.tableConfig.cols;
            if (this.up.pars.length < colp.length) {
                colp = colp.slice(0, this.up.pars.length);
            }
            let whereClause = `${this.tableConfig.uidcid}=?`;
            let queryParams = [this.up[this.tableConfig.uidcid]];
            if (colp && this.up.pars && colp.length > 0) {
                for (let i = 0; i < colp.length; i++) {
                    whereClause += ` AND ${colp[i]}=?`;
                    queryParams.push(this.up.pars[i]);
                }
            }
            const query = `SELECT *    FROM ${this.tableConfig.tbname} WHERE ${whereClause} ORDER BY ${this.up.order} LIMIT ${this.up.getstart}, ${this.up.getnumber}`;
            return this.dbService.get(query, queryParams, this.up, this.dbname);
        });
    }
    del() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const query = `DELETE FROM ${this.tableConfig.tbname} WHERE id=? AND ${this.tableConfig.uidcid}=? LIMIT 1`;
            const result = yield this.dbService.m(query, [this.up.mid, this.up[this.tableConfig.uidcid]], this.up, this.dbname);
            return result === 0 ? "err:没有行被修改" : this.up.mid.toString();
        });
    }
    createQueryBuilder() {
        return new QueryBuilder_1.QueryBuilder(this.tableConfig.cols);
    }
    /**
     * 没有办法获取ID的情况下 但第一个字段唯一
     * 示例 :第一个字段为唯一
     *   up = UpInfo.getMaster()
        up.cols=["card","lastval"]
        up.set_par(ts_code,price)
        tmp=await up.send_back("apistock/stock/stock_mine/mByFirstField", up)
     * @returns
     */
    mByFirstField(colp) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const firstField = this.tableConfig.cols[0];
            const firstFieldValue = this.up.pars[0];
            //console.log(`mByFirstField:` + this.up.debug + " " + this.up.uname + "  " + this.up.cid)
            const query = `SELECT id,idpk FROM ${this.tableConfig.tbname} WHERE ${firstField}=? AND ${this.tableConfig.uidcid}=?`;
            const result = yield this.dbService.get(query, [firstFieldValue, this.up[this.tableConfig.uidcid]], this.up, this.dbname);
            //console.log(`mByFirstField33:` + query + " " + this.up[this.tableConfig.uidcid] + " " + firstFieldValue + " " + JSON.stringify(result))
            if (result.length === 1) {
                this.up.mid = result[0]["id"];
                this.up.midpk = result[0]["idpk"];
                return this.mUpdateIdpk();
            }
            else {
                return (yield this.mAdd()).toString();
            }
        });
    }
}
tslib_1.__decorate([
    (0, decorators_1.ApiMethod)(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", Promise)
], Base78.prototype, "mUpdateElkByid", null);
tslib_1.__decorate([
    (0, decorators_1.ApiMethod)(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Array]),
    tslib_1.__metadata("design:returntype", Promise)
], Base78.prototype, "mUpdateMany", null);
tslib_1.__decorate([
    (0, decorators_1.ApiMethod)(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Array]),
    tslib_1.__metadata("design:returntype", Promise)
], Base78.prototype, "mAdd", null);
tslib_1.__decorate([
    (0, decorators_1.ApiMethod)(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Array]),
    tslib_1.__metadata("design:returntype", Promise)
], Base78.prototype, "mUpdateIdpk", null);
tslib_1.__decorate([
    (0, decorators_1.ApiMethod)(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Array]),
    tslib_1.__metadata("design:returntype", Promise)
], Base78.prototype, "mUpdate", null);
tslib_1.__decorate([
    (0, decorators_1.ApiMethod)(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Array]),
    tslib_1.__metadata("design:returntype", Promise)
], Base78.prototype, "midpk", null);
tslib_1.__decorate([
    (0, decorators_1.ApiMethod)(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Array]),
    tslib_1.__metadata("design:returntype", Promise)
], Base78.prototype, "m", null);
tslib_1.__decorate([
    (0, decorators_1.ApiMethod)(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Array]),
    tslib_1.__metadata("design:returntype", Promise)
], Base78.prototype, "get", null);
tslib_1.__decorate([
    (0, decorators_1.ApiMethod)(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", Promise)
], Base78.prototype, "del", null);
tslib_1.__decorate([
    (0, decorators_1.ApiMethod)(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Array]),
    tslib_1.__metadata("design:returntype", Promise)
], Base78.prototype, "mByFirstField", null);
exports.default = Base78;
class CidBase78 extends Base78 {
}
exports.CidBase78 = CidBase78;
class UidBase78 extends Base78 {
}
exports.UidBase78 = UidBase78;
//# sourceMappingURL=Base78.js.map