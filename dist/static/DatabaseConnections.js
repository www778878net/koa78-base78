"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseConnections = void 0;
const tslib_1 = require("tslib");
const mysql78_1 = tslib_1.__importDefault(require("mysql78"));
const memcache78_1 = tslib_1.__importDefault(require("memcache78"));
const redis78_1 = tslib_1.__importDefault(require("redis78"));
class DatabaseConnections {
    constructor(mysqls, memcachedConfig, redisConfig
    // sqlites?: Record<string, SQLiteConfig>  // 注释掉Sqlite78相关参数
    ) {
        this.mysqlConnections = new Map();
        console.log('DatabaseConnections constructor called with mysqls:', JSON.stringify(mysqls, null, 2));
        // 允许空的mysql配置
        const mysqlEntries = mysqls ? Object.entries(mysqls) : [];
        console.log('Processing MySQL entries:', mysqlEntries);
        for (const [name, mysqlConfig] of mysqlEntries) {
            console.warn(`Creating MySQL connection [${name}] with host:${mysqlConfig.host} db:${mysqlConfig.database} user:${mysqlConfig.user} password:${mysqlConfig.password ? '****' : 'NONE'}`);
            this.mysqlConnections.set(name, new mysql78_1.default(mysqlConfig));
        }
        // 初始化SQLite连接 - 注释掉这部分代码
        /*
        if (sqlites) {
          const sqliteEntries = Object.entries(sqlites);
          for (const [name, sqliteConfig] of sqliteEntries) {
            console.warn(`SQLite ${name} ${sqliteConfig.filename}`);
            const sqliteInstance = new Sqlite78(sqliteConfig);
            // 初始化连接
            sqliteInstance.initialize().catch(err => {
              console.error(`Failed to initialize SQLite connection ${name}:`, err);
            });
            this.sqliteConnections.set(name, sqliteInstance);
          }
        }
        */
        // 只有当配置存在且为对象时才创建memcache和redis实例
        if (memcachedConfig && typeof memcachedConfig === 'object') {
            this.memcache = new memcache78_1.default(memcachedConfig);
        }
        if (redisConfig && typeof redisConfig === 'object') {
            this.redis = new redis78_1.default(redisConfig);
        }
        console.warn(`redis ${redisConfig === null || redisConfig === void 0 ? void 0 : redisConfig.host} ${redisConfig === null || redisConfig === void 0 ? void 0 : redisConfig.port} ${redisConfig === null || redisConfig === void 0 ? void 0 : redisConfig.pwd} ${redisConfig === null || redisConfig === void 0 ? void 0 : redisConfig.max} ${redisConfig === null || redisConfig === void 0 ? void 0 : redisConfig.local}`);
    }
    static getInstance(mysqls, memcachedConfig, redisConfig
    // sqlites?: Record<string, SQLiteConfig> // 注释掉Sqlite78相关参数
    ) {
        if (!DatabaseConnections.instance) {
            // DatabaseConnections.instance = new DatabaseConnections(mysqls, memcachedConfig, redisConfig, sqlites);
            DatabaseConnections.instance = new DatabaseConnections(mysqls, memcachedConfig, redisConfig); // 移除sqlites参数
        }
        return DatabaseConnections.instance;
    }
    getMySQLConnection(name = "default") {
        return this.mysqlConnections.get(name);
    }
    // public getSQLiteConnection(name: string = "default"): Sqlite78 | undefined { // 注释掉Sqlite78相关方法
    //   return this.sqliteConnections.get(name);
    // }
    getAllMySQLConnections() {
        return this.mysqlConnections;
    }
    // public getAllSQLiteConnections(): Map<string, Sqlite78> { // 注释掉Sqlite78相关方法
    //   return this.sqliteConnections;
    // }
    get mysql1() {
        return this.getMySQLConnection("default");
    }
}
exports.DatabaseConnections = DatabaseConnections;
//# sourceMappingURL=DatabaseConnections.js.map