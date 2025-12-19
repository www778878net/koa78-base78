"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const Base78_1 = require("../../controllers/Base78");
const decorators_1 = require("../../interfaces/decorators");
const koa78_upinfo_1 = tslib_1.__importDefault(require("koa78-upinfo"));
class sqlitetest extends Base78_1.CidBase78 {
    /**
     * 初始化数据库连接
     */
    initDb() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                // 使用DatabaseService中的方法测试SQLite连接
                const up = new koa78_upinfo_1.default({});
                yield this.dbService.sqliteGet("SELECT 1", [], up);
                return "数据库连接测试成功";
            }
            catch (error) {
                return `数据库连接测试失败: ${error}`;
            }
        });
    }
    /**
     * 创建系统表（包括sys_log表）
     */
    createTables() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                // 创建sys_log表
                const createSysLogTable = `
                CREATE TABLE IF NOT EXISTS sys_log (
                    uid TEXT NOT NULL DEFAULT '',
                    simple TEXT NOT NULL DEFAULT '',
                    key1 TEXT NOT NULL DEFAULT '',
                    key2 TEXT NOT NULL DEFAULT '',
                    key3 TEXT NOT NULL DEFAULT '',
                    content TEXT NOT NULL,
                    key4 TEXT NOT NULL DEFAULT '',
                    key5 TEXT NOT NULL DEFAULT '',
                    key6 TEXT NOT NULL DEFAULT '',
                    upby TEXT NOT NULL DEFAULT '',
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
                // 创建索引
                const createIndexes = [
                    'CREATE INDEX IF NOT EXISTS i_key2 ON sys_log (key2)',
                    'CREATE INDEX IF NOT EXISTS i_key1 ON sys_log (key1)',
                    'CREATE INDEX IF NOT EXISTS i_key4 ON sys_log (key4)',
                    'CREATE INDEX IF NOT EXISTS i_key3 ON sys_log (key3)',
                    'CREATE INDEX IF NOT EXISTS i_uptime ON sys_log (uptime)'
                ];
                const up = new koa78_upinfo_1.default({});
                // 执行创建表语句
                yield this.dbService.sqliteM(createSysLogTable, [], up);
                // 创建索引
                for (const indexSql of createIndexes) {
                    yield this.dbService.sqliteM(indexSql, [], up);
                }
                // 创建其他系统表（调用已有的方法）
                yield this.dbService.sqliteM("CREATE TABLE IF NOT EXISTS sys_warn (uid TEXT NOT NULL DEFAULT '')", [], up);
                yield this.dbService.sqliteM("CREATE TABLE IF NOT EXISTS sys_sql (cid TEXT NOT NULL DEFAULT '')", [], up);
                return "所有表创建成功";
            }
            catch (error) {
                return `创建表失败: ${error}`;
            }
        });
    }
    /**
     * 插入测试数据到sys_log表
     */
    insertLog() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                const insertSql = `
                INSERT INTO sys_log (
                    uid, simple, key1, key2, key3, content, key4, key5, key6, 
                    upby, uptime, id, remark, remark2, remark3, remark4, remark5, remark6
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
                const values = [
                    'test_uid_123',
                    '这是一条测试日志',
                    'key1_value',
                    'key2_value',
                    'key3_value',
                    '这是日志的详细内容',
                    'key4_value',
                    'key5_value',
                    'key6_value',
                    'test_user',
                    new Date().toISOString(),
                    'unique_id_' + Date.now(),
                    '备注1',
                    '备注2',
                    '备注3',
                    '备注4',
                    '备注5',
                    '备注6'
                ];
                const up = new koa78_upinfo_1.default({});
                yield this.dbService.sqliteM(insertSql, values, up);
                return "日志插入成功";
            }
            catch (error) {
                return `插入日志失败: ${error}`;
            }
        });
    }
    /**
     * 查询sys_log表中的数据
     */
    queryLogs() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                const querySql = "SELECT * FROM sys_log ORDER BY uptime DESC LIMIT 10";
                const up = new koa78_upinfo_1.default({});
                const rows = yield this.dbService.sqliteGet(querySql, [], up);
                return {
                    message: "查询成功",
                    count: rows.length,
                    data: rows
                };
            }
            catch (error) {
                return { error: `查询日志失败: ${error}` };
            }
        });
    }
    /**
     * 查询sys_warn表中的数据
     */
    queryWarnings() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                const up = new koa78_upinfo_1.default({});
                const result = yield this.dbService.sqliteGet("SELECT * FROM sys_warn LIMIT 5", [], up);
                return {
                    message: "警告信息查询成功",
                    count: result.length,
                    data: result
                };
            }
            catch (error) {
                return { error: `查询警告信息失败: ${error}` };
            }
        });
    }
    /**
     * 查询sys_sql表中的数据
     */
    querySqlRecords() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                const up = new koa78_upinfo_1.default({});
                const result = yield this.dbService.sqliteGet("SELECT * FROM sys_sql LIMIT 5", [], up);
                return {
                    message: "SQL记录查询成功",
                    count: result.length,
                    data: result
                };
            }
            catch (error) {
                return { error: `查询SQL记录失败: ${error}` };
            }
        });
    }
}
tslib_1.__decorate([
    (0, decorators_1.ApiMethod)(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", Promise)
], sqlitetest.prototype, "createTables", null);
tslib_1.__decorate([
    (0, decorators_1.ApiMethod)(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", Promise)
], sqlitetest.prototype, "insertLog", null);
tslib_1.__decorate([
    (0, decorators_1.ApiMethod)(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", Promise)
], sqlitetest.prototype, "queryLogs", null);
tslib_1.__decorate([
    (0, decorators_1.ApiMethod)(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", Promise)
], sqlitetest.prototype, "queryWarnings", null);
tslib_1.__decorate([
    (0, decorators_1.ApiMethod)(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", Promise)
], sqlitetest.prototype, "querySqlRecords", null);
exports.default = sqlitetest;
//# sourceMappingURL=sqlitetest.js.map