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
        for (const [name, mysqlConfig] of Object.entries(mysqls)) {
            console.warn(`${name} ${mysqlConfig.host} ${mysqlConfig.database}`);
            this.mysqlConnections.set(name, new mysql78_1.default(mysqlConfig));
        }
        this.memcache = new memcache78_1.default(memcachedConfig);
        this.redis = new redis78_1.default(redisConfig);
        console.warn(`redis ${redisConfig.host} ${redisConfig.port} ${redisConfig.pwd} ${redisConfig.max} ${redisConfig.local}`);
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