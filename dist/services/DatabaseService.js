"use strict";
var DatabaseService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseService = void 0;
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const ContainerManager_1 = require("../ContainerManager");
let DatabaseService = DatabaseService_1 = class DatabaseService {
    constructor() {
        this.log = null;
        // 使用新的日志服务方式
        this.log = ContainerManager_1.ContainerManager.getLogger();
        DatabaseService_1.instance = this;
    }
    setDatabaseConnections(dbConnections) {
        this.dbConnections = dbConnections;
    }
    get(sql_1, values_1, up_1) {
        return tslib_1.__awaiter(this, arguments, void 0, function* (sql, values, up, dbName = "default") {
            if (!this.dbConnections) {
                this.log.error('DatabaseConnections not initialized');
                throw new Error('DatabaseConnections not initialized');
            }
            const mysql = this.dbConnections.getMySQLConnection(dbName);
            if (!mysql) {
                this.log.error('Default MySQL connection not found' + dbName);
                throw new Error('Default MySQL connection not found' + dbName);
            }
            try {
                return yield mysql.doGet(sql, values, up);
            }
            catch (error) {
                this.log.error(dbName + 'Error in DatabaseService.get:', error);
                throw error;
            }
        });
    }
    m(sql_1, values_1, up_1) {
        return tslib_1.__awaiter(this, arguments, void 0, function* (sql, values, up, dbName = "default") {
            if (!this.dbConnections) {
                this.log.error('DatabaseConnections not initialized');
                throw new Error('DatabaseConnections not initialized');
            }
            const mysql = this.dbConnections.getMySQLConnection(dbName);
            if (!mysql) {
                this.log.error('Default MySQL connection not found');
                throw new Error('Default MySQL connection not found');
            }
            try {
                const result = yield mysql.doM(sql, values, up);
                // 如果受影响行数为0，使用up对象记录错误
                if (result.affectedRows === 0) {
                    up.res = -2; // 使用不同的负值
                    up.errmsg = '没有记录被更新';
                }
                return result;
            }
            catch (error) {
                this.log.error(dbName + 'Error in DatabaseService.m:', error);
                // 在up对象中设置错误信息
                up.res = -3; // 使用不同的负值表示异常
                up.errmsg = String(error);
                throw error;
            }
        });
    }
    doT(cmds_1, values_1, errtexts_1, logtext_1, logvalue_1, up_1) {
        return tslib_1.__awaiter(this, arguments, void 0, function* (cmds, values, errtexts, logtext, logvalue, up, dbName = "default") {
            if (!this.dbConnections) {
                this.log.error('DatabaseConnections not initialized');
                throw new Error('DatabaseConnections not initialized');
            }
            const mysql = this.dbConnections.getMySQLConnection(dbName);
            if (!mysql) {
                this.log.error('Default MySQL connection not found');
                throw new Error('Default MySQL connection not found');
            }
            try {
                return yield mysql.doT(cmds, values, errtexts, logtext, logvalue, up);
            }
            catch (error) {
                this.log.error(dbName + 'Error in DatabaseService.doT:', error);
                throw error;
            }
        });
    }
    mAdd(sql_1, values_1, up_1) {
        return tslib_1.__awaiter(this, arguments, void 0, function* (sql, values, up, dbName = "default") {
            if (!this.dbConnections) {
                this.log.error('DatabaseConnections not initialized');
                throw new Error('DatabaseConnections not initialized');
            }
            const mysql = this.dbConnections.getMySQLConnection(dbName);
            if (!mysql) {
                this.log.error('Default MySQL connection not found');
                throw new Error('Default MySQL connection not found');
            }
            try {
                return yield mysql.doMAdd(sql, values, up);
            }
            catch (error) {
                this.log.error(dbName + 'Error in DatabaseService.mAdd:', error);
                throw error;
            }
        });
    }
    // SQLite相关方法
    sqliteGet(sql_1, values_1, up_1) {
        return tslib_1.__awaiter(this, arguments, void 0, function* (sql, values, up, dbName = "default") {
            if (!this.dbConnections) {
                this.log.error('DatabaseConnections not initialized');
                throw new Error('DatabaseConnections not initialized');
            }
            const sqlite = this.dbConnections.getSQLiteConnection(dbName);
            if (!sqlite) {
                this.log.error('Default SQLite connection not found');
                throw new Error('Default SQLite connection not found');
            }
            try {
                return yield sqlite.doGet(sql, values, up);
            }
            catch (error) {
                this.log.error(dbName + 'Error in DatabaseService.sqliteGet:', error);
                throw error;
            }
        });
    }
    sqliteM(sql_1, values_1, up_1) {
        return tslib_1.__awaiter(this, arguments, void 0, function* (sql, values, up, dbName = "default") {
            if (!this.dbConnections) {
                this.log.error('DatabaseConnections not initialized');
                throw new Error('DatabaseConnections not initialized');
            }
            const sqlite = this.dbConnections.getSQLiteConnection(dbName);
            if (!sqlite) {
                this.log.error('Default SQLite connection not found');
                throw new Error('Default SQLite connection not found');
            }
            try {
                return yield sqlite.doM(sql, values, up);
            }
            catch (error) {
                this.log.error(dbName + 'Error in DatabaseService.sqliteM:', error);
                throw error;
            }
        });
    }
    sqliteDoT(cmds_1, values_1, errtexts_1, logtext_1, logvalue_1, up_1) {
        return tslib_1.__awaiter(this, arguments, void 0, function* (cmds, values, errtexts, logtext, logvalue, up, dbName = "default") {
            if (!this.dbConnections) {
                this.log.error('DatabaseConnections not initialized');
                throw new Error('DatabaseConnections not initialized');
            }
            const sqlite = this.dbConnections.getSQLiteConnection(dbName);
            if (!sqlite) {
                this.log.error('Default SQLite connection not found');
                throw new Error('Default SQLite connection not found');
            }
            try {
                return yield sqlite.doT(cmds, values, errtexts, logtext, logvalue, up);
            }
            catch (error) {
                this.log.error(dbName + 'Error in DatabaseService.sqliteDoT:', error);
                throw error;
            }
        });
    }
    sqliteMAdd(sql_1, values_1, up_1) {
        return tslib_1.__awaiter(this, arguments, void 0, function* (sql, values, up, dbName = "default") {
            if (!this.dbConnections) {
                this.log.error('DatabaseConnections not initialized');
                throw new Error('DatabaseConnections not initialized');
            }
            const sqlite = this.dbConnections.getSQLiteConnection(dbName);
            if (!sqlite) {
                this.log.error('Default SQLite connection not found');
                throw new Error('Default SQLite connection not found');
            }
            try {
                return yield sqlite.doMAdd(sql, values, up);
            }
            catch (error) {
                this.log.error(dbName + 'Error in DatabaseService.sqliteMAdd:', error);
                throw error;
            }
        });
    }
};
exports.DatabaseService = DatabaseService;
exports.DatabaseService = DatabaseService = DatabaseService_1 = tslib_1.__decorate([
    (0, inversify_1.injectable)(),
    tslib_1.__metadata("design:paramtypes", [])
], DatabaseService);
//# sourceMappingURL=DatabaseService.js.map