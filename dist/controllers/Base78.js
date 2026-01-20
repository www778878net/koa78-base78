"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UidBase78 = exports.CidBase78 = void 0;
const tslib_1 = require("tslib");
require("reflect-metadata");
const DatabaseService_1 = require("../services/DatabaseService");
const CacheService_1 = require("../services/CacheService");
const Config_1 = require("../config/Config");
const koa78_upinfo_1 = tslib_1.__importDefault(require("koa78-upinfo"));
const QueryBuilder_1 = require("../utils/QueryBuilder");
const decorators_1 = require("../interfaces/decorators");
const mylogger_1 = require("../utils/mylogger");
const elasticsearch78_1 = tslib_1.__importDefault(require("../services/elasticsearch78"));
const dayjs_1 = tslib_1.__importDefault(require("dayjs")); // 导入dayjs
/**
 * Base78 基础控制器类
 *
 * 重要说明：
 * 1. 所有修改类方法（增删改）必须以 'm' 开头（如 mAdd、mUpdate、mDel）
 * 2. 原因：某些浏览器会跟踪调度，可能重复发送请求，'m' 前缀用于防重机制
 * 3. 查询方法（get）根据业务需求决定是否需要防重
 * 4. 删除操作属于修改操作，必须使用 mDel 和 mDelMany
 */
