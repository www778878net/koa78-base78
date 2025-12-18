"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
// @ts-ignore
const sqlite3_1 = tslib_1.__importDefault(require("sqlite3"));
// @ts-ignore
const sqlite_1 = require("sqlite");
const koa78_upinfo_1 = tslib_1.__importDefault(require("koa78-upinfo"));
const tslog78_1 = tslib_1.__importDefault(require("tslog78"));
// @ts-ignore
const md5_1 = tslib_1.__importDefault(require("md5"));
/**
 * SQLite数据库操作类
 * 参考Mysql78类实现
 */
class Sqlite78 {
    constructor(config) {
        var _a, _b;
        this._db = null;
        this._filename = '';
        this.isLog = false;
        this.isCount = false;
        this.log = tslog78_1.default.Instance;
        this.warnHandler = null;
        // 设置重试次数和重试延迟
        this.maxRetryAttempts = 3;
        this.retryDelayMs = 1000; // 1秒延迟
        if (!config)
            return;
        this._filename = config.filename;
        this.isLog = (_a = config.isLog) !== null && _a !== void 0 ? _a : false; // 是否打印日志（影响性能）
        this.isCount = (_b = config.isCount) !== null && _b !== void 0 ? _b : false; // 是否统计效率（影响性能）
    }
    /**
     * 初始化数据库连接
     */
    initialize() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                this._db = yield (0, sqlite_1.open)({
                    filename: this._filename,
                    driver: sqlite3_1.default.Database
                });
                // 启用外键约束
                yield this._db.run('PRAGMA foreign_keys = ON');
                // 设置WAL模式以提高并发性能
                yield this._db.run('PRAGMA journal_mode = WAL');
            }
            catch (err) {
                this.log.error(err, 'sqlite_initialize');
                throw err;
            }
        });
    }
    /**
     * 创建系统常用表
     * Create system common table
     */
    creatTb(up) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!this._db) {
                return 'database not initialized';
            }
            const cmdtext1 = `CREATE TABLE IF NOT EXISTS sys_warn (
            uid TEXT NOT NULL DEFAULT '',
            kind TEXT NOT NULL DEFAULT '',
            apisys TEXT NOT NULL DEFAULT '',
            apiobj TEXT NOT NULL DEFAULT '',
            content TEXT NOT NULL,
            upid TEXT NOT NULL DEFAULT '',
            upby TEXT DEFAULT '',
            uptime DATETIME NOT NULL,
            idpk INTEGER PRIMARY KEY AUTOINCREMENT,
            id TEXT NOT NULL,
            remark TEXT NOT NULL DEFAULT '',
            remark2 TEXT NOT NULL DEFAULT '',
            remark3 TEXT NOT NULL DEFAULT '',
            remark4 TEXT NOT NULL DEFAULT '',
            remark5 TEXT NOT NULL DEFAULT '',
            remark6 TEXT NOT NULL DEFAULT ''
        )`;
            const cmdtext2 = `CREATE TABLE IF NOT EXISTS sys_sql (
            cid TEXT NOT NULL DEFAULT '',
            apiv TEXT NOT NULL DEFAULT '',
            apisys TEXT NOT NULL DEFAULT '',
            apiobj TEXT NOT NULL DEFAULT '',
            cmdtext TEXT NOT NULL,
            uname TEXT NOT NULL DEFAULT '',
            num INTEGER NOT NULL DEFAULT 0,
            dlong INTEGER NOT NULL DEFAULT 0,
            downlen INTEGER NOT NULL DEFAULT 0,
            upby TEXT NOT NULL DEFAULT '',
            cmdtextmd5 TEXT NOT NULL DEFAULT '',
            uptime DATETIME NOT NULL,
            idpk INTEGER PRIMARY KEY AUTOINCREMENT,
            id TEXT NOT NULL,
            remark TEXT NOT NULL DEFAULT '',
            remark2 TEXT NOT NULL DEFAULT '',
            remark3 TEXT NOT NULL DEFAULT '',
            remark4 TEXT NOT NULL DEFAULT '',
            remark5 TEXT NOT NULL DEFAULT '',
            remark6 TEXT NOT NULL DEFAULT '',
            UNIQUE(apiv, apisys, apiobj, cmdtext)
        )`;
            try {
                yield this._db.run(cmdtext1);
                yield this._db.run(cmdtext2);
                return 'ok';
            }
            catch (err) {
                this.log.error(err);
                return 'error';
            }
        });
    }
    /**
     * SQL查询方法
     * @param cmdtext SQL语句
     * @param values 参数值
     * @param up 用户信息
     */
    doGet(cmdtext, values, up) {
        var _a;
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!this._db) {
                return [];
            }
            const debug = (_a = up.debug) !== null && _a !== void 0 ? _a : false;
            const dstart = new Date();
            try {
                // SQLite的占位符是?，不需要转换
                const stmt = yield this._db.prepare(cmdtext);
                const rows = yield stmt.all(values);
                yield stmt.finalize();
                if (debug) {
                    this._addWarn(JSON.stringify(rows) + " c:" + cmdtext + " v" + values.join(","), "debug_" + up.apisys, up);
                }
                const lendown = JSON.stringify(rows).length;
                this._saveLog(cmdtext, values, new Date().getTime() - dstart.getTime(), lendown, up);
                return rows;
            }
            catch (err) {
                this._addWarn(JSON.stringify(err) + " c:" + cmdtext + " v" + values.join(","), "err_" + up.apisys, up);
                this.log.error(err, 'sqlite_doGet');
                throw err;
            }
        });
    }
    /**
     * 执行事务
     * @param cmds SQL语句数组
     * @param values 参数值二维数组
     * @param errtexts 错误文本数组
     * @param logtext 日志文本
     * @param logvalue 日志参数
     * @param up 用户信息
     */
    doT(cmds, values, errtexts, logtext, logvalue, up) {
        var _a;
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!this._db) {
                return 'database not initialized';
            }
            const debug = (_a = up.debug) !== null && _a !== void 0 ? _a : false;
            const dstart = new Date();
            try {
                // 开始事务
                yield this._db.run('BEGIN TRANSACTION');
                const results = [];
                for (let i = 0; i < cmds.length; i++) {
                    const stmt = yield this._db.prepare(cmds[i]);
                    const result = yield stmt.run(values[i]);
                    yield stmt.finalize();
                    results.push(result);
                }
                let errmsg = "err!";
                let haveAff0 = false;
                for (let i = 0; i < results.length; i++) {
                    if (results[i].changes === 0) {
                        errmsg += errtexts[i];
                        haveAff0 = true;
                        break;
                    }
                }
                if (haveAff0 || results.length < cmds.length) {
                    yield this._db.run('ROLLBACK');
                    return errmsg;
                }
                yield this._db.run('COMMIT');
                this._saveLog(logtext, logvalue, new Date().getTime() - dstart.getTime(), 1, up);
                return "ok";
            }
            catch (err) {
                try {
                    yield this._db.run('ROLLBACK');
                }
                catch (rollbackErr) {
                    this.log.error(rollbackErr, 'sqlite_doT_rollback');
                }
                this.log.error(err, 'sqlite_doT');
                return 'error';
            }
        });
    }
    /**
     * SQL更新方法，返回受影响的行数
     * @param cmdtext SQL语句
     * @param values 参数值
     * @param up 用户信息
     */
    doM(cmdtext, values, up) {
        var _a;
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!this._db) {
                return 0;
            }
            const debug = (_a = up.debug) !== null && _a !== void 0 ? _a : false;
            const dstart = new Date();
            try {
                const stmt = yield this._db.prepare(cmdtext);
                const result = yield stmt.run(values);
                yield stmt.finalize();
                if (debug) {
                    this._addWarn(JSON.stringify(result) + " c:" + cmdtext + " v" + values.join(","), "debug_" + up.apisys, up);
                }
                const lendown = JSON.stringify(result).length;
                this._saveLog(cmdtext, values, new Date().getTime() - dstart.getTime(), lendown, up);
                return result.changes;
            }
            catch (err) {
                this._addWarn(JSON.stringify(err) + " c:" + cmdtext + " v" + values.join(","), "err" + up.apisys, up);
                this.log.error(err, 'sqlite_doM');
                return -1;
            }
        });
    }
    /**
     * 插入数据，返回插入的行ID
     * @param cmdtext SQL语句
     * @param values 参数值
     * @param up 用户信息
     */
    doMAdd(cmdtext, values, up) {
        var _a;
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!this._db) {
                return 0;
            }
            const debug = (_a = up.debug) !== null && _a !== void 0 ? _a : false;
            const dstart = new Date();
            try {
                const stmt = yield this._db.prepare(cmdtext);
                const result = yield stmt.run(values);
                yield stmt.finalize();
                if (debug) {
                    this._addWarn(JSON.stringify(result) + " c:" + cmdtext + " v" + values.join(","), "debug_" + up.apisys, up);
                }
                const lendown = JSON.stringify(result).length;
                this._saveLog(cmdtext, values, new Date().getTime() - dstart.getTime(), lendown, up);
                return result.lastID;
            }
            catch (err) {
                this._addWarn(JSON.stringify(err) + " c:" + cmdtext + " v" + values.join(","), "err" + up.apisys, up);
                this.log.error(err, 'sqlite_doMAdd');
                return 0;
            }
        });
    }
    /**
     * 设置警告处理器
     * @param handler 处理警告的函数
     */
    setWarnHandler(handler) {
        this.warnHandler = handler;
    }
    /**
     * 调试函数，用于跟踪SQL调用的在线调试问题
     * 可以设置跟踪用户、表、目录或函数等
     * 开启会影响性能，建议主要用于跟踪开发者和正在开发的目录
     * 如果设置了自定义的warnHandler，将优先使用它处理警告
     * 否则，将警告信息插入sys_warn表
     * @param info 日志信息
     * @param kind 日志类型
     * @param up 用户上传信息
     */
    _addWarn(info, kind, up) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (this.warnHandler) {
                try {
                    return yield this.warnHandler(info, kind, up);
                }
                catch (err) {
                    this.log.error(err, 'sqlite__addWarn_handler');
                }
            }
            if (!this._db || !this.isLog) {
                return this.isLog ? 'database not initialized' : 'isLog is false';
            }
            const cmdtext = 'INSERT INTO sys_warn (kind,apisys,apiobj,content,upby,uptime,id,upid)VALUES(?,?,?,?,?,?,?,?)';
            const values = [kind, up.apisys, up.apiobj, info, up.uname, up.uptime, koa78_upinfo_1.default.getNewid(), up.upid];
            try {
                const stmt = yield this._db.prepare(cmdtext);
                const result = yield stmt.run(values);
                yield stmt.finalize();
                return result.changes;
            }
            catch (err) {
                this.log.error(err, 'sqlite__addWarn');
                return 0;
            }
        });
    }
    /**
     * 如果开启了SYS_SQL表功能，会影响性能
     * @param cmdtext SQL语句
     * @param values 参数值
     * @param dlong 执行时间
     * @param lendown 下载字节数
     * @param up 用户信息
     */
    _saveLog(cmdtext, values, dlong, lendown, up) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!this.isCount || !this._db) {
                return this.isCount ? 'database not initialized' : 'isCount is false';
            }
            const cmdtextmd5 = (0, md5_1.default)(cmdtext);
            const sb = `INSERT OR IGNORE INTO sys_sql(apiv,apisys,apiobj,cmdtext,num,dlong,downlen,id,uptime,cmdtextmd5)VALUES(?,?,?,?,?,?,?,?,?,?)`;
            try {
                const stmt = yield this._db.prepare(sb);
                yield stmt.run([
                    up.v, up.apisys, up.apiobj, cmdtext, 1, dlong, lendown, koa78_upinfo_1.default.getNewid(), new Date(), cmdtextmd5
                ]);
                yield stmt.finalize();
                // 更新计数器
                const updateStmt = yield this._db.prepare('UPDATE sys_sql SET num=num+1,dlong=dlong+?,downlen=downlen+? WHERE cmdtextmd5=?');
                yield updateStmt.run([dlong, lendown, cmdtextmd5]);
                yield updateStmt.finalize();
                return 'ok';
            }
            catch (err) {
                this.log.error(err);
                return 'error';
            }
        });
    }
    /**
     * 关闭数据库连接
     */
    close() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (this._db) {
                yield this._db.close();
            }
        });
    }
}
exports.default = Sqlite78;
//# sourceMappingURL=Sqlite78.js.map