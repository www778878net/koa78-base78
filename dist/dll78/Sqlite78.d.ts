import UpInfo from 'koa78-upinfo';
/**
 * SQLite数据库操作类
 * 参考Mysql78类实现
 */
export default class Sqlite78 {
    private _db;
    private _filename;
    isLog: boolean;
    isCount: boolean;
    private log;
    private warnHandler;
    private readonly maxRetryAttempts;
    private readonly retryDelayMs;
    constructor(config: {
        filename: string;
        isLog?: boolean;
        isCount?: boolean;
    });
    /**
     * 初始化数据库连接
     */
    initialize(): Promise<void>;
    /**
     * 创建系统常用表
     * Create system common table
     */
    creatTb(up: UpInfo): Promise<string>;
    /**
     * SQL查询方法
     * @param cmdtext SQL语句
     * @param values 参数值
     * @param up 用户信息
     */
    doGet(cmdtext: string, values: any[], up: UpInfo): Promise<any[]>;
    /**
     * 执行事务
     * @param cmds SQL语句数组
     * @param values 参数值二维数组
     * @param errtexts 错误文本数组
     * @param logtext 日志文本
     * @param logvalue 日志参数
     * @param up 用户信息
     */
    doT(cmds: string[], values: string[][], errtexts: string[], logtext: string, logvalue: string[], up: UpInfo): Promise<any>;
    /**
     * SQL更新方法，返回受影响的行数
     * @param cmdtext SQL语句
     * @param values 参数值
     * @param up 用户信息
     */
    doM(cmdtext: string, values: any[], up: UpInfo): Promise<number>;
    /**
     * 插入数据，返回插入的行ID
     * @param cmdtext SQL语句
     * @param values 参数值
     * @param up 用户信息
     */
    doMAdd(cmdtext: string, values: any[], up: UpInfo): Promise<number>;
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
     * 如果开启了SYS_SQL表功能，会影响性能
     * @param cmdtext SQL语句
     * @param values 参数值
     * @param dlong 执行时间
     * @param lendown 下载字节数
     * @param up 用户信息
     */
    private _saveLog;
    /**
     * 关闭数据库连接
     */
    close(): Promise<void>;
    /**
     * 辅助方法：执行SQL语句（无返回结果）
     */
    private _run;
    /**
     * 辅助方法：执行SQL查询（返回所有结果）
     */
    private _all;
    /**
     * 辅助方法：执行SQL查询（返回第一行结果）
     */
    private _get;
}
