"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseConnections = void 0;
const tslib_1 = require("tslib");
const mysql78_1 = tslib_1.__importDefault(require("mysql78"));
const memcache78_1 = tslib_1.__importDefault(require("memcache78"));
const redis78_1 = tslib_1.__importDefault(require("redis78"));
class DatabaseConnections {
    constructor(mysqls, memcachedConfig, redisConfig) {
        this.mysqlConnections = new Map();
        // 允许空的mysql配置
        const mysqlEntries = mysqls ? Object.entries(mysqls) : [];
        for (const [name, mysqlConfig] of mysqlEntries) {
            console.warn(`${name} ${mysqlConfig.host} ${mysqlConfig.database}`);
            this.mysqlConnections.set(name, new mysql78_1.default(mysqlConfig));
        }
        // 只有当配置存在且为对象时才创建memcache和redis实例
        if (memcachedConfig && typeof memcachedConfig === 'object') {
            this.memcache = new memcache78_1.default(memcachedConfig);
        }
        if (redisConfig && typeof redisConfig === 'object') {
            this.redis = new redis78_1.default(redisConfig);
        }
        console.warn(`redis ${redisConfig === null || redisConfig === void 0 ? void 0 : redisConfig.host} ${redisConfig === null || redisConfig === void 0 ? void 0 : redisConfig.port} ${redisConfig === null || redisConfig === void 0 ? void 0 : redisConfig.pwd} ${redisConfig === null || redisConfig === void 0 ? void 0 : redisConfig.max} ${redisConfig === null || redisConfig === void 0 ? void 0 : redisConfig.local}`);
    }
    static getInstance(mysqls, memcachedConfig, redisConfig) {
        if (!DatabaseConnections.instance) {
            DatabaseConnections.instance = new DatabaseConnections(mysqls, memcachedConfig, redisConfig);
        }
        return DatabaseConnections.instance;
    }
    getMySQLConnection(name = "default") {
        return this.mysqlConnections.get(name);
    }
    getAllMySQLConnections() {
        return this.mysqlConnections;
    }
    get mysql1() {
        return this.getMySQLConnection("default");
    }
}
exports.DatabaseConnections = DatabaseConnections;
//# sourceMappingURL=DatabaseConnections.js.map