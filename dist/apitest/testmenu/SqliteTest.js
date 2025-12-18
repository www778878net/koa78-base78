"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const Base78_1 = require("../../controllers/Base78");
const decorators_1 = require("../../interfaces/decorators");
const koa78_upinfo_1 = tslib_1.__importDefault(require("koa78-upinfo"));
const Sqlite78_1 = tslib_1.__importDefault(require("../../dll78/Sqlite78"));
const ContainerManager_1 = require("../../ContainerManager");
const Config_1 = require("../../config/Config");
class SqliteTest extends Base78_1.CidBase78 {
    constructor() {
        var _a, _b, _c;
        super();
        this.sqliteDb = null;
        // 从配置中获取SQLite配置
        try {
            const container = (_a = ContainerManager_1.ContainerManager.getInstance()) === null || _a === void 0 ? void 0 : _a.getContainer();
            if (container) {
                const config = container.get(Config_1.Config);
                const sqliteConfig = config.get('sqlite');
                // 初始化SQLite数据库连接
                this.sqliteDb = new Sqlite78_1.default({
                    filename: (sqliteConfig === null || sqliteConfig === void 0 ? void 0 : sqliteConfig.filename) || './test.db',
                    isLog: (_b = sqliteConfig === null || sqliteConfig === void 0 ? void 0 : sqliteConfig.isLog) !== null && _b !== void 0 ? _b : true,
                    isCount: (_c = sqliteConfig === null || sqliteConfig === void 0 ? void 0 : sqliteConfig.isCount) !== null && _c !== void 0 ? _c : true
                });
                return;
            }
        }
        catch (error) {
            console.error('获取SQLite配置失败:', error);
        }
        // 使用默认配置
        this.sqliteDb = new Sqlite78_1.default({
            filename: './test.db',
            isLog: true,
            isCount: true
        });
    }
    /**
     * 初始化数据库连接
     */
    initDb() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                if (this.sqliteDb) {
                    yield this.sqliteDb.initialize();
                    return "数据库初始化成功";
                }
                return "数据库实例未创建";
            }
            catch (error) {
                return `数据库初始化失败: ${error}`;
            }
        });
    }
    /**
     * 创建系统表（包括sys_log表）
     */
    createTables() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                if (!this.sqliteDb) {
                    return "数据库未初始化";
                }
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
                // 执行创建表语句
                const db = this.sqliteDb._db;
                yield db.run(createSysLogTable);
                // 创建索引
                for (const indexSql of createIndexes) {
                    yield db.run(indexSql);
                }
                // 创建其他系统表（调用已有的方法）
                const up = new koa78_upinfo_1.default({});
                yield this.sqliteDb.creatTb(up);
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
                if (!this.sqliteDb) {
                    return "数据库未初始化";
                }
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
                const db = this.sqliteDb._db;
                yield db.run(insertSql, values);
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
                if (!this.sqliteDb) {
                    return { error: "数据库未初始化" };
                }
                const querySql = "SELECT * FROM sys_log ORDER BY uptime DESC LIMIT 10";
                const db = this.sqliteDb._db;
                const rows = yield db.all(querySql);
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
                if (!this.sqliteDb) {
                    return { error: "数据库未初始化" };
                }
                const up = new koa78_upinfo_1.default({});
                const result = yield this.sqliteDb.doGet("SELECT * FROM sys_warn LIMIT 5", [], up);
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
                if (!this.sqliteDb) {
                    return { error: "数据库未初始化" };
                }
                const up = new koa78_upinfo_1.default({});
                const result = yield this.sqliteDb.doGet("SELECT * FROM sys_sql LIMIT 5", [], up);
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
], SqliteTest.prototype, "initDb", null);
tslib_1.__decorate([
    (0, decorators_1.ApiMethod)(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", Promise)
], SqliteTest.prototype, "createTables", null);
tslib_1.__decorate([
    (0, decorators_1.ApiMethod)(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", Promise)
], SqliteTest.prototype, "insertLog", null);
tslib_1.__decorate([
    (0, decorators_1.ApiMethod)(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", Promise)
], SqliteTest.prototype, "queryLogs", null);
tslib_1.__decorate([
    (0, decorators_1.ApiMethod)(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", Promise)
], SqliteTest.prototype, "queryWarnings", null);
tslib_1.__decorate([
    (0, decorators_1.ApiMethod)(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", Promise)
], SqliteTest.prototype, "querySqlRecords", null);
exports.default = SqliteTest;
//# sourceMappingURL=SqliteTest.js.map