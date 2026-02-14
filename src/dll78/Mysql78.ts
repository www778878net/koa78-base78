import { promises as fs } from 'node:fs';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { createHash } from 'node:crypto';
import * as mysql from 'mysql2/promise';
import UpInfo from '../UpInfo';
import { MyLogger } from '../utils/mylogger';
import md5 from 'md5';

// 扩展 dayjs 以支持 UTC
dayjs.extend(utc);

/**
 * 如果不行就回退到2.4.0
 */
export default class Mysql78 {
    private _statementCache: Map<string, mysql.PreparedStatementInfo> = new Map();
    private _pool: mysql.Pool | null = null;
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
        const port = config.port ?? 3306; // 端口
        const max = config.max ?? 10; // 最大线程数
        const user = config.user ?? 'root'; // mysql用户名
        this.isLog = config.isLog ?? false; // 是否打印日志（影响性能）
        this.isCount = config.isCount ?? false; // 是否统计效率（影响性能）

        this._pool = mysql.createPool({
            connectionLimit: max,
            host: this._host,
            port,
            user,
            password: config.password,
            database: config.database,
            dateStrings: true,
            connectTimeout: 30 * 1000,
            waitForConnections: true,  // 等待连接池中的连接可用
        });
    }


    // 延迟函数
    private async delay(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // 获取连接，并在发生错误时重试
    private async getConnectionWithRetry(): Promise<mysql.PoolConnection | null> {
        let attempts = 0;
        while (attempts < this.maxRetryAttempts) {
            try {
                const connection = await this._pool?.getConnection();
                if (connection === undefined) {
                    return null;  // Explicitly return null if connection is undefined
                }
                return connection;
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

        const cmdtext1 = "CREATE TABLE IF NOT EXISTS `sys_warn` (  `uid` varchar(36) NOT NULL DEFAULT '',  `kind` varchar(100) NOT NULL DEFAULT '',  `apisys` varchar(100) NOT NULL DEFAULT '',  `apiobj` varchar(100) NOT NULL DEFAULT '',  `content` text NOT NULL,  `upid` varchar(36) NOT NULL DEFAULT '',  `upby` varchar(50) DEFAULT '',  `uptime` datetime NOT NULL,  `idpk` int(11) NOT NULL AUTO_INCREMENT,  `id` varchar(36) NOT NULL,  `remark` varchar(200) NOT NULL DEFAULT '',  `remark2` varchar(200) NOT NULL DEFAULT '',  `remark3` varchar(200) NOT NULL DEFAULT '',  `remark4` varchar(200) NOT NULL DEFAULT '',  `remark5` varchar(200) NOT NULL DEFAULT '',  `remark6` varchar(200) NOT NULL DEFAULT '',  PRIMARY KEY (`idpk`)) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=utf8;";
        const cmdtext2 = "CREATE TABLE IF NOT EXISTS `sys_sql` (  `cid` varchar(36) NOT NULL DEFAULT '',  `apiv` varchar(50) NOT NULL DEFAULT '',  `apisys` varchar(50) NOT NULL DEFAULT '',  `apiobj` varchar(50) NOT NULL DEFAULT '',  `cmdtext` varchar(200) NOT NULL,  `uname` varchar(50) NOT NULL DEFAULT '',  `num` int(11) NOT NULL DEFAULT '0',  `dlong` int(32) NOT NULL DEFAULT '0',  `downlen` bigint NOT NULL DEFAULT '0',  `upby` varchar(50) NOT NULL DEFAULT '',  `cmdtextmd5` varchar(50) NOT NULL DEFAULT '',  `uptime` datetime NOT NULL,  `idpk` int(11) NOT NULL AUTO_INCREMENT,  `id` varchar(36) NOT NULL,  `remark` varchar(200) NOT NULL DEFAULT '',  `remark2` varchar(200) NOT NULL DEFAULT '',  `remark3` varchar(200) NOT NULL DEFAULT '',  `remark4` varchar(200) NOT NULL DEFAULT '',  `remark5` varchar(200) NOT NULL DEFAULT '',  `remark6` varchar(200) NOT NULL DEFAULT '',  PRIMARY KEY (`idpk`),  UNIQUE KEY `u_v_sys_obj_cmdtext` (`apiv`,`apisys`,`apiobj`,`cmdtext`) USING BTREE) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=utf8;";

        try {
            await this._pool.execute(cmdtext1);
            await this._pool.execute(cmdtext2);
            return 'ok';
        } catch (err) {
            this.log.error('creatTb error', err as Error);
            return 'error';
        }
    }


    async getStatement(connection: mysql.PoolConnection, cmdtext: string): Promise<mysql.PreparedStatementInfo> {
        const cacheKey = `${connection.threadId}:${cmdtext}`;
        if (this._statementCache.has(cacheKey)) {
            return this._statementCache.get(cacheKey)!;
        }

        const statement = await connection.prepare(cmdtext);
        this._statementCache.set(cacheKey, statement);
        return statement;
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
        let connection: mysql.PoolConnection | null = null;
        let statement: mysql.PreparedStatementInfo | null = null;
        try {

            connection = await this.retryOperation(() => this.getConnectionWithRetry());
            if (!connection) {
                throw new Error("Failed to get a valid connection.");
            }
            statement = await this.getStatement(connection, cmdtext);
            const [rows] = await statement.execute(values);
            const back = rows as any[];

            if (debug) {
                this._addWarn(JSON.stringify(back) + " c:" + cmdtext + " v" + values.join(","), "debug_" + up.apisys, up);
            }

            const lendown = JSON.stringify(back).length;
            this._saveLog(cmdtext, values, new Date().getTime() - dstart.getTime(), lendown, up);

            return back;
        } catch (err) {
            this._addWarn(JSON.stringify(err) + " c:" + cmdtext + " v" + values.join(","), "err_" + up.apisys, up);
            this.log.error('mysql_doGet error', err as Error);
            throw err;
        } finally {
            // if (statement) {
            //     await statement.close(); // 确保预处理语句被关闭
            // }
            if (connection) {
                connection.release(); // 确保连接被释放
            }
        }
    }

    async doT(cmds: string[], values: string[][], errtexts: string[], logtext: string, logvalue: string[], up: UpInfo): Promise<any> {
        if (!this._pool) {
            return 'pool null';
        }

        const debug = up.debug ?? false;
        const dstart = new Date();
        let connection: mysql.PoolConnection | null = null;

        try {
            connection = await this.retryOperation(() => this.getConnectionWithRetry());
            if (!connection) {
                throw new Error("Failed to get a valid connection.");
            }
            await connection.beginTransaction();

            const promises: Promise<any>[] = [];
            for (let i = 0; i < cmds.length; i++) {
                promises.push(this.doTran(cmds[i], values[i], connection, up));
            }

            const results = await Promise.all(promises);

            let errmsg = "err!";
            let haveAff0 = false;
            for (let i = 0; i < results.length; i++) {
                if (results[i].affectedRows === 0) {
                    errmsg += errtexts[i];
                    haveAff0 = true;
                    break;
                }
            }

            if (haveAff0 || results.length < cmds.length) {
                await connection.rollback();
                connection.release();
                return errmsg;
            }

            await connection.commit();
            connection.release();

            this._saveLog(logtext, logvalue, new Date().getTime() - dstart.getTime(), 1, up);
            return "ok";
        } catch (err) {
            if (connection) {
                await connection.rollback();
                connection.release();
            }
            this.log.error('mysql_doT error', err as Error);
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
        let connection: mysql.PoolConnection | null = null;
        let statement: mysql.PreparedStatementInfo | null = null;

        try {
            connection = await this.retryOperation(() => this.getConnectionWithRetry());
            if (!connection) {
                throw new Error("Failed to get a valid connection.");
            }
            statement = await this.getStatement(connection, cmdtext);
            const [result] = await statement.execute(values);

            if (debug) {
                this._addWarn(JSON.stringify(result) + " c:" + cmdtext + " v" + values.join(","), "debug_" + up.apisys, up);
            }

            const lendown = JSON.stringify(result).length;
            this._saveLog(cmdtext, values, new Date().getTime() - dstart.getTime(), lendown, up);

            return { result };
        } catch (err) {
            const errorMsg = JSON.stringify(err);
            this._addWarn(errorMsg + " c:" + cmdtext + " v" + values.join(","), "err" + up.apisys, up);
            this.log.error('mysql_doMBack error', err as Error);
            return { result: {}, error: errorMsg };
        } finally {
            // if (statement) {
            //     await statement.close(); // 确保预处理语句被关闭
            // }
            if (connection) {
                connection.release(); // 确保连接被释放
            }
        }
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
        let connection: mysql.PoolConnection | null = null;
        let statement: mysql.PreparedStatementInfo | null = null;

        try {
            connection = await this.retryOperation(() => this.getConnectionWithRetry());
            if (!connection) {
                throw new Error("Failed to get a valid connection.");
            }
            statement = await this.getStatement(connection, cmdtext);
            const [result] = await statement.execute(values);
            const affectedRows = (result as mysql.ResultSetHeader).affectedRows;

            if (debug) {
                this._addWarn(JSON.stringify(result) + " c:" + cmdtext + " v" + values.join(","), "debug_" + up.apisys, up);
            }

            const lendown = JSON.stringify(result).length;
            this._saveLog(cmdtext, values, new Date().getTime() - dstart.getTime(), lendown, up);

            // 如果受影响行数为0，返回明确的错误信息
            if (affectedRows === 0) {
                return { affectedRows: 0, error: `更新失败，没有找到匹配的记录或数据未发生变化 (cmdtext: ${cmdtext}, values: ${JSON.stringify(values)})` };
            }

            return { affectedRows };
        } catch (err) {
            const errorMsg = JSON.stringify(err);
            const errorWithSql = `${errorMsg} (cmdtext: ${cmdtext}, values: ${JSON.stringify(values)})`;
            this._addWarn(errorMsg + " c:" + cmdtext + " v" + values.join(","), "err" + up.apisys, up);
            this.log.error(`mysql_doM cmdtext: ${cmdtext} values: ${JSON.stringify(values)}`, err as Error);
            return { affectedRows: 0, error: errorWithSql };
        } finally {
            // if (statement) {
            //     await statement.close(); // 确保预处理语句被关闭
            // }
            if (connection) {
                connection.release(); // 确保连接被释放
            }
        }
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
            const [result] = await this._pool.execute(cmdtext, values);
            const insertId = (result as mysql.ResultSetHeader).insertId;
            const affectedRows = (result as mysql.ResultSetHeader).affectedRows;

            if (debug) {
                this._addWarn(JSON.stringify(result) + " c:" + cmdtext + " v" + values.join(","), "debug_" + up.apisys, up);
            }

            const lendown = JSON.stringify(result).length;
            this._saveLog(cmdtext, values, new Date().getTime() - dstart.getTime(), lendown, up);

            // 如果受影响行数为0，返回明确的错误信息
            if (affectedRows === 0) {
                return { insertId: 0, error: `插入失败，数据未被添加 (cmdtext: ${cmdtext}, values: ${JSON.stringify(values)})` };
            }

            return { insertId };
        } catch (err) {
            const errorMsg = JSON.stringify(err);
            this._addWarn(errorMsg + " c:" + cmdtext + " v" + values.join(","), "err" + up.apisys, up);
            this.log.error('mysql_doMAdd error', err as Error);
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
    async doTran(cmdtext: string, values: any[], con: mysql.PoolConnection, up: UpInfo): Promise<any> {
        const debug = up.debug ?? false;

        try {
            const [result] = await con.execute(cmdtext, values);

            if (debug) {

                this.log.info(`${cmdtext} v:${values.join(",")} r:${JSON.stringify(result)} 0, 'mysql', 'doTran', ${up.uname}`, 0);
            }

            return result;
        } catch (err) {
            this.log.error('mysql_doTran error', err as Error);
            throw err;
        }
    }

    /**
     * doget doM  does not need to be released manually
     * getConnection 
     * */
    async releaseConnection(client: mysql.PoolConnection): Promise<void> {
        if (this._pool) {
            this._pool.releaseConnection(client);
        }
    }

    /**
     * Get the connection (remember to release it)
     * */
    async getConnection(): Promise<mysql.PoolConnection | null> {
        if (!this._pool) {
            return null;
        }

        try {
            const connection = await this._pool.getConnection();
            return connection;
        } catch (err) {
            this.log.error('mysql_getConnection error', err as Error);
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
                this.log.error('mysql__addWarn_handler error', err as Error);
            }
        }

        if (!this._pool || !this.isLog) {
            return this.isLog ? 'pool null' : 'isLog is false';
        }

        const cmdtext = 'INSERT INTO sys_warn (`kind`,apisys,apiobj,`content`,`upby`,`uptime`,`id`,upid)VALUES(?,?,?,?,?,?,?,?)';
        const values = [kind, up.apisys, up.apiobj, info, up.uname, dayjs().utc().format('YYYY-MM-DD HH:mm:ss'), UpInfo.getNewid(), up.upid];

        try {
            const [results] = await this._pool.execute(cmdtext, values);
            return (results as mysql.ResultSetHeader).affectedRows;
        } catch (err) {
            this.log.error('mysql__addWarn error', err as Error);
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
        const sb = 'INSERT INTO sys_sql(apiv,apisys,apiobj,cmdtext,num,dlong,downlen,id,uptime,cmdtextmd5)VALUES(?,?,?,?,?,?,?,?,?,?) ' +
            'ON DUPLICATE KEY UPDATE num=num+1,dlong=dlong+?,downlen=downlen+?';

        try {
            await this._pool.execute(sb, [
                up.v, up.apisys, up.apiobj, cmdtext, 1, dlong, lendown, UpInfo.getNewid(), dayjs().utc().format('YYYY-MM-DD HH:mm:ss'), cmdtextmd5,
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