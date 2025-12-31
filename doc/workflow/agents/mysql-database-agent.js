"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MysqlDatabaseAgent = void 0;
const tslib_1 = require("tslib");
const agent_1 = require("../base/agent");
const tslog78_1 = require("tslog78");
const koa78_upinfo_1 = tslib_1.__importDefault(require("koa78-upinfo"));
const log = tslog78_1.TsLog78.Instance;
class MysqlDatabaseAgent extends agent_1.Agent {
    constructor(configAgent) {
        super();
        this.mysqlConnections = new Map();
        this.configAgent = null;
        this.configAgent = configAgent || null;
        this.agentname = 'MysqlDatabaseAgent';
    }
    initializeConnection(dbName, options) {
        var _a;
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // 从ConfigAgent获取数据库配置，如果options未提供的话
            let dbConfig = options;
            if (!dbConfig && this.configAgent) {
                const config = this.configAgent.getAll();
                if (config.mysqls && config.mysqls[dbName]) {
                    dbConfig = config.mysqls[dbName];
                }
                else {
                    // 使用默认配置
                    dbConfig = (_a = config.mysqls) === null || _a === void 0 ? void 0 : _a.default;
                }
            }
            console.log(`Connecting to MySQL database: ${dbName}`, dbConfig);
            // 模拟MySQL连接，实际实现中应该使用真实的MySQL连接
            const connection = {
                doGet: (sql, values, up) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                    console.log(`Executing query: ${sql} with values:`, values);
                    // 模拟查询结果 - 根据SQL文件中的数据
                    if (sql.includes('lovers l')) {
                        // 模拟返回用户数据，根据SQL文件中lovers表的数据
                        if (values && values[0] === 'GUEST888-8888-8888-8888-GUEST88GUEST') {
                            return [{
                                    id: 'GUEST888-8888-8888-8888-GUEST88GUEST',
                                    uname: 'guest',
                                    idcodef: 'GUEST000-8888-8888-8888-GUEST00GUEST',
                                    email: '',
                                    referrer: 'GUEST000-8888-8888-8888-GUEST00GUEST',
                                    mobile: '',
                                    openweixin: '',
                                    truename: '',
                                    upby: '',
                                    uptime: '1900-01-01 00:00:00',
                                    idpk: 1,
                                    remark: '',
                                    remark2: '',
                                    remark3: '',
                                    remark4: '',
                                    remark5: '',
                                    remark6: '',
                                    // cid: '',  // 这个字段已经在下面定义了，删除重复项
                                    sid_web_date: '2018-06-01 18:02:43',
                                    sid: 'GUEST888-8888-8888-8888-GUEST88GUEST',
                                    sid_web: '8573faf2-24b2-b586-adac-d9d8da9772d0',
                                    coname: '测试帐套',
                                    idceo: 'CD86605E-7A42-481A-9786-85010E67128A',
                                    cid: 'GUEST000-8888-8888-8888-GUEST00GUEST' // 保留这一个cid定义
                                }];
                        }
                        else if (values && values[0] === '9776b64d-70b2-9d61-4b24-60325ea1345e') {
                            return [{
                                    id: 'CD86605E-7A42-481A-9786-85010E67128A',
                                    uname: 'sysadmin',
                                    idcodef: 'd4856531-e9d3-20f3-4c22-fe3c65fb009c',
                                    email: '',
                                    referrer: 'd4856531-e9d3-20f3-4c22-fe3c65fb009c',
                                    mobile: '',
                                    openweixin: '',
                                    truename: '',
                                    upby: '',
                                    uptime: '1900-01-01 00:00:00',
                                    idpk: 2,
                                    remark: '',
                                    remark2: '',
                                    remark3: '',
                                    remark4: '',
                                    remark5: '',
                                    remark6: '',
                                    // cid: '',  // 这个字段已经在下面定义了，删除重复项
                                    sid_web_date: '2022-10-24 22:06:26',
                                    sid: '9776b64d-70b2-9d61-4b24-60325ea1345e',
                                    sid_web: 'a46f3ec9-b40d-6850-838e-6b897a73c72f',
                                    coname: 'net78',
                                    idceo: 'CD86605E-7A42-481A-9786-85010E67128A',
                                    cid: 'd4856531-e9d3-20f3-4c22-fe3c65fb009c' // 保留这一个cid定义
                                }];
                        }
                    }
                    // 默认返回空数组
                    return [];
                }),
                doM: (sql, values, up) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                    console.log(`Executing update: ${sql} with values:`, values);
                    // 模拟返回受影响行数
                    return { affectedRows: 1 };
                }),
                doT: (cmds, values, errtexts, logtext, logvalue, up) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                    console.log(`Executing transaction:`, cmds);
                    // 模拟返回事务结果
                    return "ok";
                }),
                doMAdd: (sql, values, up) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                    console.log(`Executing insert: ${sql} with values:`, values);
                    // 模拟返回插入ID
                    return 1;
                })
            };
            this.mysqlConnections.set(dbName, connection);
        });
    }
    connect(dbName, options) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield this.initializeConnection(dbName, options);
        });
    }
    disconnect(dbName) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const connection = this.mysqlConnections.get(dbName);
            if (connection) {
                // 在实际实现中，这里会关闭真实的MySQL连接
                this.mysqlConnections.delete(dbName);
            }
        });
    }
    query(sql, values, up, dbName = 'default') {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const connection = this.mysqlConnections.get(dbName);
            if (!connection) {
                throw new Error(`MySQL connection not found for database: ${dbName}`);
            }
            console.log(`Executing query on ${dbName}: ${sql}`);
            console.log(`Parameters:`, values);
            try {
                // 使用模拟的doGet方法
                const result = yield connection.doGet(sql, values || [], up || this.createDefaultUpInfo());
                return result;
            }
            catch (error) {
                console.error(`Error executing query: ${error}`);
                throw error;
            }
        });
    }
    execute(sql, values, up, dbName = 'default') {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const connection = this.mysqlConnections.get(dbName);
            if (!connection) {
                throw new Error(`MySQL connection not found for database: ${dbName}`);
            }
            console.log(`Executing SQL on ${dbName}: ${sql}`);
            console.log(`Parameters:`, values);
            try {
                // 使用模拟的doM方法
                const result = yield connection.doM(sql, values || [], up || this.createDefaultUpInfo());
                return result;
            }
            catch (error) {
                console.error(`Error executing SQL: ${error}`);
                throw error;
            }
        });
    }
    executeTransaction(cmds, values, errtexts, logtext, logvalue, up, dbName = 'default') {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const connection = this.mysqlConnections.get(dbName);
            if (!connection) {
                throw new Error(`MySQL connection not found for database: ${dbName}`);
            }
            console.log(`Executing transaction on ${dbName}:`, cmds);
            try {
                // 使用模拟的doT方法
                const result = yield connection.doT(cmds, values, errtexts, logtext, logvalue, up || this.createDefaultUpInfo());
                return result;
            }
            catch (error) {
                console.error(`Error executing transaction: ${error}`);
                throw error;
            }
        });
    }
    executeInsert(sql, values, up, dbName = 'default') {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const connection = this.mysqlConnections.get(dbName);
            if (!connection) {
                throw new Error(`MySQL connection not found for database: ${dbName}`);
            }
            console.log(`Executing insert on ${dbName}: ${sql}`);
            console.log(`Parameters:`, values);
            try {
                // 使用模拟的doMAdd方法
                const result = yield connection.doMAdd(sql, values || [], up || this.createDefaultUpInfo());
                return result;
            }
            catch (error) {
                console.error(`Error executing insert: ${error}`);
                throw error;
            }
        });
    }
    isConnected(dbName) {
        return this.mysqlConnections.has(dbName);
    }
    // 允许更新配置Agent
    setConfigAgent(configAgent) {
        this.configAgent = configAgent;
    }
    createDefaultUpInfo() {
        // 创建一个默认的UpInfo实例
        const up = new koa78_upinfo_1.default(null);
        up.uname = 'system';
        up.apisys = 'system';
        up.apiobj = 'system';
        up.uptime = new Date();
        return up;
    }
    // Agent处理器：数据库查询任务
    executeQueryTask(params) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { sql, values, up, dbName = 'default' } = params;
            return yield this.query(sql, values, up, dbName);
        });
    }
    // Agent处理器：数据库执行任务
    executeTask(params) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { sql, values, up, dbName = 'default' } = params;
            return yield this.execute(sql, values, up, dbName);
        });
    }
    // Agent处理器：数据库插入任务
    executeInsertTask(params) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { sql, values, up, dbName = 'default' } = params;
            return yield this.executeInsert(sql, values, up, dbName);
        });
    }
}
exports.MysqlDatabaseAgent = MysqlDatabaseAgent;
//# sourceMappingURL=mysql-database-agent.js.map