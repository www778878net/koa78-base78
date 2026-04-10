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

import * as fs from 'fs';
import * as path from 'path';

/**
 * 日志级别枚举
 */
export enum LogLevel {
    DETAIL = 5,
    DEBUG = 10,
    INFO = 20,
    WARN = 30,
    ERROR = 40
}

/**
 * 环境类型枚举
 */
export enum Environment {
    PRODUCTION = "production",
    DEVELOPMENT = "development",
    TEST = "test"
}

/**
 * 日志级别名称映射
 */
const LogLevelNames: Record<LogLevel, string> = {
    [LogLevel.DETAIL]: 'DETAIL',
    [LogLevel.DEBUG]: 'DEBUG',
    [LogLevel.INFO]: 'INFO',
    [LogLevel.WARN]: 'WARN',
    [LogLevel.ERROR]: 'ERROR'
};

/**
 * 格式化时间戳
 */
function formatTimestamp(includeMs: boolean = false): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    if (includeMs) {
        const ms = String(now.getMilliseconds()).padStart(3, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${ms}`;
    }
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * 格式化日期（用于日志文件名）
 */
function formatDate(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * MyLogger 类
 */
export class MyLogger {
    /** 实例缓存字典：{workflow_name: MyLogger_instance} */
    private static _instances: Map<string, MyLogger> = new Map();

    /** 文件写入锁（使用简单的 Promise 链确保同步） */
    private _writeLock: Promise<void> = Promise.resolve();

    /** 日志记录器名称/工作流ID */
    private readonly myname: string;
    /** 工作流名称（用于日志目录分类） */
    private readonly wfname: string;
    /** 日志保留天数 */
    private readonly logRetentionDays: number;

    /** 是否已初始化 */
    private _initialized: boolean = false;

    /** 当前环境 */
    private currentEnvironment: Environment = Environment.PRODUCTION;
    /** 文件日志级别 */
    private levelFile: number = LogLevel.INFO;
    /** 控制台日志级别 */
    private levelConsole: number = LogLevel.INFO;
    /** 是否启用 detail 日志 */
    private detailLoggerEnabled: boolean = false;

    /**
     * 私有构造函数，使用 getInstance 获取实例
     */
    private constructor(
        myname: string,
        logRetentionDays: number = 3,
        wfname: string = ''
    ) {
        if (!myname) {
            throw new Error("myname cannot be empty");
        }

        this.myname = myname;
        this.wfname = wfname;
        this.logRetentionDays = logRetentionDays;

        this._setupStandardLogger();
        this.setEnvironmentFromEnvVar();

        // 初始化时清理过期日志
        this._cleanupOldLogs();

        this._initialized = true;
    }

    /**
     * 获取 MyLogger 实例（单例模式）
     * @param myname 工作流ID/名称
     * @param logRetentionDays 日志保留天数，默认3天
     * @param wfname 工作流名称（用于日志目录分类）
     */
    static getInstance(
        myname: string,
        logRetentionDays: number = 3,
        wfname: string = ''
    ): MyLogger {
        if (!myname) {
            throw new Error("myname cannot be empty");
        }

        // 单例检查：如果 workflow_id 已存在实例，直接返回
        if (MyLogger._instances.has(myname)) {
            return MyLogger._instances.get(myname)!;
        }

        // 创建新实例并存入字典
        const instance = new MyLogger(myname, logRetentionDays, wfname);
        MyLogger._instances.set(myname, instance);
        return instance;
    }

    /**
     * 获取日志目录路径
     * - 如果 wfname 不为空，返回 logs/{wfname}
     * - 否则返回 logs/{myname}
     *
     * 注意：为了避免日志文件分散，建议在调用 getInstance 时指定 wfname
     * 例如：MyLogger.getInstance("controller_name", 3, "base78")
     * 这样所有控制器的日志都会在 logs/base78/ 目录下
     */
    private _getLogDir(): string {
        const baseDir = './logs';
        if (this.wfname) {
            return path.join(baseDir, this.wfname);
        }
        // 如果没有指定 wfname，则使用 myname 作为目录名（保持向后兼容）
        // 但这会导致日志文件分散，建议调用时指定 wfname
        return path.join(baseDir, this.myname);
    }

    /**
     * 设置标准日志记录器
     */
    private _setupStandardLogger(): void {
        // 确保日志目录存在
        const logDir = this._getLogDir();
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }

        // 文件归档逻辑：如果当前日志文件存在，重命名为时间戳格式
        const currentLogPath = path.join(logDir, `${this.myname}.log`);
        if (fs.existsSync(currentLogPath)) {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
            const archivePath = path.join(logDir, `${timestamp}.log`);
            try {
                fs.renameSync(currentLogPath, archivePath);
            } catch (e) {
                console.error(`归档日志文件失败: ${e}`);
            }
        }
    }

    /**
     * 从环境变量设置环境
     */
    setEnvironmentFromEnvVar(): void {
        const env = (process.env.APP_ENV || 'development').toLowerCase();
        if (env === 'development') {
            this.setEnvironment(Environment.DEVELOPMENT);
        } else if (env === 'test') {
            this.setEnvironment(Environment.TEST);
        } else {
            this.setEnvironment(Environment.PRODUCTION);
        }
    }

    /**
     * 设置环境
     */
    setEnvironment(env: Environment): void {
        this.currentEnvironment = env;
        this.updateLogLevels();

        // 在开发环境中自动启用 detail 日志
        if (this.currentEnvironment === Environment.DEVELOPMENT) {
            this._setupDetailFile();
        }
    }

    /**
     * 更新日志级别
     */
    private updateLogLevels(): void {
        if (this.currentEnvironment === Environment.PRODUCTION) {
            this.levelConsole = LogLevel.INFO;  // 正式环境：只显示 Info 及以上级别
            this.levelFile = LogLevel.INFO;     // 不显示 Detail 和 Debug
        } else if (this.currentEnvironment === Environment.DEVELOPMENT) {
            this.levelConsole = LogLevel.DEBUG; // 开发环境：显示 Debug 级别，不显示 Detail
            this.levelFile = LogLevel.DETAIL;   // 文件显示 Detail 级别
        } else if (this.currentEnvironment === Environment.TEST) {
            this.levelConsole = LogLevel.DEBUG; // 测试环境：显示 Debug 级别，不显示 Detail
            this.levelFile = LogLevel.DEBUG;    // 文件显示 Debug 级别
        }
    }

    /**
     * 手动设置日志级别
     */
    setupLevel(fileLevel: number, consoleLevel: number): void {
        this.levelFile = fileLevel;
        this.levelConsole = consoleLevel;
    }

    /**
     * 清理过期日志文件，保留最近 N 天的日志
     */
    private _cleanupOldLogs(): void {
        const workflowLogDir = this._getLogDir();
        if (fs.existsSync(workflowLogDir)) {
            const currentTime = new Date();
            const cutoffTime = new Date(currentTime.getTime() - this.logRetentionDays * 24 * 60 * 60 * 1000);

            const files = fs.readdirSync(workflowLogDir);
            for (const filename of files) {
                const filePath = path.join(workflowLogDir, filename);
                const stats = fs.statSync(filePath);
                if (stats.isFile()) {
                    const fileMtime = stats.mtime;
                    if (fileMtime < cutoffTime) {
                        try {
                            fs.unlinkSync(filePath);
                            console.log(`删除过期日志文件: ${this.myname}/${filename}`);
                        } catch (e) {
                            console.error(`删除日志文件失败 ${this.myname}/${filename}: ${e}`);
                        }
                    }
                }
            }
        }
    }

    /**
     * 启用 detail 日志文件记录功能
     */
    private _setupDetailFile(): void {
        this.detailLoggerEnabled = true;
        this.clearDetailLog();
    }

    /**
     * 清空 detail 日志文件内容
     */
    clearDetailLog(): void {
        const workflowLogDir = this._getLogDir();
        if (!fs.existsSync(workflowLogDir)) {
            fs.mkdirSync(workflowLogDir, { recursive: true });
        }

        const detailLogPath = path.join(workflowLogDir, 'detail.log');
        fs.writeFileSync(detailLogPath, '', 'utf-8');
    }

    /**
     * 写入到控制台
     */
    private _writeToConsole(message: string, level: LogLevel): void {
        // 只输出 DEBUG 级别及以上的日志到控制台，DETAIL 级别只写入文件
        if (level >= LogLevel.DEBUG) {
            const timestamp = formatTimestamp();
            console.log(`[${timestamp}][${LogLevelNames[level]}] ${message}`);
        }
    }

    /**
     * 写入到文件（使用锁确保线程安全）
     */
    private async _writeToFile(message: string, level: LogLevel): Promise<void> {
        if (level >= this.levelFile) {
            const workflowLogDir = this._getLogDir();
            if (!fs.existsSync(workflowLogDir)) {
                fs.mkdirSync(workflowLogDir, { recursive: true });
            }

            const dateStr = formatDate();
            const filename = path.join(workflowLogDir, `${this.myname}_${dateStr}.log`);

            // 使用锁保护文件写入，防止并发问题
            await this._writeLock;
            this._writeLock = (async () => {
                const timestampWithMicro = formatTimestamp(true);
                const logMessage = `[${timestampWithMicro}][${LogLevelNames[level]}] ${message}\n`;
                fs.appendFileSync(filename, logMessage, 'utf-8');
            })();
        }
    }

    /**
     * 写入详细日志到 detail.log 文件
     * detail.log 记录所有级别的日志
     */
    private _writeToDetailFile(message: string, level: LogLevel): void {
        if (!this.detailLoggerEnabled) {
            return;
        }

        const workflowLogDir = this._getLogDir();
        if (!fs.existsSync(workflowLogDir)) {
            fs.mkdirSync(workflowLogDir, { recursive: true });
        }

        const detailLogPath = path.join(workflowLogDir, 'detail.log');
        const timestampWithMicro = formatTimestamp(true);
        const detailMessage = `[${timestampWithMicro}][${LogLevelNames[level]}] ${message}\n`;

        // 使用锁保护文件写入
        const writeSync = () => {
            fs.appendFileSync(detailLogPath, detailMessage, 'utf-8');
        };

        // 等待之前的写入完成后再写入
        this._writeLock = this._writeLock.then(writeSync, writeSync);
        writeSync();
    }

    /**
     * 格式化日志消息
     */
    private _formatLogMessage(message: string, level: LogLevel): string {
        return message;
    }

    /**
     * 核心日志记录方法
     */
    private _logWithPars(message: string, level: LogLevel): void {
        const formattedMessage = this._formatLogMessage(message, level);

        // 写入控制台
        this._writeToConsole(formattedMessage, level);

        // 写入文件
        this._writeToFile(formattedMessage, level).catch(e => {
            console.error(`日志写入文件失败: ${e}`);
        });

        // 将所有级别的日志写入 detail.log 文件（如果启用）
        if (this.detailLoggerEnabled) {
            this._writeToDetailFile(formattedMessage, level);
        }
    }

    /**
     * 格式化异常信息，包括堆栈跟踪
     */
    formatException(exc: any): string {
        if (exc instanceof Error) {
            return `Exception: ${exc.name}: ${exc.message}\nStack:\n${exc.stack}`;
        }
        // 处理非 Error 对象的情况
        return String(exc);
    }

    // ==================== 公共日志方法 ====================

    /**
     * 记录 DETAIL 级别日志
     */
    detail(message: string, error?: any): void {
        const msg = error ? `${message} ${this.formatException(error)}` : message;
        this._logWithPars(msg, LogLevel.DETAIL);
    }

    /**
     * 记录 DEBUG 级别日志
     */
    debug(message: string, error?: any): void {
        const msg = error ? `${message} ${this.formatException(error)}` : message;
        this._logWithPars(msg, LogLevel.DEBUG);
    }

    /**
     * 记录 INFO 级别日志
     */
    info(message: string, error?: any): void {
        const msg = error ? `${message} ${this.formatException(error)}` : message;
        this._logWithPars(msg, LogLevel.INFO);
    }

    /**
     * 记录 WARN 级别日志
     */
    warn(message: string, error?: any): void {
        const msg = error ? `${message} ${this.formatException(error)}` : message;
        this._logWithPars(msg, LogLevel.WARN);
    }

    /**
     * 记录 WARNING 级别日志（别名）
     */
    warning(message: string, error?: any): void {
        this.warn(message, error);
    }

    /**
     * 记录 ERROR 级别日志
     */
    error(message: string, error?: any): void {
        const msg = error ? `${message} ${this.formatException(error)}` : message;
        this._logWithPars(msg, LogLevel.ERROR);
    }

    /**
     * 记录异常日志
     */
    exception(exc: Error, level: LogLevel = LogLevel.ERROR): void {
        const excType = exc.name;
        const excMessage = exc.message;
        this._logWithPars(`${excType}: ${excMessage}`, level);
        // 同时记录详细的堆栈信息到 detail 级别
        this.detail(`Exception details: ${this.formatException(exc)}`);
    }

    /**
     * 记录 CRITICAL 级别日志（等同于 ERROR）
     */
    critical(message: string, error?: any): void {
        this.error(message, error);
    }
}

/**
 * 便捷函数：获取或创建 MyLogger 实例
 */
export function getLogger(myname: string, logRetentionDays: number = 3, wfname: string = ''): MyLogger {
    return MyLogger.getInstance(myname, logRetentionDays, wfname);
}
