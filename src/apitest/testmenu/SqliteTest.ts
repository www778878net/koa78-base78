import { CidBase78 } from '../../controllers/Base78';
import { ApiMethod } from '../../interfaces/decorators';
import { QueryBuilder } from '../../utils/QueryBuilder';
import { TableSchemas } from '../../config/tableConfig';
import UpInfo from 'koa78-upinfo';

export default class sqlitetest extends CidBase78<TableSchemas['SqliteTest']> {

    /**
     * 初始化数据库连接
     */

    async initDb(): Promise<string> {
        try {
            // 使用DatabaseService中的方法测试SQLite连接
            // 使用当前请求的up对象而不是创建一个新的空对象
            await this.dbService.sqliteGet("SELECT 1", [], this.up);
            return "数据库连接测试成功";
        } catch (error) {
            return `数据库连接测试失败: ${error}`;
        }
    }

    /**
     * 创建系统表（包括sys_log表）
     */

    async createTables(): Promise<string> {
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

            const up = new UpInfo({} as any);

            // 执行创建表语句
            await this.dbService.sqliteM(createSysLogTable, [], up);

            // 创建索引
            for (const indexSql of createIndexes) {
                await this.dbService.sqliteM(indexSql, [], up);
            }

            // 创建其他系统表（调用已有的方法）
            await this.dbService.sqliteM("CREATE TABLE IF NOT EXISTS sys_warn (uid TEXT NOT NULL DEFAULT '')", [], up);
            await this.dbService.sqliteM("CREATE TABLE IF NOT EXISTS sys_sql (cid TEXT NOT NULL DEFAULT '')", [], up);

            return "所有表创建成功";
        } catch (error) {
            return `创建表失败: ${error}`;
        }
    }

    /**
     * 插入测试数据到sys_log表
     */

    async insertLog(): Promise<string> {
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

            const up = new UpInfo({} as any);
            await this.dbService.sqliteM(insertSql, values, up);

            return "日志插入成功";
        } catch (error) {
            return `插入日志失败: ${error}`;
        }
    }

    /**
     * 查询sys_log表中的数据
     */

    async queryLogs(): Promise<any> {
        try {
            const querySql = "SELECT * FROM sys_log ORDER BY uptime DESC LIMIT 10";

            const up = new UpInfo({} as any);
            const rows = await this.dbService.sqliteGet(querySql, [], up);

            return {
                message: "查询成功",
                count: rows.length,
                data: rows
            };
        } catch (error) {
            return { error: `查询日志失败: ${error}` };
        }
    }

    /**
     * 查询sys_warn表中的数据
     */

    async queryWarnings(): Promise<any> {
        try {
            const up = new UpInfo({} as any);
            const result = await this.dbService.sqliteGet("SELECT * FROM sys_warn LIMIT 5", [], up);

            return {
                message: "警告信息查询成功",
                count: result.length,
                data: result
            };
        } catch (error) {
            return { error: `查询警告信息失败: ${error}` };
        }
    }

    /**
     * 查询sys_sql表中的数据
     */

    async querySqlRecords(): Promise<any> {
        try {
            const up = new UpInfo({} as any);
            const result = await this.dbService.sqliteGet("SELECT * FROM sys_sql LIMIT 5", [], up);

            return {
                message: "SQL记录查询成功",
                count: result.length,
                data: result
            };
        } catch (error) {
            return { error: `查询SQL记录失败: ${error}` };
        }
    }
}