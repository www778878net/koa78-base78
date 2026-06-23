import { promises as fs } from 'node:fs';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { Pool, PoolClient, QueryResult } from 'pg';
import UpInfo from '../UpInfo';
import { MyLogger } from '../utils/mylogger';
import md5 from 'md5';
import { nextIdString } from '../config/snowflake';

// 扩展 dayjs 以支持 UTC
dayjs.extend(utc);

/**
 * PostgreSQL 数据库操作类
 * 与 Mysql78 保持相同的接口，适配 PostgreSQL
 */
export default class Postgres78 {
    private _pool: Pool | null = null;
    private _host: string = '';
    public isLog: boolean = false;
    public isCount: boolean = false;
    private log: MyLogger = MyLogger.getInstance("base78", 3, "koa78");
    private warnHandler: ((info: string, kind: string, up: UpInfo) => Promise<any>) | null = null;

    // 设置重试次数和重试延迟
    private readonly maxRetryAttempts: number = 3;
    private readonly retryDelayMs: number = 1000; // 1秒延迟

    constructor(config: {
        host?: string;
        port?: number;
        max?: number;
        user?: string;
        password: string;
        database: string;
        isLog?: boolean;
        isCount?: boolean;
    }) {
        if (!config) return;

        this._host = config.host ?? '127.0.0.1';
        const port = config.port ?? 5432; // PostgreSQL 默认端口
        const max = config.max ?? 10; // 最大连接数
        const user = config.user ?? 'postgres'; // PostgreSQL 默认用户
        this.isLog = config.isLog ?? false; // 是否打印日志（影响性能）
        this.isCount = config.isCount ?? false; // 是否统计效率（影响性能）

        this._pool = new Pool({
            max: max,
            host: this._host,
            port,
            user,
            password: config.password,
            database: config.database,
            connectionTimeoutMillis: 30 * 1000,
            idleTimeoutMillis: 30000,
        });
    }

