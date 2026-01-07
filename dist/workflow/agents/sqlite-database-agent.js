"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SqliteDatabaseAgent = void 0;
const tslib_1 = require("tslib");
const agent_1 = require("../base/agent");
const tslog78_1 = require("tslog78");
const Sqlite78_1 = tslib_1.__importDefault(require("../../dll78/Sqlite78"));
const koa78_upinfo_1 = tslib_1.__importDefault(require("koa78-upinfo"));
const log = tslog78_1.TsLog78.Instance;
class SqliteDatabaseAgent extends agent_1.Agent {
    constructor(config) {
        super();
        this.sqliteConnections = new Map();
        this.config = config || {};
        this.agentname = 'SqliteDatabaseAgent';
    }
    initializeConnection(dbName, options) {
        var _a, _b;
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // 创建SQLite连接
            const sqliteConfig = {
                filename: (options === null || options === void 0 ? void 0 : options.filename) || `./data/${dbName}.db`,
                isLog: (_a = options === null || options === void 0 ? void 0 : options.isLog) !== null && _a !== void 0 ? _a : true,
                isCount: (_b = options === null || options === void 0 ? void 0 : options.isCount) !== null && _b !== void 0 ? _b : true
            };
            const sqlite = new Sqlite78_1.default(sqliteConfig);
            yield sqlite.initialize();
            this.sqliteConnections.set(dbName, sqlite);
            console.log(`SQLite connection initialized for database: ${dbName}`);
        });
    }
    connect(dbName, options) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield this.initializeConnection(dbName, options);
        });
    }
    disconnect(dbName) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const connection = this.sqliteConnections.get(dbName);
            if (connection) {
                yield connection.close();
                this.sqliteConnections.delete(dbName);
            }
        });
    }
    query(sql, values, up, dbName = 'default') {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const connection = this.sqliteConnections.get(dbName);
            if (!connection) {
                throw new Error(`SQLite connection not found for database: ${dbName}`);
            }
            console.log(`Executing query on ${dbName}: ${sql}`);
            console.log(`Parameters:`, values);
            try {
                // 使用Sqlite78的doGet方法
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
            const connection = this.sqliteConnections.get(dbName);
            if (!connection) {
                throw new Error(`SQLite connection not found for database: ${dbName}`);
            }
            console.log(`Executing SQL on ${dbName}: ${sql}`);
            console.log(`Parameters:`, values);
            try {
                // 使用Sqlite78的doM方法
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
            const connection = this.sqliteConnections.get(dbName);
            if (!connection) {
                throw new Error(`SQLite connection not found for database: ${dbName}`);
            }
            console.log(`Executing transaction on ${dbName}:`, cmds);
            try {
                // 使用Sqlite78的doT方法
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
            const connection = this.sqliteConnections.get(dbName);
            if (!connection) {
                throw new Error(`SQLite connection not found for database: ${dbName}`);
            }
            console.log(`Executing insert on ${dbName}: ${sql}`);
            console.log(`Parameters:`, values);
            try {
                // 使用Sqlite78的doMAdd方法
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
        return this.sqliteConnections.has(dbName);
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
exports.SqliteDatabaseAgent = SqliteDatabaseAgent;
//# sourceMappingURL=sqlite-database-agent.js.map