// 使用@vscode/sqlite3替代better-sqlite3和sql.js，解决跨平台兼容性问题
import { promises as fs } from 'node:fs';
import { createHash } from 'node:crypto';
// @ts-ignore
import sqlite3 from '@vscode/sqlite3';
import { promisify } from 'util';
import UpInfo from 'koa78-upinfo';
import TsLog78 from 'tslog78';
// @ts-ignore
import md5 from 'md5';

/**
 * SQLite数据库操作类
 * 参考Mysql78类实现
 */
export default class Sqlite78 {
    private _db: sqlite3.Database | null = null;
    private _filename: string = '';
    public isLog: boolean = false;
    public isCount: boolean = false;
    private log: TsLog78 = TsLog78.Instance;
    private warnHandler: ((info: string, kind: string, up: UpInfo) => Promise<any>) | null = null;

    // 设置重试次数和重试延迟
    private readonly maxRetryAttempts: number = 3;
    private readonly retryDelayMs: number = 1000; // 1秒延迟

    constructor(config: {
        filename: string;
        isLog?: boolean;
        isCount?: boolean;
    }) {
        if (!config) return;

        this._filename = config.filename;
        this.isLog = config.isLog ?? false; // 是否打印日志（影响性能）
        this.isCount = config.isCount ?? false; // 是否统计效率（影响性能）
    }

    /**
     * 初始化数据库连接
     */
    async initialize(): Promise<void> {
        try {
            this.log.debug(`正在初始化SQLite数据库连接: ${this._filename}`);

            // 确保目录存在
            const path = await import('path');
            const fs = await import('fs');
            const dir = path.dirname(this._filename);

            try {
                await fs.promises.access(dir);
            } catch (err) {
                this.log.debug(`创建目录: ${dir}`);
                await fs.promises.mkdir(dir, { recursive: true });
            }

            // 使用@vscode/sqlite3创建数据库连接
            this._db = new sqlite3.Database(this._filename);

            // 启用外键约束
            await this._run('PRAGMA foreign_keys = ON');
            // 设置WAL模式以提高并发性能
            await this._run('PRAGMA journal_mode = WAL');

            this.log.debug(`SQLite数据库连接初始化成功: ${this._filename}`);
        } catch (err) {
            this.log.error(err as Error, `SQLite数据库连接初始化失败: ${this._filename}`);
            throw err;
        }
    }