    // 延迟函数
    private async delay(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // 获取连接，并在发生错误时重试
    private async getConnectionWithRetry(): Promise<PoolClient | null> {
        let attempts = 0;
        while (attempts < this.maxRetryAttempts) {
            try {
                const client = await this._pool?.connect();
                if (client === undefined) {
                    return null;
                }
                return client;
            } catch (err) {
                attempts++;
                this.log.error(`Connection attempt ${attempts} failed:`, err);
                if (attempts >= this.maxRetryAttempts) {
                    throw err;
                }
                await this.delay(this.retryDelayMs);
            }
        }
        return null;
    }

    // 重试函数的包装：用于 `doGet`、`doM`、`doT` 等方法
    private async retryOperation<T>(operation: () => Promise<T>): Promise<T> {
        let attempts = 0;
        while (attempts < this.maxRetryAttempts) {
            try {
                return await operation();
            } catch (err) {
                attempts++;
                this.log.error(`Operation attempt ${attempts} failed:`, err);
                if (attempts >= this.maxRetryAttempts) {
                    throw err;
                }
                await this.delay(this.retryDelayMs);
            }
        }
        throw new Error("Max retry attempts reached.");
    }

    /**
     * 创建系统常用表
     * Create system common table
     *
     * */
    async creatTb(up: UpInfo): Promise<string> {
        if (!this._pool) {
            return 'pool null';
        }

        const cmdtext1 = `CREATE TABLE IF NOT EXISTS "sys_warn" (
            "uid" varchar(36) NOT NULL DEFAULT '',
            "kind" varchar(100) NOT NULL DEFAULT '',
            "apimicro" varchar(100) NOT NULL DEFAULT '',
            "apiobj" varchar(100) NOT NULL DEFAULT '',
            "content" text NOT NULL,
            "upid" varchar(36) NOT NULL DEFAULT '',
            "upby" varchar(50) DEFAULT '',
            "uptime" timestamp NOT NULL,
            "id" BIGSERIAL,
            "remark" varchar(200) NOT NULL DEFAULT '',
            "remark2" varchar(200) NOT NULL DEFAULT '',
            "remark3" varchar(200) NOT NULL DEFAULT '',
            "remark4" varchar(200) NOT NULL DEFAULT '',
            "remark5" varchar(200) NOT NULL DEFAULT '',
            "remark6" varchar(200) NOT NULL DEFAULT '',
            PRIMARY KEY ("id")
        );`;

        const cmdtext2 = `CREATE TABLE IF NOT EXISTS "sys_sql" (
            "cid" varchar(36) NOT NULL DEFAULT '',
            "apisys" varchar(50) NOT NULL DEFAULT '',
            "apimicro" varchar(50) NOT NULL DEFAULT '',
            "apiobj" varchar(50) NOT NULL DEFAULT '',
            "cmdtext" varchar(200) NOT NULL,
            "uname" varchar(50) NOT NULL DEFAULT '',
            "num" integer NOT NULL DEFAULT 0,
            "dlong" integer NOT NULL DEFAULT 0,
            "downlen" bigint NOT NULL DEFAULT 0,
            "upby" varchar(50) NOT NULL DEFAULT '',
            "cmdtextmd5" varchar(50) NOT NULL DEFAULT '',
            "uptime" timestamp NOT NULL,
            "id" BIGSERIAL,
            "remark" varchar(200) NOT NULL DEFAULT '',
            "remark2" varchar(200) NOT NULL DEFAULT '',
            "remark3" varchar(200) NOT NULL DEFAULT '',
            "remark4" varchar(200) NOT NULL DEFAULT '',
            "remark5" varchar(200) NOT NULL DEFAULT '',
            "remark6" varchar(200) NOT NULL DEFAULT '',
            PRIMARY KEY ("id"),
            CONSTRAINT "u_v_sys_obj_cmdtext" UNIQUE ("apisys","apimicro","apiobj","cmdtext")
        );`;

        try {
            await this._pool.query(cmdtext1);
            await this._pool.query(cmdtext2);
            return 'ok';
        } catch (err) {
            this.log.error('creatTb error', err as Error);
            return 'error';
        }
    }

    /**
     * sql get
     * @param cmdtext sql
     * @param values
     * @param up user upload
     */
    async doGet(cmdtext: string, values: any[], up: UpInfo): Promise<any[]> {
        if (!this._pool) {
            return [];
        }

        const debug = up.debug ?? false;
        const dstart = new Date();
        let client: PoolClient | null = null;
        let attempts = 0;
        const maxAttempts = 2;

        while (attempts < maxAttempts) {
            attempts++;
            try {
                client = await this.retryOperation(() => this.getConnectionWithRetry());
                if (!client) {
                    throw new Error("Failed to get a valid connection.");
                }
                const result = await client.query(cmdtext, values);
                const back = result.rows;

                if (debug) {
                    this._addWarn(JSON.stringify(back) + " c:" + cmdtext + " v" + values.join(","), "debug_" + up.apimicro, up);
                }

                const lendown = JSON.stringify(back).length;
                this._saveLog(cmdtext, values, new Date().getTime() - dstart.getTime(), lendown, up);

                return back;
            } catch (err: any) {
                this._addWarn(JSON.stringify(err) + " c:" + cmdtext + " v" + values.join(","), "err_" + up.apimicro, up);
                this.log.error('postgres_doGet error', err as Error);
                throw err;
            } finally {
                if (client) {
                    client.release();
                }
            }
        }
        return [];
    }

    async doT(cmds: string[], values: string[][], errtexts: string[], logtext: string, logvalue: string[], up: UpInfo): Promise<any> {
        if (!this._pool) {
            return 'pool null';
        }

        const debug = up.debug ?? false;
        const dstart = new Date();
        let client: PoolClient | null = null;

        try {
            client = await this.retryOperation(() => this.getConnectionWithRetry());
            if (!client) {
                throw new Error("Failed to get a valid connection.");
            }
            await client.query('BEGIN');

            const promises: Promise<any>[] = [];
            for (let i = 0; i < cmds.length; i++) {
                promises.push(this.doTran(cmds[i], values[i], client, up));
            }

            const results = await Promise.all(promises);

            let errmsg = "err!";
            let haveAff0 = false;
            for (let i = 0; i < results.length; i++) {
                if (results[i].rowCount === 0) {
                    errmsg += errtexts[i];
                    haveAff0 = true;
                    break;
                }
            }

            if (haveAff0 || results.length < cmds.length) {
                await client.query('ROLLBACK');
                client.release();
                return errmsg;
            }

            await client.query('COMMIT');
            client.release();

            this._saveLog(logtext, logvalue, new Date().getTime() - dstart.getTime(), 1, up);
            return "ok";
        } catch (err) {
            if (client) {
                await client.query('ROLLBACK');
                client.release();
            }
            this.log.error('postgres_doT error', err as Error);
            return 'error';
        }
    }

    /**
    * sql update Method returns the full result set
    * @param cmdtext sql
    * @param values
    * @param up user upload
    */
    async doMBack(cmdtext: string, values: any[], up: UpInfo): Promise<{ result: any; error?: string }> {
        if (!this._pool) {
            return { result: {}, error: 'pool null' };
        }

        const debug = up.debug ?? false;
        const dstart = new Date();
        let client: PoolClient | null = null;
        let attempts = 0;
        const maxAttempts = 2;

        while (attempts < maxAttempts) {
            attempts++;
            try {
                client = await this.retryOperation(() => this.getConnectionWithRetry());
                if (!client) {
                    throw new Error("Failed to get a valid connection.");
                }
                const result = await client.query(cmdtext, values);

                if (debug) {
                    this._addWarn(JSON.stringify(result.rows) + " c:" + cmdtext + " v" + values.join(","), "debug_" + up.apimicro, up);
                }

                const lendown = JSON.stringify(result.rows).length;
                this._saveLog(cmdtext, values, new Date().getTime() - dstart.getTime(), lendown, up);

                return { result: result.rows };
            } catch (err: any) {
                const errorMsg = JSON.stringify(err);
                this._addWarn(errorMsg + " c:" + cmdtext + " v" + values.join(","), "err" + up.apimicro, up);
                this.log.error('postgres_doMBack error', err as Error);
                return { result: {}, error: errorMsg };
            } finally {
                if (client) {
                    client.release();
                }
            }
        }
        return { result: {}, error: 'max attempts exceeded' };
    }

    /**
     * sql update Method returns the number of affected rows
     * @param cmdtext sql
     * @param values
     * @param up user upload
     */
    async doM(cmdtext: string, values: any[], up: UpInfo): Promise<{ affectedRows: number; error?: string }> {
        if (!this._pool) {
            return { affectedRows: 0, error: 'pool null' };
        }

        const debug = up.debug ?? false;
        const dstart = new Date();
        let client: PoolClient | null = null;
        let attempts = 0;
        const maxAttempts = 2;

        while (attempts < maxAttempts) {
            attempts++;
            try {
                client = await this.retryOperation(() => this.getConnectionWithRetry());
                if (!client) {
                    throw new Error("Failed to get a valid connection.");
                }
                const result = await client.query(cmdtext, values);
                const affectedRows = result.rowCount || 0;

                if (debug) {
                    this._addWarn(JSON.stringify(result.rows) + " c:" + cmdtext + " v" + values.join(","), "debug_" + up.apimicro, up);
                }

                const lendown = JSON.stringify(result.rows).length;
                this._saveLog(cmdtext, values, new Date().getTime() - dstart.getTime(), lendown, up);

                // 如果受影响行数为0，返回明确的错误信息
                if (affectedRows === 0) {
                    return { affectedRows: 0, error: `更新失败，没有找到匹配的记录或数据未发生变化 (cmdtext: ${cmdtext}, values: ${JSON.stringify(values)})` };
                }

                return { affectedRows };
            } catch (err: any) {
                const errorMsg = JSON.stringify(err);
                const errorWithSql = `${errorMsg} (cmdtext: ${cmdtext}, values: ${JSON.stringify(values)})`;
                this._addWarn(errorMsg + " c:" + cmdtext + " v" + values.join(","), "err" + up.apimicro, up);
                this.log.error(`postgres_doM cmdtext: ${cmdtext} values: ${JSON.stringify(values)}`, err as Error);
                return { affectedRows: 0, error: errorWithSql };
            } finally {
                if (client) {
                    client.release();
                }
            }
        }
        return { affectedRows: 0, error: 'max attempts exceeded' };
    }

    /**
     * Inserting a row returns the inserted row number
     * @param cmdtext
     * @param values
     * @param up
     */
    async doMAdd(cmdtext: string, values: any[], up: UpInfo): Promise<{ insertId: number; error?: string }> {
        if (!this._pool) {
            return { insertId: 0, error: 'pool null' };
        }

        const debug = up.debug ?? false;
        const dstart = new Date();

        try {
            // PostgreSQL 需要在 INSERT 语句中添加 RETURNING id 来获取插入的 ID
            const result = await this._pool.query(cmdtext, values);
            const insertId = result.rows[0]?.id || 0;
            const affectedRows = result.rowCount || 0;

            if (debug) {
                this._addWarn(JSON.stringify(result.rows) + " c:" + cmdtext + " v" + values.join(","), "debug_" + up.apimicro, up);
            }

            const lendown = JSON.stringify(result.rows).length;
            this._saveLog(cmdtext, values, new Date().getTime() - dstart.getTime(), lendown, up);

            // 如果受影响行数为0，返回明确的错误信息
            if (affectedRows === 0) {
                return { insertId: 0, error: `插入失败，数据未被添加 (cmdtext: ${cmdtext}, values: ${JSON.stringify(values)})` };
            }

            return { insertId };
        } catch (err) {
            const errorMsg = JSON.stringify(err);
            this._addWarn(errorMsg + " c:" + cmdtext + " v" + values.join(","), "err" + up.apimicro, up);
            this.log.error('postgres_doMAdd error', err as Error);
            return { insertId: 0, error: errorMsg };
        }
    }

    /**
     * Transactions are executed piecemeal (it is usually better not to use doT)
     * You need to release the connection yourself
     * There may be complicated scenarios where the first sentence is successful but what condition has changed and you still need to roll back the transaction
     * @param cmdtext
     * @param values
     * @param con
     * @param up
     */
    async doTran(cmdtext: string, values: any[], con: PoolClient, up: UpInfo): Promise<any> {
        const debug = up.debug ?? false;

        try {
            const result = await con.query(cmdtext, values);

            if (debug) {
                this.log.info(`${cmdtext} v:${values.join(",")} r:${JSON.stringify(result.rows)} 0, 'postgres', 'doTran', ${up.uname}`, 0);
            }

            return result;
        } catch (err) {
            this.log.error('postgres_doTran error', err as Error);
            throw err;
        }
    }

    /**
     * doget doM  does not need to be released manually
     * getConnection
     * */
    async releaseConnection(client: PoolClient): Promise<void> {
        if (client) {
            client.release();
        }
    }

    /**
     * Get the connection (remember to release it)
     * */
    async getConnection(): Promise<PoolClient | null> {
        if (!this._pool) {
            return null;
        }

        try {
            const client = await this._pool.connect();
            return client;
        } catch (err) {
            this.log.error('postgres_getConnection error', err as Error);
            return null;
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
                this.log.error('postgres__addWarn_handler error', err as Error);
            }
        }

        if (!this._pool || !this.isLog) {
            return this.isLog ? 'pool null' : 'isLog is false';
        }

        const cmdtext = 'INSERT INTO "sys_warn" ("kind",apimicro,apiobj,"content","upby","uptime","id",upid)VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id';
        const values = [kind, up.apimicro, up.apiobj, info, up.uname || '', dayjs().utc().format('YYYY-MM-DD HH:mm:ss'), nextIdString(), up.upid];

        try {
            const result = await this._pool.query(cmdtext, values);
            return result.rowCount || 0;
        } catch (err) {
            this.log.error('postgres__addWarn error', err as Error);
            return 0;
        }
    }

