"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseConnections = void 0;
const tslib_1 = require("tslib");
const memcache78_1 = tslib_1.__importDefault(require("memcache78"));
const redis78_1 = tslib_1.__importDefault(require("redis78"));
const Sqlite78_1 = tslib_1.__importDefault(require("../dll78/Sqlite78"));
const Postgres78_1 = tslib_1.__importDefault(require("../dll78/Postgres78"));
class DatabaseConnections {
    constructor(postgress, memcachedConfig, redisConfig, sqlites) {
        this.postgresConnections = new Map();
        this.sqliteConnections = new Map();
        console.log('DatabaseConnections constructor called with postgress:', JSON.stringify(postgress, null, 2));
        const postgresEntries = postgress ? Object.entries(postgress) : [];
        for (const [name, pgConfig] of postgresEntries) {
            console.warn(`Creating PostgreSQL connection [${name}] with host:${pgConfig.host} db:${pgConfig.database} user:${pgConfig.user}`);
            this.postgresConnections.set(name, new Postgres78_1.default(pgConfig));
        }
        if (sqlites) {
            const sqliteEntries = Object.entries(sqlites);
            for (const [name, sqliteConfig] of sqliteEntries) {
                console.warn(`SQLite ${name} ${sqliteConfig.filename}`);
                const sqliteInstance = new Sqlite78_1.default(sqliteConfig);
                sqliteInstance.initialize().catch(err => {
                    console.error(`Failed to initialize SQLite connection ${name}:`, err);
                });
                this.sqliteConnections.set(name, sqliteInstance);
            }
        }
        if (memcachedConfig && typeof memcachedConfig === 'object') {
            this.memcache = new memcache78_1.default(memcachedConfig);
        }
        if (redisConfig && typeof redisConfig === 'object') {
            this.redis = new redis78_1.default(redisConfig);
        }
        console.warn(`redis ${redisConfig === null || redisConfig === void 0 ? void 0 : redisConfig.host} ${redisConfig === null || redisConfig === void 0 ? void 0 : redisConfig.port} ${redisConfig === null || redisConfig === void 0 ? void 0 : redisConfig.pwd} ${redisConfig === null || redisConfig === void 0 ? void 0 : redisConfig.max} ${redisConfig === null || redisConfig === void 0 ? void 0 : redisConfig.local}`);
    }
    static getInstance(postgress, memcachedConfig, redisConfig, sqlites) {
        if (!DatabaseConnections.instance) {
            DatabaseConnections.instance = new DatabaseConnections(postgress, memcachedConfig, redisConfig, sqlites);
        }
        return DatabaseConnections.instance;
    }
    getPostgreSQLConnection(name = "default") {
        return this.postgresConnections.get(name);
    }
    getSQLiteConnection(name = "default") {
        return this.sqliteConnections.get(name);
    }
    getAllPostgreSQLConnections() {
        return this.postgresConnections;
    }
    getAllSQLiteConnections() {
        return this.sqliteConnections;
    }
    get postgres1() {
        return this.getPostgreSQLConnection("default");
    }
}
exports.DatabaseConnections = DatabaseConnections;
//# sourceMappingURL=DatabaseConnections.js.map