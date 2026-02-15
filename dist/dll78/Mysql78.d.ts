import * as mysql from 'mysql2/promise';
import UpInfo from '../UpInfo';
/**
 * 如果不行就回退到2.4.0
 */
export default class Mysql78 {
    private _statementCache;
    private _pool;
    private _host;
    isLog: boolean;
    isCount: boolean;
    private log;
    private warnHandler;
    private readonly maxRetryAttempts;
    private readonly retryDelayMs;
    constructor(config: {
        host?: string;
        port?: number;
        max?: number;
        user?: string;
        password: string;
        database: string;
        isLog?: boolean;
        isCount?: boolean;
    });
    private delay;
    private getConnectionWithRetry;
    private retryOperation;
    /**
     * 创建系统常用表
     * Create system common table
     *
     * */
    creatTb(up: UpInfo): Promise<string>;
    getStatement(connection: mysql.PoolConnection, cmdtext: string): Promise<mysql.PreparedStatementInfo>;
    /**
     * sql get
     * @param cmdtext sql
     * @param values
     * @param up user upload
     */
    doGet(cmdtext: string, values: any[], up: UpInfo): Promise<any[]>;
    doT(cmds: string[], values: string[][], errtexts: string[], logtext: string, logvalue: string[], up: UpInfo): Promise<any>;
    /**
    * sql update Method returns the full result set
    * @param cmdtext sql
    * @param values
    * @param up user upload
    */
    doMBack(cmdtext: string, values: any[], up: UpInfo): Promise<{
        result: any;
        error?: string;
    }>;
    /**
     * sql update Method returns the number of affected rows
     * @param cmdtext sql
     * @param values
     * @param up user upload
     */
    doM(cmdtext: string, values: any[], up: UpInfo): Promise<{
        affectedRows: number;
        error?: string;
    }>;
    /**
     * Inserting a row returns the inserted row number
     * @param cmdtext
     * @param values
     * @param up
     */
    doMAdd(cmdtext: string, values: any[], up: UpInfo): Promise<{
        insertId: number;
        error?: string;
    }>;
    /**
     * Transactions are executed piecemeal (it is usually better not to use doT)
     * You need to release the connection yourself
     * There may be complicated scenarios where the first sentence is successful but what condition has changed and you still need to roll back the transaction
     * @param cmdtext
     * @param values
     * @param con
     * @param up
     */
    doTran(cmdtext: string, values: any[], con: mysql.PoolConnection, up: UpInfo): Promise<any>;
    /**
     * doget doM  does not need to be released manually
     * getConnection
     * */
    releaseConnection(client: mysql.PoolConnection): Promise<void>;
    /**
     * Get the connection (remember to release it)
     * */
    getConnection(): Promise<mysql.PoolConnection | null>;
    /**
     * 设置警告处理器
     * @param handler 处理警告的函数
     */
    setWarnHandler(handler: (info: string, kind: string, up: UpInfo) => Promise<any>): void;
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
    private _addWarn;
    /**
     * If the table name SYS_SQL is opened after the function, it will affect performance
     * @param cmdtext SQL
     * @param values
     * @param dlong Function Timing
     * @param lendown down bytes
     * @param up user upload
     */
    private _saveLog;
    close(): Promise<void>;
}
