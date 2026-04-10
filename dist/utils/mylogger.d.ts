/**
 * MyLogger TypeScript 版本
 *
 * 功能与 Python 版本完全一致：
 * 1. 统一日志管理：所有日志通过此类记录
 * 2. 动态调整日志级别：避免打日志又删除的重复操作
 * 3. 日志隔离：每个工作流有独立的日志文件
 * 4. 单例模式：相同 workflow_id 自动复用同一实例
 * 5. 自动日志清理：保留指定天数的日志
 * 6. 环境适配：生产/开发/测试环境不同日志级别
 *
 * @example
 * ```typescript
 * const logger = MyLogger.getInstance("workflow_id", 3);
 * logger.info("消息");
 * logger.detail("详细日志");
 * ```
 *
 * 说明：
 * - 相同 workflow_id 自动复用同一实例
 * - 日志文件：logs/{workflow_id}/{workflow_id}_日期.log 和 detail.log
 * - DETAIL 级别日志只写入文件，不输出到控制台
 * - 控制台只输出 DEBUG 级别及以上的日志
 */
/**
 * 日志级别枚举
 */
export declare enum LogLevel {
    DETAIL = 5,
    DEBUG = 10,
    INFO = 20,
    WARN = 30,
    ERROR = 40
}
/**
 * 环境类型枚举
 */
export declare enum Environment {
    PRODUCTION = "production",
    DEVELOPMENT = "development",
    TEST = "test"
}
/**
 * MyLogger 类
 */
export declare class MyLogger {
    /** 实例缓存字典：{workflow_name: MyLogger_instance} */
    private static _instances;
    /** 文件写入锁（使用简单的 Promise 链确保同步） */
    private _writeLock;
    /** 日志记录器名称/工作流ID */
    private readonly myname;
    /** 工作流名称（用于日志目录分类） */
    private readonly wfname;
    /** 日志保留天数 */
    private readonly logRetentionDays;
    /** 是否已初始化 */
    private _initialized;
    /** 当前环境 */
    private currentEnvironment;
    /** 文件日志级别 */
    private levelFile;
    /** 控制台日志级别 */
    private levelConsole;
    /** 是否启用 detail 日志 */
    private detailLoggerEnabled;
    /**
     * 私有构造函数，使用 getInstance 获取实例
     */
    private constructor();
    /**
     * 获取 MyLogger 实例（单例模式）
     * @param myname 工作流ID/名称
     * @param logRetentionDays 日志保留天数，默认3天
     * @param wfname 工作流名称（用于日志目录分类）
     */
    static getInstance(myname: string, logRetentionDays?: number, wfname?: string): MyLogger;
    /**
     * 获取日志目录路径
     * - 如果 wfname 不为空，返回 logs/{wfname}
     * - 否则返回 logs/{myname}
     *
     * 注意：为了避免日志文件分散，建议在调用 getInstance 时指定 wfname
     * 例如：MyLogger.getInstance("controller_name", 3, "base78")
     * 这样所有控制器的日志都会在 logs/base78/ 目录下
     */
    private _getLogDir;
    /**
     * 设置标准日志记录器
     */
    private _setupStandardLogger;
    /**
     * 从环境变量设置环境
     */
    setEnvironmentFromEnvVar(): void;
    /**
     * 设置环境
     */
    setEnvironment(env: Environment): void;
    /**
     * 更新日志级别
     */
    private updateLogLevels;
    /**
     * 手动设置日志级别
     */
    setupLevel(fileLevel: number, consoleLevel: number): void;
    /**
     * 清理过期日志文件，保留最近 N 天的日志
     */
    private _cleanupOldLogs;
    /**
     * 启用 detail 日志文件记录功能
     */
    private _setupDetailFile;
    /**
     * 清空 detail 日志文件内容
     */
    clearDetailLog(): void;
    /**
     * 写入到控制台
     */
    private _writeToConsole;
    /**
     * 写入到文件（使用锁确保线程安全）
     */
    private _writeToFile;
    /**
     * 写入详细日志到 detail.log 文件
     * detail.log 记录所有级别的日志
     */
    private _writeToDetailFile;
    /**
     * 格式化日志消息
     */
    private _formatLogMessage;
    /**
     * 核心日志记录方法
     */
    private _logWithPars;
    /**
     * 格式化异常信息，包括堆栈跟踪
     */
    formatException(exc: any): string;
    /**
     * 记录 DETAIL 级别日志
     */
    detail(message: string, error?: any): void;
    /**
     * 记录 DEBUG 级别日志
     */
    debug(message: string, error?: any): void;
    /**
     * 记录 INFO 级别日志
     */
    info(message: string, error?: any): void;
    /**
     * 记录 WARN 级别日志
     */
    warn(message: string, error?: any): void;
    /**
     * 记录 WARNING 级别日志（别名）
     */
    warning(message: string, error?: any): void;
    /**
     * 记录 ERROR 级别日志
     */
    error(message: string, error?: any): void;
    /**
     * 记录异常日志
     */
    exception(exc: Error, level?: LogLevel): void;
    /**
     * 记录 CRITICAL 级别日志（等同于 ERROR）
     */
    critical(message: string, error?: any): void;
}
/**
 * 便捷函数：获取或创建 MyLogger 实例
 */
export declare function getLogger(myname: string, logRetentionDays?: number, wfname?: string): MyLogger;
