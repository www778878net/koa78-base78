/**
 * 容器管理器
 * 
 * 提供简单的容器初始化功能，用户可以通过传入配置文件路径来初始化所有服务
 * 
 * 使用方法:
 * ```typescript
 * import { ContainerManager } from 'koa78-base78/ContainerManager';
 * 
 * // 创建容器管理器实例
 * const containerManager = new ContainerManager('./config.json');
 * 
 * // 初始化所有服务
 * const container = await containerManager.initialize();
 * 
 * // 获取服务实例
 * const databaseService = container.get('DatabaseService');
 * const cacheService = container.get('CacheService');
 * ```
 */

import { Container } from 'inversify';
import { Config } from './config/Config';
import { DatabaseConnections } from './static/DatabaseConnections';
import { DatabaseService } from './services/DatabaseService';
import { CacheService } from './services/CacheService';
import { TsLog78, LogstashServerLog78, FileLog78, ConsoleLog78 } from "tslog78";
import { ControllerLoader } from './utils/ControllerLoader';

// 日志实例
// 采用全局变量而非依赖注入的方式，原因如下：
// 1. 日志服务需要在容器初始化早期就能使用，用于记录初始化过程中的信息
// 2. 日志服务本身不依赖其他服务，可以在容器初始化之前独立初始化
// 3. 提供静态方法访问，简化使用方式
let loggerInstance: TsLog78 | null = null;

export class ContainerManager {
    private configPath: string | undefined;
    private container: Container | null = null;

    constructor(configPath?: string) {
        this.configPath = configPath || this.getConfigPathFromArgs();
        
        // 如果提供了配置文件路径，设置环境变量
        if (this.configPath) {
            process.env.TABLE_CONFIG_FILE = this.configPath;
        }
    }

    /**
     * 从命令行参数中解析配置文件路径
     * 支持以下格式:
     * - node index.js config config.json
     * - node index.js config.json
     */
    private getConfigPathFromArgs(): string | undefined {
        const args = process.argv.slice(2); // 移除 node 和 script 路径
        
        // 查找 config 参数
        const configIndex = args.indexOf('config');
        if (configIndex !== -1 && args.length > configIndex + 1) {
            // 格式: node index.js config config.json
            return args[configIndex + 1];
        }
        
        // 查找第一个 .json 文件
        for (const arg of args) {
            if (arg.endsWith('.json')) {
                // 格式: node index.js config.json
                return arg;
            }
        }
        
        return undefined;
    }

    /**
     * 初始化日志服务
     */
    private initializeLogger() {
        try {
            const config = this.container!.get(Config);
            // 使用 Config 类已有的 get 方法获取日志配置
            const logstashConfig = config.get('logstash');
            const isDebug = config.get('isdebug');

            let serverLogger: LogstashServerLog78 | undefined;
            if (logstashConfig && logstashConfig.host && logstashConfig.port) {
                const serverUrl = `http://${logstashConfig.host}:${logstashConfig.port}`;
                serverLogger = new LogstashServerLog78(serverUrl);
            }

            loggerInstance = TsLog78.Instance;
            loggerInstance.setup(serverLogger, new FileLog78(), new ConsoleLog78());
            
            if (isDebug) {
                loggerInstance.setupLevel(20, 20, 50);
                loggerInstance.setupDetailFile("detail.log");
                loggerInstance.clearDetailLog();
            }
            
            console.log('日志服务初始化完成');
        } catch (error) {
            console.warn('日志服务初始化失败，使用默认控制台日志:', error);
        }
    }

    /**
     * 获取日志实例
     * 
     * 使用静态方法而非依赖注入的原因：
     * 1. 日志服务需要在容器初始化早期就能使用
     * 2. 简化日志服务的获取方式
     * 3. 避免在容器尚未初始化完成时无法获取日志服务
     */
    public static getLogger(): TsLog78 | null {
        return loggerInstance;
    }

    /**
     * 初始化所有服务
     */
    async initialize(): Promise<Container> {
        if (this.container) {
            return this.container;
        }

        // 创建新的容器
        this.container = new Container();
        
        try {
            // 初始化配置服务
            this.container.bind(Config).toSelf().inSingletonScope();
            const config = this.container.get(Config);
            
            // 初始化日志服务
            // 日志服务在其他服务之前初始化，以便记录后续初始化过程
            this.initializeLogger();
            
            // 获取数据库和缓存配置
            const mysqlConfig = config.get('mysql');
            const memcachedConfig = config.get('memcached');
            const redisConfig = config.get('redis');
            
            // 初始化数据库连接
            const dbConnections = DatabaseConnections.getInstance(mysqlConfig, memcachedConfig, redisConfig);
            
            // 使用 toConstantValue 绑定已存在的实例
            // 这种方式适用于:
            // 1. 已经创建好的实例（如通过 getInstance 获取的单例）
            // 2. 不需要依赖注入容器管理生命周期的对象
            // 3. 需要共享同一个实例的场景
            this.container.bind(DatabaseConnections).toConstantValue(dbConnections);
            
            // 使用 toSelf().inSingletonScope() 绑定类定义
            // 这种方式适用于:
            // 1. 让依赖注入容器负责创建实例
            // 2. 需要容器管理生命周期的对象
            // 3. 可以享受依赖注入带来的解耦好处
            // 4. inSingletonScope() 确保在整个应用中只有一个实例
            this.container.bind(DatabaseService).toSelf().inSingletonScope();
            this.container.bind(CacheService).toSelf().inSingletonScope();
            
            // 绑定ControllerLoader服务
            this.container.bind(ControllerLoader).toSelf().inSingletonScope();
            
            // 设置服务依赖
            const databaseService = this.container.get(DatabaseService);
            databaseService.setDatabaseConnections(dbConnections);
            
            const cacheService = this.container.get(CacheService);
            cacheService.setMemcache(dbConnections);
            
            // 将容器挂载到 global 对象，方便在应用程序的其他部分访问
            (global as any).appContainer = this.container;
            
            console.log('所有服务初始化完成');
            return this.container;
            
        } catch (error) {
            console.error('初始化失败:', error);
            throw error;
        }
    }

    /**
     * 获取容器实例
     */
    getContainer(): Container | null {
        return this.container;
    }
}