    /**
     * If the table name SYS_SQL is opened after the function, it will affect performance
     * @param cmdtext SQL
     * @param values
     * @param dlong Function Timing
     * @param lendown down bytes
     * @param up user upload
     */
    private async _saveLog(cmdtext: string, values: any[], dlong: number, lendown: number, up: UpInfo): Promise<string> {
        if (!this.isCount || !this._pool) {
            return this.isCount ? 'pool null' : 'isCount is false';
        }

        const cmdtextmd5 = md5(cmdtext);
        const sb = `INSERT INTO "sys_sql"(apisys,apimicro,apiobj,cmdtext,num,dlong,downlen,id,uptime,cmdtextmd5)VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
            ON CONFLICT ("apisys","apimicro","apiobj","cmdtext") DO UPDATE SET num=num+1,dlong=dlong+$11,downlen=downlen+$12`;

        try {
            await this._pool.query(sb, [
                up.apisys, up.apimicro, up.apiobj, cmdtext, 1, dlong, lendown, nextIdString(), dayjs().utc().format('YYYY-MM-DD HH:mm:ss'), cmdtextmd5,
                dlong, lendown
            ]);
            return 'ok';
        } catch (err) {
            this.log.error('_saveLog error', err as Error);
            return 'error';
        }
    }

    async close() {
        if (this._pool) {
            await this._pool.end();
        }
    }
}