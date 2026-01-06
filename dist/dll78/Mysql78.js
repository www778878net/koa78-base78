"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const mysql = tslib_1.__importStar(require("mysql2/promise"));
const koa78_upinfo_1 = tslib_1.__importDefault(require("koa78-upinfo"));
const tslog78_1 = tslib_1.__importDefault(require("tslog78"));
const md5_1 = tslib_1.__importDefault(require("md5"));
/**
 * 如果不行就回退到2.4.0
 */
class Mysql78 {
    constructor(config) {
        var _a, _b, _c, _d, _e, _f;
        this._statementCache = new Map();
        this._pool = null;
        this._host = '';
        this.isLog = false;
        this.isCount = false;
        this.log = tslog78_1.default.Instance;
        this.warnHandler = null;
        // 设置重试次数和重试延迟
        this.maxRetryAttempts = 3;
        this.retryDelayMs = 1000; // 1秒延迟
        if (!config)
            return;
        this._host = (_a = config.host) !== null && _a !== void 0 ? _a : '127.0.0.1';
        const port = (_b = config.port) !== null && _b !== void 0 ? _b : 3306; // 端口
        const max = (_c = config.max) !== null && _c !== void 0 ? _c : 10; // 最大线程数
        const user = (_d = config.user) !== null && _d !== void 0 ? _d : 'root'; // mysql用户名
        this.isLog = (_e = config.isLog) !== null && _e !== void 0 ? _e : false; // 是否打印日志（影响性能）
        this.isCount = (_f = config.isCount) !== null && _f !== void 0 ? _f : false; // 是否统计效率（影响性能）
        this._pool = mysql.createPool({
            connectionLimit: max,
            host: this._host,
            port,
            user,
            password: config.password,
            database: config.database,
            dateStrings: true,
            connectTimeout: 30 * 1000,
            waitForConnections: true, // 等待连接池中的连接可用
        });
    }
    // 延迟函数
    delay(ms) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return new Promise(resolve => setTimeout(resolve, ms));
        });
    }
    // 获取连接，并在发生错误时重试
    getConnectionWithRetry() {
        var _a;
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let attempts = 0;
            while (attempts < this.maxRetryAttempts) {
                try {
                    const connection = yield ((_a = this._pool) === null || _a === void 0 ? void 0 : _a.getConnection());
                    if (connection === undefined) {
                        return null; // Explicitly return null if connection is undefined
                    }
                    return connection;
                }
                catch (err) {
                    attempts++;
                    this.log.error(`Connection attempt ${attempts} failed:`, err);
                    if (attempts >= this.maxRetryAttempts) {
                        throw err;
                    }
                    yield this.delay(this.retryDelayMs);
                }
            }
            return null;
        });
    }
    // 重试函数的包装：用于 `doGet`、`doM`、`doT` 等方法
    retryOperation(operation) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let attempts = 0;
            while (attempts < this.maxRetryAttempts) {
                try {
                    return yield operation();
                }
                catch (err) {
                    attempts++;
                    this.log.error(`Operation attempt ${attempts} failed:`, err);
                    if (attempts >= this.maxRetryAttempts) {
                        throw err;
                    }
                    yield this.delay(this.retryDelayMs);
                }
            }
            throw new Error("Max retry attempts reached.");
        });
    }
    /**
     * 创建系统常用表
     * Create system common table
     *
     * */
    creatTb(up) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!this._pool) {
                return 'pool null';
            }
            const cmdtext1 = "CREATE TABLE IF NOT EXISTS `sys_warn` (  `uid` varchar(36) NOT NULL DEFAULT '',  `kind` varchar(100) NOT NULL DEFAULT '',  `apisys` varchar(100) NOT NULL DEFAULT '',  `apiobj` varchar(100) NOT NULL DEFAULT '',  `content` text NOT NULL,  `upid` varchar(36) NOT NULL DEFAULT '',  `upby` varchar(50) DEFAULT '',  `uptime` datetime NOT NULL,  `idpk` int(11) NOT NULL AUTO_INCREMENT,  `id` varchar(36) NOT NULL,  `remark` varchar(200) NOT NULL DEFAULT '',  `remark2` varchar(200) NOT NULL DEFAULT '',  `remark3` varchar(200) NOT NULL DEFAULT '',  `remark4` varchar(200) NOT NULL DEFAULT '',  `remark5` varchar(200) NOT NULL DEFAULT '',  `remark6` varchar(200) NOT NULL DEFAULT '',  PRIMARY KEY (`idpk`)) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=utf8;";
            const cmdtext2 = "CREATE TABLE IF NOT EXISTS `sys_sql` (  `cid` varchar(36) NOT NULL DEFAULT '',  `apiv` varchar(50) NOT NULL DEFAULT '',  `apisys` varchar(50) NOT NULL DEFAULT '',  `apiobj` varchar(50) NOT NULL DEFAULT '',  `cmdtext` varchar(200) NOT NULL,  `uname` varchar(50) NOT NULL DEFAULT '',  `num` int(11) NOT NULL DEFAULT '0',  `dlong` int(32) NOT NULL DEFAULT '0',  `downlen` bigint NOT NULL DEFAULT '0',  `upby` varchar(50) NOT NULL DEFAULT '',  `cmdtextmd5` varchar(50) NOT NULL DEFAULT '',  `uptime` datetime NOT NULL,  `idpk` int(11) NOT NULL AUTO_INCREMENT,  `id` varchar(36) NOT NULL,  `remark` varchar(200) NOT NULL DEFAULT '',  `remark2` varchar(200) NOT NULL DEFAULT '',  `remark3` varchar(200) NOT NULL DEFAULT '',  `remark4` varchar(200) NOT NULL DEFAULT '',  `remark5` varchar(200) NOT NULL DEFAULT '',  `remark6` varchar(200) NOT NULL DEFAULT '',  PRIMARY KEY (`idpk`),  UNIQUE KEY `u_v_sys_obj_cmdtext` (`apiv`,`apisys`,`apiobj`,`cmdtext`) USING BTREE) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=utf8;";
            try {
                yield this._pool.execute(cmdtext1);
                yield this._pool.execute(cmdtext2);
                return 'ok';
            }
            catch (err) {
                this.log.error(err);
                return 'error';
            }
        });
    }
    getStatement(connection, cmdtext) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const cacheKey = `${connection.threadId}:${cmdtext}`;
            if (this._statementCache.has(cacheKey)) {
                return this._statementCache.get(cacheKey);
            }
            const statement = yield connection.prepare(cmdtext);
            this._statementCache.set(cacheKey, statement);
            return statement;
        });
    }
    /**
     * sql get
     * @param cmdtext sql
     * @param values
     * @param up user upload
     */
    doGet(cmdtext, values, up) {
        var _a;
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!this._pool) {
                return [];
            }
            const debug = (_a = up.debug) !== null && _a !== void 0 ? _a : false;
            const dstart = new Date();
            let connection = null;
            let statement = null;
            try {
                connection = yield this.retryOperation(() => this.getConnectionWithRetry());
                if (!connection) {
                    throw new Error("Failed to get a valid connection.");
                }
                statement = yield this.getStatement(connection, cmdtext);
                const [rows] = yield statement.execute(values);
                const back = rows;
                if (debug) {
                    this._addWarn(JSON.stringify(back) + " c:" + cmdtext + " v" + values.join(","), "debug_" + up.apisys, up);
                }
                const lendown = JSON.stringify(back).length;
                this._saveLog(cmdtext, values, new Date().getTime() - dstart.getTime(), lendown, up);
                return back;
            }
            catch (err) {
                this._addWarn(JSON.stringify(err) + " c:" + cmdtext + " v" + values.join(","), "err_" + up.apisys, up);
                this.log.error(err, 'mysql_doGet');
                throw err;
            }
            finally {
                // if (statement) {
                //     await statement.close(); // 确保预处理语句被关闭
                // }
                if (connection) {
                    connection.release(); // 确保连接被释放
                }
            }
        });
    }
    doT(cmds, values, errtexts, logtext, logvalue, up) {
        var _a;
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!this._pool) {
                return 'pool null';
            }
            const debug = (_a = up.debug) !== null && _a !== void 0 ? _a : false;
            const dstart = new Date();
            let connection = null;
            try {
                connection = yield this.retryOperation(() => this.getConnectionWithRetry());
                if (!connection) {
                    throw new Error("Failed to get a valid connection.");
                }
                yield connection.beginTransaction();
                const promises = [];
                for (let i = 0; i < cmds.length; i++) {
                    promises.push(this.doTran(cmds[i], values[i], connection, up));
                }
                const results = yield Promise.all(promises);
                let errmsg = "err!";
                let haveAff0 = false;
                for (let i = 0; i < results.length; i++) {
                    if (results[i].affectedRows === 0) {
                        errmsg += errtexts[i];
                        haveAff0 = true;
                        break;
                    }
                }
                if (haveAff0 || results.length < cmds.length) {
                    yield connection.rollback();
                    connection.release();
                    return errmsg;
                }
                yield connection.commit();
                connection.release();
                this._saveLog(logtext, logvalue, new Date().getTime() - dstart.getTime(), 1, up);
                return "ok";
            }
            catch (err) {
                if (connection) {
                    yield connection.rollback();
                    connection.release();
                }
                this.log.error(err, 'mysql_doT');
                return 'error';
            }
        });
    }
    /**
    * sql update Method returns the full result set
    * @param cmdtext sql
    * @param values
    * @param up user upload
    */
    doMBack(cmdtext, values, up) {
        var _a;
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!this._pool) {
                return { result: {}, error: 'pool null' };
            }
            const debug = (_a = up.debug) !== null && _a !== void 0 ? _a : false;
            const dstart = new Date();
            let connection = null;
            let statement = null;
            try {
                connection = yield this.retryOperation(() => this.getConnectionWithRetry());
                if (!connection) {
                    throw new Error("Failed to get a valid connection.");
                }
                statement = yield this.getStatement(connection, cmdtext);
                const [result] = yield statement.execute(values);
                if (debug) {
                    this._addWarn(JSON.stringify(result) + " c:" + cmdtext + " v" + values.join(","), "debug_" + up.apisys, up);
                }
                const lendown = JSON.stringify(result).length;
                this._saveLog(cmdtext, values, new Date().getTime() - dstart.getTime(), lendown, up);
                return { result };
            }
            catch (err) {
                const errorMsg = JSON.stringify(err);
                this._addWarn(errorMsg + " c:" + cmdtext + " v" + values.join(","), "err" + up.apisys, up);
                this.log.error(err, 'mysql_doMBack');
                return { result: {}, error: errorMsg };
            }
            finally {
                // if (statement) {
                //     await statement.close(); // 确保预处理语句被关闭
                // }
                if (connection) {
                    connection.release(); // 确保连接被释放
                }
            }
        });
    }
    /**
     * sql update Method returns the number of affected rows
     * @param cmdtext sql
     * @param values
     * @param up user upload
     */
    doM(cmdtext, values, up) {
        var _a;
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!this._pool) {
                return { affectedRows: 0, error: 'pool null' };
            }
            const debug = (_a = up.debug) !== null && _a !== void 0 ? _a : false;
            const dstart = new Date();
            let connection = null;
            let statement = null;
            try {
                connection = yield this.retryOperation(() => this.getConnectionWithRetry());
                if (!connection) {
                    throw new Error("Failed to get a valid connection.");
                }
                statement = yield this.getStatement(connection, cmdtext);
                const [result] = yield statement.execute(values);
                const affectedRows = result.affectedRows;
                if (debug) {
                    this._addWarn(JSON.stringify(result) + " c:" + cmdtext + " v" + values.join(","), "debug_" + up.apisys, up);
                }
                const lendown = JSON.stringify(result).length;
                this._saveLog(cmdtext, values, new Date().getTime() - dstart.getTime(), lendown, up);
                // 如果受影响行数为0，返回明确的错误信息
                if (affectedRows === 0) {
                    return { affectedRows: 0, error: `更新失败，没有找到匹配的记录或数据未发生变化 (cmdtext: ${cmdtext}, values: ${JSON.stringify(values)})` };
                }
                return { affectedRows };
            }
            catch (err) {
                const errorMsg = JSON.stringify(err);
                this._addWarn(errorMsg + " c:" + cmdtext + " v" + values.join(","), "err" + up.apisys, up);
                this.log.error(err, `mysql_doM cmdtext: ${cmdtext} values: ${JSON.stringify(values)}`);
                return { affectedRows: 0, error: errorMsg };
            }
            finally {
                // if (statement) {
                //     await statement.close(); // 确保预处理语句被关闭
                // }
                if (connection) {
                    connection.release(); // 确保连接被释放
                }
            }
        });
    }
    /**
     * Inserting a row returns the inserted row number
     * @param cmdtext
     * @param values
     * @param up
     */
    doMAdd(cmdtext, values, up) {
        var _a;
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!this._pool) {
                return { insertId: 0, error: 'pool null' };
            }
            const debug = (_a = up.debug) !== null && _a !== void 0 ? _a : false;
            const dstart = new Date();
            try {
                const [result] = yield this._pool.execute(cmdtext, values);
                const insertId = result.insertId;
                const affectedRows = result.affectedRows;
                if (debug) {
                    this._addWarn(JSON.stringify(result) + " c:" + cmdtext + " v" + values.join(","), "debug_" + up.apisys, up);
                }
                const lendown = JSON.stringify(result).length;
                this._saveLog(cmdtext, values, new Date().getTime() - dstart.getTime(), lendown, up);
                // 如果受影响行数为0，返回明确的错误信息
                if (affectedRows === 0) {
                    return { insertId: 0, error: `插入失败，数据未被添加 (cmdtext: ${cmdtext}, values: ${JSON.stringify(values)})` };
                }
                return { insertId };
            }
            catch (err) {
                const errorMsg = JSON.stringify(err);
                this._addWarn(errorMsg + " c:" + cmdtext + " v" + values.join(","), "err" + up.apisys, up);
                this.log.error(err, 'mysql_doMAdd');
                return { insertId: 0, error: errorMsg };
            }
        });
    }
    /**
     * Transactions are executed piecemeal (it is usually better not to use doT)
     * You need to release the connection yourself
     * There may be complicated scenarios where the first sentence is successful but what condition has changed and you still need to roll back the transaction
     * @param cmdtext
     * @param values
     * @param con
     * @param up
     */
    doTran(cmdtext, values, con, up) {
        var _a;
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const debug = (_a = up.debug) !== null && _a !== void 0 ? _a : false;
            try {
                const [result] = yield con.execute(cmdtext, values);
                if (debug) {
                    this.log.info(`${cmdtext} v:${values.join(",")} r:${JSON.stringify(result)} 0, 'mysql', 'doTran', ${up.uname}`, 0);
                }
                return result;
            }
            catch (err) {
                this.log.error(err, 'mysql_doTran');
                throw err;
            }
        });
    }
    /**
     * doget doM  does not need to be released manually
     * getConnection
     * */
    releaseConnection(client) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (this._pool) {
                this._pool.releaseConnection(client);
            }
        });
    }
    /**
     * Get the connection (remember to release it)
     * */
    getConnection() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!this._pool) {
                return null;
            }
            try {
                const connection = yield this._pool.getConnection();
                return connection;
            }
            catch (err) {
                this.log.error(err, 'mysql_getConnection');
                return null;
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
                    this.log.error(err, 'mysql__addWarn_handler');
                }
            }
            if (!this._pool || !this.isLog) {
                return this.isLog ? 'pool null' : 'isLog is false';
            }
            const cmdtext = 'INSERT INTO sys_warn (`kind`,apisys,apiobj,`content`,`upby`,`uptime`,`id`,upid)VALUES(?,?,?,?,?,?,?,?)';
            const values = [kind, up.apisys, up.apiobj, info, up.uname, up.uptime, koa78_upinfo_1.default.getNewid(), up.upid];
            try {
                const [results] = yield this._pool.execute(cmdtext, values);
                return results.affectedRows;
            }
            catch (err) {
                this.log.error(err, 'mysql__addWarn');
                return 0;
            }
        });
    }
    /**
     * If the table name SYS_SQL is opened after the function, it will affect performance
     * @param cmdtext SQL
     * @param values
     * @param dlong Function Timing
     * @param lendown down bytes
     * @param up user upload
     */
    _saveLog(cmdtext, values, dlong, lendown, up) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!this.isCount || !this._pool) {
                return this.isCount ? 'pool null' : 'isCount is false';
            }
            const cmdtextmd5 = (0, md5_1.default)(cmdtext);
            const sb = 'INSERT INTO sys_sql(apiv,apisys,apiobj,cmdtext,num,dlong,downlen,id,uptime,cmdtextmd5)VALUES(?,?,?,?,?,?,?,?,?,?) ' +
                'ON DUPLICATE KEY UPDATE num=num+1,dlong=dlong+?,downlen=downlen+?';
            try {
                yield this._pool.execute(sb, [
                    up.v, up.apisys, up.apiobj, cmdtext, 1, dlong, lendown, koa78_upinfo_1.default.getNewid(), new Date(), cmdtextmd5,
                    dlong, lendown
                ]);
                return 'ok';
            }
            catch (err) {
                this.log.error(err);
                return 'error';
            }
        });
    }
    close() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (this._pool) {
                yield this._pool.end();
            }
        });
    }
}
exports.default = Mysql78;
//# sourceMappingURL=Mysql78.js.map