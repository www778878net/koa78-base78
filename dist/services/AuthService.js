"use strict";
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const tslib_1 = require("tslib");
const zod_1 = require("zod");
const ContainerManager_1 = require("../ContainerManager");
const Config_1 = require("../config/Config");
class AuthService {
    constructor() {
        this.log = null;
        this.dbService = null;
        this.cacheService = null;
        // 使用新的日志服务方式
        this.log = ContainerManager_1.ContainerManager.getLogger();
    }
    // 初始化方法，用于设置依赖项
    init(dbService, cacheService) {
        this.dbService = dbService;
        this.cacheService = cacheService;
    }
    static get CID_MY() {
        if (AuthService_1._CID_MY === null) {
            AuthService_1._CID_MY = AuthService_1.getCidMyFromConfig();
        }
        return AuthService_1._CID_MY;
    }
    static getCidMyFromConfig() {
        try {
            // 检查全局容器是否存在
            const globalAny = global;
            if (globalAny.appContainer) {
                // 通过容器获取Config实例
                const config = globalAny.appContainer.get(Config_1.Config);
                const cidMyFromConfig = config.get('cidmy');
                // 如果配置中有cidmy且不为空，则使用配置中的值
                if (cidMyFromConfig && typeof cidMyFromConfig === 'string' && cidMyFromConfig.length > 0) {
                    return cidMyFromConfig;
                }
            }
        }
        catch (error) {
            // 获取配置失败时使用默认值
            console.warn('Failed to get cidmy from config, using default value:', error);
        }
        // 默认值
        return "d4856531-e9d3-20f3-4c22-fe3c65fb009c";
    }
    static getInstance() {
        if (!AuthService_1.instance) {
            const globalAny = global;
            if (globalAny.appContainer) {
                AuthService_1.instance = globalAny.appContainer.get(AuthService_1);
            }
            else {
                throw new Error('App container not found');
            }
        }
        return AuthService_1.instance;
    }
    upcheck(up, cols, dbname) {
        var _a, _b, _c, _d;
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (up.errmsg === "ok") {
                return "ok";
            }
            const sidSchema = zod_1.z.string().length(36);
            const bcidSchema = zod_1.z.string().length(36).refine(val => val.indexOf("-") === 8 && val.indexOf("-", 19) === 23);
            const midSchema = zod_1.z.string().length(36);
            const numericSchema = zod_1.z.string().regex(/^\d+$/);
            this.log.debug(`upcheck sid: ${JSON.stringify(up)}`);
            try {
                sidSchema.parse(up.sid);
            }
            catch (error) {
                throw new Error(`sid 参数验证失败: ${up.sid}, ${error.message}`);
            }
            if (up.bcid) {
                try {
                    bcidSchema.parse(up.bcid);
                }
                catch (error) {
                    throw new Error(`bcid 参数验证失败: ${up.bcid}, ${error.message}`);
                }
            }
            try {
                midSchema.parse(up.mid);
            }
            catch (error) {
                throw new Error(`mid 参数验证失败: ${up.mid}, ${error.message}`);
            }
            try {
                numericSchema.parse(up.getstart.toString());
            }
            catch (error) {
                throw new Error(`getstart 参数验证失败: ${up.getstart}, ${error.message}`);
            }
            try {
                numericSchema.parse(up.getnumber.toString());
            }
            catch (error) {
                throw new Error(`getnumber 参数验证失败: ${up.getnumber}, ${error.message}`);
            }
            if (!up.inOrder(cols)) {
                throw new Error("up order err:" + up.order);
            }
            const checkColsResult = up.checkCols(cols);
            if (checkColsResult !== "checkcolsallok") {
                throw new Error("checkCols err:" + checkColsResult + JSON.stringify(up.cols));
            }
            if (!up.cols || up.cols.length === 0 || (up.cols.length === 1 && (up.cols[0] === "all" || up.cols[0] === "")))
                up.cols = cols;
            let mem_sid = "lovers_sid2_";
            let tmp = yield ((_a = this.cacheService) === null || _a === void 0 ? void 0 : _a.tbget(mem_sid + dbname + up.sid, up.debug));
            if (tmp === "pool null")
                tmp = "";
            if (!tmp) {
                let cmdtext = `
                SELECT l.*, la.sid_web_date, la.sid, la.sid_web, c.coname, c.uid as idceo, c.id as cid 
                FROM lovers l
                JOIN lovers_auth la ON l.idpk = la.ikuser
                LEFT JOIN companysuser cu ON cu.uid = l.id AND cu.cid = l.idcodef
                LEFT JOIN companys c ON l.idcodef = c.id
                WHERE la.sid = ? OR la.sid_web = ?
            `;
                if (dbname != "default")
                    cmdtext = "select t1.* ,companys.coname,companys.uid as idceo,companys.id as cid  from    (SELECT uname,pwd,id,upby,uptime,sid_web_date,  " +
                        "  idcoDef,openweixin ,truename,idpk   FROM lovers Where sid=? or sid_web=?)as t1 LEFT JOIN `companysuser` as t2 on" +
                        " t2.uid=t1.id and t2.cid=t1.idcodef left join companys    on t2.cid=companys.id";
                const values = [up.sid, up.sid];
                const result = yield ((_b = this.dbService) === null || _b === void 0 ? void 0 : _b.get(cmdtext, values, up, dbname));
                (_c = this.log) === null || _c === void 0 ? void 0 : _c.debug("upcheck result:", result);
                if ((result === null || result === void 0 ? void 0 : result.length) === 0)
                    tmp = "";
                else {
                    tmp = result[0];
                    yield ((_d = this.cacheService) === null || _d === void 0 ? void 0 : _d.tbset(mem_sid + dbname + up.sid, tmp));
                }
            }
            if (tmp) {
                up.uid = tmp["id"];
                up.uname = tmp["uname"];
                up.cid = tmp["cid"];
                up.coname = tmp["coname"];
                up.idceo = tmp["idceo"];
                up.weixin = tmp["openweixin"];
                up.truename = tmp["truename"];
                up.idpk = tmp["idpk"];
                up.mobile = tmp["mobile"];
                if (up.uname === "sysadmin") {
                    up.debug = true;
                }
                up.bcid = up.bcid || up.cid;
                up.errmsg = "ok";
                return "ok";
            }
            else {
                throw new Error("err:get u info err3" + dbname + " " + up.sid);
            }
        });
    }
    preventReplayAttack(up) {
        var _a, _b;
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const cacheKey = up.ctx.request.path + up.cache;
            const existingCache = yield ((_a = this.cacheService) === null || _a === void 0 ? void 0 : _a.get(cacheKey));
            if (existingCache) {
                throw new Error("防止重放攻击" + cacheKey);
            }
            yield ((_b = this.cacheService) === null || _b === void 0 ? void 0 : _b.set(cacheKey, 1, 2));
        });
    }
}
exports.AuthService = AuthService;
AuthService._CID_MY = null;
AuthService.CID_GUEST = "GUEST000-8888-8888-8888-GUEST00GUEST";
AuthService.instance = null;
//# sourceMappingURL=AuthService.js.map