    /**
     * 创建系统常用表
     * Create system common table
     */
    async creatTb(up: UpInfo): Promise<string> {
        if (!this._db) {
            return 'database not initialized';
        }

        const cmdtext1 = `CREATE TABLE IF NOT EXISTS sys_warn (
            uid TEXT NOT NULL DEFAULT '',
            kind TEXT NOT NULL DEFAULT '',
            apisys TEXT NOT NULL DEFAULT '',
            apiobj TEXT NOT NULL DEFAULT '',
            content TEXT NOT NULL,
            upid TEXT NOT NULL DEFAULT '',
            upby TEXT DEFAULT '',
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

        const cmdtext2 = `CREATE TABLE IF NOT EXISTS sys_sql (
            cid TEXT NOT NULL DEFAULT '',
            apiv TEXT NOT NULL DEFAULT '',
            apisys TEXT NOT NULL DEFAULT '',
            apiobj TEXT NOT NULL DEFAULT '',
            cmdtext TEXT NOT NULL,
            uname TEXT NOT NULL DEFAULT '',
            num INTEGER NOT NULL DEFAULT 0,
            dlong INTEGER NOT NULL DEFAULT 0,
            downlen INTEGER NOT NULL DEFAULT 0,
            upby TEXT NOT NULL DEFAULT '',
            cmdtextmd5 TEXT NOT NULL DEFAULT '',
            uptime DATETIME NOT NULL,
            idpk INTEGER PRIMARY KEY AUTOINCREMENT,
            id TEXT NOT NULL,
            remark TEXT NOT NULL DEFAULT '',
            remark2 TEXT NOT NULL DEFAULT '',
            remark3 TEXT NOT NULL DEFAULT '',
            remark4 TEXT NOT NULL DEFAULT '',
            remark5 TEXT NOT NULL DEFAULT '',
            remark6 TEXT NOT NULL DEFAULT '',
            UNIQUE(apiv, apisys, apiobj, cmdtext)
        )`;

        try {
            await this._run(cmdtext1);
            await this._run(cmdtext2);
            return 'ok';
        } catch (err) {
            this.log.error(`Error: ${(err as Error).message}`);
            return 'error';
        }
    }

    /**
     * SQL查询方法
     * @param cmdtext SQL语句
     * @param values 参数值
     * @param up 用户信息
     */
    async doGet(cmdtext: string, values: any[], up: UpInfo): Promise<any[]> {
        if (!this._db) {
            return [];
        }

        const debug = up.debug ?? false;
        const dstart = new Date();

        try {
            const rows = await this._all(cmdtext, values);

            if (debug) {
                this._addWarn(JSON.stringify(rows) + " c:" + cmdtext + " v" + values.join(","), "debug_" + up.apisys, up);
            }

            const lendown = JSON.stringify(rows).length;
            this._saveLog(cmdtext, values, new Date().getTime() - dstart.getTime(), lendown, up);

            return rows;
        } catch (err) {
            this._addWarn(JSON.stringify(err) + " c:" + cmdtext + " v" + values.join(","), "err_" + up.apisys, up);
            this.log.error(err as Error, 'sqlite_doGet');
            throw err;
        }
    }

    /**
     * 执行事务
     * @param cmds SQL语句数组
     * @param values 参数值二维数组
     * @param errtexts 错误文本数组
     * @param logtext 日志文本
     * @param logvalue 日志参数
     * @param up 用户信息
     */
    async doT(cmds: string[], values: string[][], errtexts: string[], logtext: string, logvalue: string[], up: UpInfo): Promise<any> {
        if (!this._db) {
            return 'database not initialized';
        }

        const debug = up.debug ?? false;
        const dstart = new Date();

        try {
            // 开始事务
            await this._run('BEGIN TRANSACTION');

            const results: any[] = [];
            for (let i = 0; i < cmds.length; i++) {
                const result = await this._run(cmds[i], values[i]);
                results.push(result);
            }

            let errmsg = "err!";
            let haveAff0 = false;
            for (let i = 0; i < results.length; i++) {
                if (results[i].changes === 0) {
                    errmsg += errtexts[i];
                    haveAff0 = true;
                    break;
                }
            }

            if (haveAff0 || results.length < cmds.length) {
                await this._run('ROLLBACK');
                return errmsg;
            }

            await this._run('COMMIT');

            this._saveLog(logtext, logvalue, new Date().getTime() - dstart.getTime(), 1, up);
            return "ok";
        } catch (err) {
            try {
                await this._run('ROLLBACK');
            } catch (rollbackErr) {
                this.log.error(rollbackErr as Error, 'sqlite_doT_rollback');
            }
            this.log.error(err as Error, 'sqlite_doT');
            return 'error';
        }
    }

    /**
     * SQL更新方法，返回受影响的行数
     * @param cmdtext SQL语句
     * @param values 参数值
     * @param up 用户信息
     */
    async doM(cmdtext: string, values: any[], up: UpInfo): Promise<{ affectedRows: number; error?: string }> {
        if (!this._db) {
            return { affectedRows: 0, error: 'database not initialized' };
        }

        const debug = up.debug ?? false;
        const dstart = new Date();

        try {
            const result = await this._run(cmdtext, values);

            if (debug) {
                this._addWarn(JSON.stringify(result) + " c:" + cmdtext + " v" + values.join(","), "debug_" + up.apisys, up);
            }

            const lendown = JSON.stringify(result).length;
            this._saveLog(cmdtext, values, new Date().getTime() - dstart.getTime(), lendown, up);

            // 如果受影响行数为0，返回明确的错误信息
            if (result.changes === 0) {
                return { affectedRows: 0, error: `更新失败，没有找到匹配的记录或数据未发生变化 (cmdtext: ${cmdtext}, values: ${JSON.stringify(values)})` };
            }

            return { affectedRows: result.changes };
        } catch (err) {
            const errorMsg = JSON.stringify(err);
            this._addWarn(errorMsg + " c:" + cmdtext + " v" + values.join(","), "err" + up.apisys, up);
            this.log.error(err as Error, 'sqlite_doM');
            return { affectedRows: 0, error: errorMsg };
        }
    }

    /**
     * 插入数据，返回插入的行ID
     * @param cmdtext SQL语句
     * @param values 参数值
     * @param up 用户信息
     */
    async doMAdd(cmdtext: string, values: any[], up: UpInfo): Promise<{ insertId: number; error?: string }> {
        if (!this._db) {
            return { insertId: 0, error: 'database not initialized' };
        }

        const debug = up.debug ?? false;
        const dstart = new Date();

        try {
            const result = await this._run(cmdtext, values);

            if (debug) {
                this._addWarn(JSON.stringify(result) + " c:" + cmdtext + " v" + values.join(","), "debug_" + up.apisys, up);
            }

            const lendown = JSON.stringify(result).length;
            this._saveLog(cmdtext, values, new Date().getTime() - dstart.getTime(), lendown, up);

            // 如果受影响行数为0，返回明确的错误信息
            if (result.changes === 0) {
                return { insertId: 0, error: `插入失败，数据未被添加 (cmdtext: ${cmdtext}, values: ${JSON.stringify(values)})` };
            }

            return { insertId: result.lastID };
        } catch (err) {
            const errorMsg = JSON.stringify(err);
            this._addWarn(errorMsg + " c:" + cmdtext + " v" + values.join(","), "err" + up.apisys, up);
            this.log.error(err as Error, 'sqlite_doMAdd');
            return { insertId: 0, error: errorMsg };
        }
    }

    /**
     * 设置警告处理器
     * @param handler 处理警告的函数
     */
    setWarnHandler(handler: (info: string, kind: string, up: UpInfo) => Promise<any>): void {
        this.warnHandler = handler;
    }

    /**
     * 调试函数，用于跟踪SQL调用的在线调试问题
     * 可以设置跟踪用户、表、目录或函数等
     * 开启会影响性能，建议主要用于跟踪开发者和正在开发的目录
     * 如果设置了自定义的warnHandler，将优先使用它处理警告
     * 否则，将警告信息插入sys_warn表
     * @param info 日志信息
     * @param kind 日志类型
     * @param up 用户上传信息
     */
    private async _addWarn(info: string, kind: string, up: UpInfo): Promise<string | number> {
        if (this.warnHandler) {
            try {
                return await this.warnHandler(info, kind, up);
            } catch (err) {
                this.log.error(err as Error, 'sqlite__addWarn_handler');
            }
        }

        if (!this._db || !this.isLog) {
            return this.isLog ? 'database not initialized' : 'isLog is false';
        }

        const cmdtext = 'INSERT INTO sys_warn (kind,apisys,apiobj,content,upby,uptime,id,upid)VALUES(?,?,?,?,?,?,?,?)';
        const values = [kind, up.apisys, up.apiobj, info, up.uname, up.uptime, UpInfo.getNewid(), up.upid];

        try {
            const result = await this._run(cmdtext, values);
            return result.changes;
        } catch (err) {
            this.log.error(err as Error, 'sqlite__addWarn');
            return 0;
        }
    }

    /**
     * 如果开启了SYS_SQL表功能，会影响性能
     * @param cmdtext SQL语句
     * @param values 参数值
     * @param dlong 执行时间
     * @param lendown 下载字节数
     * @param up 用户信息
     */
    private async _saveLog(cmdtext: string, values: any[], dlong: number, lendown: number, up: UpInfo): Promise<string> {
        if (!this.isCount || !this._db) {
            return this.isCount ? 'database not initialized' : 'isCount is false';
        }

        const cmdtextmd5 = md5(cmdtext);
        const sb = `INSERT OR IGNORE INTO sys_sql(apiv,apisys,apiobj,cmdtext,num,dlong,downlen,id,uptime,cmdtextmd5)VALUES(?,?,?,?,?,?,?,?,?,?)`;

        try {
            await this._run(sb, [
                up.v, up.apisys, up.apiobj, cmdtext, 1, dlong, lendown, UpInfo.getNewid(), new Date(), cmdtextmd5
            ]);

            // 更新计数器
            await this._run(
                'UPDATE sys_sql SET num=num+1,dlong=dlong+?,downlen=downlen+? WHERE cmdtextmd5=?',
                [dlong, lendown, cmdtextmd5]
            );

            return 'ok';
        } catch (err) {
            this.log.error(`Error: ${(err as Error).message}`);
            return 'error';
        }
    }

    /**
     * 关闭数据库连接
     */
    async close() {
        if (this._db) {
            // 使用promisify包装close方法
            const closeAsync = promisify(this._db.close.bind(this._db));
            await closeAsync();
        }
    }

    /**
     * 辅助方法：执行SQL语句（无返回结果）
     */
    private _run(sql: string, params: any[] = []): Promise<{ changes: number; lastID: number }> {
        if (!this._db) {
            return Promise.reject(new Error('database not initialized'));
        }
        return new Promise((resolve, reject) => {
            this._db!.run(sql, params, function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ changes: this.changes, lastID: this.lastID });
                }
            });
        });
    }

    /**
     * 辅助方法：执行SQL查询（返回所有结果）
     */
    private _all(sql: string, params: any[] = []): Promise<any[]> {
        if (!this._db) {
            return Promise.reject(new Error('database not initialized'));
        }
        return new Promise((resolve, reject) => {
            this._db!.all(sql, params, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    /**
     * 辅助方法：执行SQL查询（返回第一行结果）
     */
    private _get<T>(sql: string, params: any[] = []): Promise<T | undefined> {
        if (!this._db) {
            return Promise.reject(new Error('database not initialized'));
        }
        return new Promise((resolve, reject) => {
            this._db!.get(sql, params, (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row as T | undefined);
                }
            });
        });
    }
}