class Base78 {
    constructor() {
        this.dbname = "default"; //mysql数据库名（非表名）
        // 新增：标识该表是否为管理员控制的全局表
        this.isadmin = false;
        // 使用 MyLogger，整库所有日志统一在 logs/koa78/base78_日期.log
        // myname: "base78" 固定，所有模块共用同一个文件
        // wfname: "koa78"，统一目录名
        this.logger = mylogger_1.MyLogger.getInstance("base78", 3, "koa78");
        this.logger.debug(`Base78 constructor called for ${this.constructor.name}`);
        this.tableConfig = this._loadConfig();
        this.tbname = this.constructor.name;
    }
    // 新增：设置分表配置的方法
    setShardingConfig(config) {
        this.shardingConfig = config;
    }
    // 新增：获取动态表名的方法
    getDynamicTableName() {
        if (!this.shardingConfig || this.shardingConfig.type === 'none') {
            return this.tableConfig.tbname;
        }
        const currentDate = (0, dayjs_1.default)();
        let dateSuffix;
        switch (this.shardingConfig.type) {
            case 'daily':
                dateSuffix = currentDate.format('YYYYMMDD');
                break;
            case 'monthly':
                dateSuffix = currentDate.format('YYYYMM');
                break;
            default:
                return this.tableConfig.tbname;
        }
        return `${this.tableConfig.tbname}_${dateSuffix}`;
    }
    // 新增：创建分表的方法
    createShardingTable(dateStr) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!this.shardingConfig || !this.shardingConfig.tableSQL) {
                throw new Error('分表建表SQL未定义');
            }
            const tableName = `${this.tableConfig.tbname}_${dateStr}`;
            // 替换SQL中的表名占位符（如果有的话）为实际的表名
            const sqlWithTableName = this.shardingConfig.tableSQL.replace(/\{TABLE_NAME\}/g, tableName);
            yield this.dbService.m(sqlWithTableName, [], this.up, this.dbname);
        });
    }
    // 新增：删除指定日期之前的分表
    dropOldShardingTable(daysAgo) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!this.shardingConfig) {
                return 0; // 没有配置分表，直接返回
            }
            let targetDate;
            if (this.shardingConfig.type === 'daily') {
                targetDate = (0, dayjs_1.default)().subtract(daysAgo, 'day').format('YYYYMMDD');
            }
            else if (this.shardingConfig.type === 'monthly') {
                targetDate = (0, dayjs_1.default)().subtract(daysAgo, 'month').format('YYYYMM');
            }
            else {
                return 0; // 不是分表类型，返回
            }
            const tableName = `${this.tableConfig.tbname}_${targetDate}`;
            const dropTableSQL = `DROP TABLE IF EXISTS \`${tableName}\``;
            try {
                // 先检查表是否存在
                const checkTableSQL = `SHOW TABLES LIKE '${tableName}'`;
                const tableExists = yield this.dbService.get(checkTableSQL, [], this.up, this.dbname);
                // 如果表不存在，直接返回0
                if (tableExists.length === 0) {
                    return 0;
                }
                yield this.dbService.m(dropTableSQL, [], this.up, this.dbname);
                return 1; // 成功删除返回1
            }
            catch (error) {
                this.logger.error(`删除表 ${tableName} 失败: ${error}`);
                return 0; // 删除失败返回0
            }
        });
    }
    // 新增：执行分表维护任务
    performShardingTableMaintenance() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!this.shardingConfig || this.shardingConfig.type === 'none') {
                return; // 如果没有启用分表，则不执行维护任务
            }
            const today = (0, dayjs_1.default)().format('YYYY-MM-DD');
            const retentionDays = this.shardingConfig.retentionDays || 5;
            // 如果今天已经执行过维护任务，则跳过
            if (Base78.lastMaintenanceDate === today) {
                return;
            }
            try {
                // 正常情况下：删除retentionDays天前的分表
                const dropResult = yield this.dropOldShardingTable(retentionDays);
                if (dropResult === 1) {
                    // 如果删除成功，只新建第retentionDays天的表
                    let futureDate;
                    if (this.shardingConfig.type === 'daily') {
                        futureDate = (0, dayjs_1.default)().add(retentionDays, 'day');
                    }
                    else { // monthly
                        futureDate = (0, dayjs_1.default)().add(retentionDays, 'month');
                    }
                    const dateStr = this.shardingConfig.type === 'daily' ?
                        futureDate.format('YYYYMMDD') :
                        futureDate.format('YYYYMM');
                    yield this.createShardingTable(dateStr);
                }
                else {
                    // 如果删除失败，新建从后退(retentionDays-1)天开始到未来retentionDays天的表
                    const pastDays = retentionDays - 1;
                    const futureDays = retentionDays;
                    for (let i = -pastDays; i <= futureDays; i++) {
                        let date;
                        if (this.shardingConfig.type === 'daily') {
                            date = (0, dayjs_1.default)().add(i, 'day');
                        }
                        else { // monthly
                            date = (0, dayjs_1.default)().add(i, 'month');
                        }
                        const dateStr = this.shardingConfig.type === 'daily' ?
                            date.format('YYYYMMDD') :
                            date.format('YYYYMM');
                        yield this.createShardingTable(dateStr);
                    }
                }
                // 更新最后维护日期
                Base78.lastMaintenanceDate = today;
            }
            catch (error) {
                this.logger.error(`执行分表维护任务失败: ${error}`);
            }
        });
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
    /**
  * 删除指定日期之前的日志表
  * @param daysAgo 距离今天多少天前的表
  * @returns Promise<number> 返回1表示删除成功，其他值表示删除失败
  */
    dropOldLogTable(daysAgo) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const targetDate = (0, dayjs_1.default)().subtract(daysAgo, 'day').format('YYYYMMDD');
            const tableName = `sys_log_${targetDate}`;
            const dropTableSQL = `DROP TABLE IF EXISTS \`${tableName}\``;
            try {
                // 先检查表是否存在
                const checkTableSQL = `SHOW TABLES LIKE '${tableName}'`;
                const tableExists = yield this.dbService.get(checkTableSQL, [], this.up);
                // 如果表不存在，直接返回0
                if (tableExists.length === 0) {
                    return 0;
                }
                yield this.dbService.m(dropTableSQL, [], this.up);
                return 1; // 成功删除返回1
            }
            catch (error) {
                this.logger.error(`删除表 ${tableName} 失败: ${error}`);
                return 0; // 删除失败返回0
            }
        });
    }
    mUpdateElkByid() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.checkAdminPermission();
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
    /**
     * 检查管理员权限
     * 如果 isadmin 为 true，则检查用户是否为管理员
     * @throws Error 如果不是管理员则抛出错误
     */
    checkAdminPermission() {
        var _a;
        if (this.isadmin) {
            const up = this.up;
            if ((up.cid !== this.config.get('cidvps') && up.cid !== this.config.get('cidmy')) && !((_a = up.uname) === null || _a === void 0 ? void 0 : _a.indexOf("sys"))) {
                throw new Error("err:只有管理员可以操作");
            }
        }
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
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const self = this;
            const up = self.up;
            // 防注入: 校验cid和uname
            this.checkAdminPermission();
            let colp = colpin || this.up.cols || self.tableConfig.colsImp; // 修改列
            let num = colp.length + 1; // 每组参数包含：业务字段 + idpk
            // 检查参数数量是否正确
            if (up.pars.length % num !== 0) {
                throw new Error('参数数量不正确，必须为(业务字段数 + 1)的整数倍');
            }
            const rowCount = up.pars.length / num;
            let idpkList = []; // 用于存储idpk列表
            let values = []; // 用于存储更新值
            let pars = []; // 最终的查询参数
            // 处理每一组参数并构建更新列表
            for (let i = 0; i < rowCount; i++) {
                const startIndex = i * num;
                const rowVals = up.pars.slice(startIndex, startIndex + num);
                idpkList.push(rowVals[num - 1]); // 获取idpk列表
                values.push(rowVals.slice(0, num - 1)); // 存储业务字段值
            }
            // 构建 SQL 查询
            let sb = `UPDATE ${self.getDynamicTableName()} SET `;
            for (let i = 0; i < colp.length; i++) {
                if (i > 0)
                    sb += `, `;
                sb += `\`${colp[i]}\` = CASE \`idpk\` `;
                for (let j = 0; j < idpkList.length; j++) {
                    sb += `WHEN ? THEN ? `;
                    pars.push(idpkList[j], values[j][i]); // 添加查询参数
                }
                sb += `END`;
            }
            // 添加 upby 和 uptime 字段
            sb += ", \`upby\` = ?, \`uptime\` = ? ";
            // 添加 where 子句
            sb += `WHERE \`idpk\` IN (${idpkList.map(() => '?').join(',')})`;
            pars.push(up.uname, up.utime, ...idpkList);
            // 执行更新操作
            try {
                const result = yield this.dbService.m(sb, pars, up, this.dbname);
                if (result.error) {
                    this._setBack(-1, result.error);
                    return result.error;
                }
                return result.affectedRows.toString();
            }
            catch (error) {
                throw new Error(`数据库操作失败: ${error.message}`);
            }
        });
    }
    mAdd(colp) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.checkAdminPermission();
            yield this.performShardingTableMaintenance();
            colp = colp || this.tableConfig.colsImp;
            if (this.up.pars.length < colp.length) {
                colp = colp.slice(0, this.up.pars.length);
            }
            const values = this.up.pars.slice(0, colp.length);
            values.push(koa78_upinfo_1.default.getNewid(), this.up.uname || '', this.up.utime, this.up[this.tableConfig.uidcid]);
            // 为所有字段名添加反引号
            const quotedColp = colp.map(col => `\`${col}\``);
            const query = `INSERT INTO ${this.getDynamicTableName()} (${quotedColp.join(',')},\`id\`,\`upby\`,\`uptime\`,\`${this.tableConfig.uidcid}\`) VALUES (${new Array(colp.length + 4).fill('?').join(',')})`; // 使用动态表名
            // 执行插入操作
            const result = yield this.dbService.mAdd(query, values, this.up, this.dbname);
            // 如果返回结果包含错误信息，设置 res 为负值并返回错误信息
            if (result.error) {
                this._setBack(-1, result.error);
                return result.error;
            }
            // 返回可直接在SQL客户端执行的完整SQL（带参数值）
            let sql = query;
            for (let i = 0; i < values.length; i++) {
                const val = values[i];
                const replacement = typeof val === 'string' ? `'${val.replace(/'/g, "''")}'` : val;
                sql = sql.replace('?', replacement);
            }
            return sql;
        });
    }
    mAddMany(colp) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.checkAdminPermission();
            yield this.performShardingTableMaintenance();
            colp = colp || this.tableConfig.colsImp;
            // 检查是否有足够的数据
            if (this.up.pars.length < colp.length) {
                throw new Error('insufficient parameters for mAddMany');
            }
            // 计算行数：前端必须包含 id 字段作为业务字段的一部分
            const totalPars = this.up.pars.length;
            const rowCount = Math.floor(totalPars / colp.length);
            if (rowCount === 0) {
                throw new Error('no data to insert');
            }
            // 检查是否有余数（参数数量必须是 colp.length 的整数倍）
            if (totalPars % colp.length !== 0) {
                throw new Error('parameters count must be multiple of column count');
            }
            // 为所有字段名添加反引号
            const quotedColp = colp.map(col => `\`${col}\``);
            // 每行实际需要的参数数：业务字段 + id + 3个系统字段（upby, uptime, uidcid）
            const fieldsPerRow = colp.length + 4;
            // 构建 SQL：自动添加 id 字段
            const query = `INSERT INTO ${this.getDynamicTableName()} (${quotedColp.join(',')},\`id\`,\`upby\`,\`uptime\`,\`${this.tableConfig.uidcid}\`) VALUES ${new Array(rowCount).fill(`(${new Array(fieldsPerRow).fill('?').join(',')})`).join(',')}`;
            // 构建参数数组
            const values = [];
            for (let i = 0; i < rowCount; i++) {
                const startIndex = i * colp.length;
                const rowValues = this.up.pars.slice(startIndex, startIndex + colp.length);
                // 添加业务字段值
                values.push(...rowValues);
                // 为每条记录自动生成 UUID id
                values.push(koa78_upinfo_1.default.getNewid());
                // 添加系统字段值（每行都相同）
                values.push(this.up.uname || '', this.up.utime, this.up[this.tableConfig.uidcid]);
            }
            const result = yield this.dbService.m(query, values, this.up, this.dbname);
            // 如果返回结果包含错误信息，设置 res 为负值并返回受影响行数（0）
            if (result.error) {
                this._setBack(-1, result.error);
                return 0;
            }
            return result.affectedRows;
        });
    }
    mUpdateIdpk(colp) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.checkAdminPermission();
            colp = colp || this.up.cols || this.tableConfig.colsImp;
            if (this.up.pars.length < colp.length) {
                colp = colp.slice(0, this.up.pars.length);
            }
            const setClause = colp.map(col => `\`${col}\`=?`).join(',');
            const query = `UPDATE ${this.getDynamicTableName()} SET ${setClause}, \`upby\`=?, \`uptime\`=? WHERE \`idpk\`=? AND \`${this.tableConfig.uidcid}\`=? LIMIT 1`; // 使用动态表名
            const values = this.up.pars.slice(0, colp.length);
            values.push(this.up.uname || '', this.up.utime, this.up.midpk.toString(), this.up[this.tableConfig.uidcid]);
            const result = yield this.dbService.m(query, values, this.up, this.dbname);
            if (result.error) {
                this._setBack(-1, result.error);
                return result.error;
            }
            if (result.affectedRows == 0)
                return this.up.midpk.toString() + " " + this.tableConfig.uidcid + " "
                    + this.up[this.tableConfig.uidcid] + " " + JSON.stringify(this.up);
            return result.affectedRows === 1 ? this.up.mid.toString() : result.affectedRows.toString();
        });
    }
    mUpdate(colp) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.checkAdminPermission();
            colp = colp || this.up.cols || this.tableConfig.cols;
            if (this.up.pars.length < colp.length) {
                colp = colp.slice(0, this.up.pars.length);
            }
            // 先查询 idpk，避免死锁
            const queryIdpk = `SELECT \`idpk\` FROM ${this.getDynamicTableName()} WHERE \`id\`=? AND \`${this.tableConfig.uidcid}\`=? LIMIT 1 FOR UPDATE`;
            const idpkResult = yield this.dbService.get(queryIdpk, [this.up.mid, this.up[this.tableConfig.uidcid]], this.up, this.dbname);
            if (idpkResult.length === 0) {
                return "err:记录不存在";
            }
            const idpk = idpkResult[0]["idpk"];
            const setClause = colp.map(col => `\`${col}\`=?`).join(',');
            const query = `UPDATE ${this.getDynamicTableName()} SET ${setClause}, \`upby\`=?, \`uptime\`=? WHERE \`idpk\`=? LIMIT 1`; // 使用 idpk 进行更新
            const values = this.up.pars.slice(0, colp.length);
            values.push(this.up.uname || '', this.up.utime, idpk);
            const result = yield this.dbService.m(query, values, this.up, this.dbname);
            if (result.error) {
                this._setBack(-1, result.error);
                return result.error;
            }
            return result.affectedRows === 1 ? this.up.mid.toString() : result.affectedRows.toString();
        });
    }
    midpk(colp) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.checkAdminPermission();
            const query = `SELECT \`id\`,\`idpk\` FROM ${this.getDynamicTableName()} WHERE \`idpk\`=? AND \`${this.tableConfig.uidcid}\`=?`; // 使用动态表名
            const result = yield this.dbService.get(query, [this.up.midpk, this.up[this.tableConfig.uidcid]], this.up, this.dbname);
            if (result.length === 1) {
                this.up.midpk = result[0]["idpk"];
                return this.mUpdateIdpk(colp);
            }
            else {
                return yield this.mAdd(colp);
            }
        });
    }
    m(colp) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.checkAdminPermission();
            const query = `SELECT \`id\`,\`idpk\` FROM ${this.getDynamicTableName()} WHERE \`id\`=? AND \`${this.tableConfig.uidcid}\`=?`; // 使用动态表名
            const result = yield this.dbService.get(query, [this.up.mid, this.up[this.tableConfig.uidcid]], this.up, this.dbname);
            if (result.length === 1) {
                this.up.midpk = result[0]["idpk"];
                return this.mUpdateIdpk(colp);
            }
            else {
                return yield this.mAdd(colp);
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
            let whereClause = `\`${this.tableConfig.uidcid}\`=?`;
            let queryParams = [this.up[this.tableConfig.uidcid]];
            if (colp && this.up.pars && colp.length > 0) {
                for (let i = 0; i < colp.length; i++) {
                    whereClause += ` AND \`${colp[i]}\`=?`;
                    queryParams.push(this.up.pars[i]);
                }
            }
            const query = `SELECT *    FROM ${this.getDynamicTableName()} WHERE ${whereClause} ORDER BY ${this.up.order} LIMIT ${this.up.getstart}, ${this.up.getnumber}`; // 使用动态表名
            return this.dbService.get(query, queryParams, this.up, this.dbname);
        });
    }
    mdel() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.checkAdminPermission();
            // 先查询 idpk（使用 FOR UPDATE 加锁，避免死锁）
            const queryIdpk = `SELECT \`idpk\` FROM ${this.getDynamicTableName()} WHERE \`id\`=? AND \`${this.tableConfig.uidcid}\`=? LIMIT 1 FOR UPDATE`;
            const idpkResult = yield this.dbService.get(queryIdpk, [this.up.mid, this.up[this.tableConfig.uidcid]], this.up, this.dbname);
            if (idpkResult.length === 0) {
                return "err:记录不存在";
            }
            const idpk = idpkResult[0]["idpk"];
            const query = `DELETE FROM ${this.getDynamicTableName()} WHERE \`idpk\`=? LIMIT 1`; // 使用 idpk 进行删除
            const result = yield this.dbService.m(query, [idpk], this.up, this.dbname);
            if (result.error) {
                this._setBack(-1, result.error);
                return result.error;
            }
            return result.affectedRows === 0 ? "err:没有行被修改" : this.up.mid.toString();
        });
    }
    mdelmany() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // 防注入: 校验cid和uname
            this.checkAdminPermission();
            // 检查参数
            if (this.up.pars.length === 0) {
                throw new Error('参数不能为空');
            }
            // up.pars 包含 idpk 数组
            const idpkList = this.up.pars;
            // 构建 SQL 查询
            const query = `DELETE FROM ${this.getDynamicTableName()} WHERE \`idpk\` IN (${idpkList.map(() => '?').join(',')})`;
            // 执行删除操作
            try {
                const result = yield this.dbService.m(query, idpkList, this.up, this.dbname);
                if (result.error) {
                    this._setBack(-1, result.error);
                    return result.error;
                }
                return result.affectedRows.toString();
            }
            catch (error) {
                throw new Error(`数据库操作失败: ${error.message}`);
            }
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
            this.checkAdminPermission();
            const firstField = this.tableConfig.cols[0];
            const firstFieldValue = this.up.pars[0];
            //console.log(`mByFirstField:` + this.up.debug + " " + this.up.uname + "  " + this.up.cid)
            const query = `SELECT \`id\`,\`idpk\` FROM ${this.getDynamicTableName()} WHERE \`${firstField}\`=? AND \`${this.tableConfig.uidcid}\`=?`; // 使用动态表名
            const result = yield this.dbService.get(query, [firstFieldValue, this.up[this.tableConfig.uidcid]], this.up, this.dbname);
            //console.log(`mByFirstField33:` + query + " " + this.up[this.tableConfig.uidcid] + " " + firstFieldValue + " " + JSON.stringify(result))
            if (result.length === 1) {
                this.up.mid = result[0]["id"];
                this.up.midpk = result[0]["idpk"];
                return this.mUpdateIdpk();
            }
            else {
                return yield this.mAdd(colp);
            }
        });
    }
}
//维护命令一天执行一次
Base78.lastMaintenanceDate = '';
exports.default = Base78;
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
], Base78.prototype, "mAddMany", null);
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
], Base78.prototype, "mdel", null);
tslib_1.__decorate([
    (0, decorators_1.ApiMethod)(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", Promise)
], Base78.prototype, "mdelmany", null);
tslib_1.__decorate([
    (0, decorators_1.ApiMethod)(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Array]),
    tslib_1.__metadata("design:returntype", Promise)
], Base78.prototype, "mByFirstField", null);
class CidBase78 extends Base78 {
}
exports.CidBase78 = CidBase78;
class UidBase78 extends Base78 {
}
exports.UidBase78 = UidBase78;
//# sourceMappingURL=Base78.js.map