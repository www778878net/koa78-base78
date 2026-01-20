"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContainerManager = void 0;
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const Config_1 = require("./config/Config");
const DatabaseConnections_1 = require("./static/DatabaseConnections");
const DatabaseService_1 = require("./services/DatabaseService");
const CacheService_1 = require("./services/CacheService");
const AuthService_1 = require("./services/AuthService");
const mylogger_1 = require("./utils/mylogger");
const ControllerLoader_1 = require("./utils/ControllerLoader");
// 日志实例
// 采用全局变量而非依赖注入的方式，原因如下：
// 1. 日志服务需要在容器初始化早期就能使用，用于记录初始化过程中的信息
// 2. 日志服务本身不依赖其他服务，可以在容器初始化之前独立初始化
// 3. 提供静态方法访问，简化使用方式
let loggerInstance = null;
class ContainerManager {
    constructor(configPath) {
        this.container = null;
        // 检查是否有环境变量 CONFIG_FILE
        if (process.env.CONFIG_FILE) {
            this.configPath = process.env.CONFIG_FILE;
        }
        else {
            this.configPath = configPath || this.getConfigPathFromArgs();
        }
        // 如果提供了配置文件路径，设置环境变量
        // 这样做是为了让 Config 类能够读取到配置文件路径
        if (this.configPath) {
            process.env.CONFIG_FILE = this.configPath;
        }
    }
    /**
     * 从命令行参数中解析配置文件路径
     * 支持以下格式:
     * - node index.js config config.json
     * - node index.js config.json
     */
    getConfigPathFromArgs() {
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
    initializeLogger() {
        try {
            const config = this.container.get(Config_1.Config);
            // 使用 Config 类已有的 get 方法获取日志配置
            const isDebug = config.get('isdebug');
            // 使用 MyLogger，所有日志统一在 logs/koa78/base78_日期.log
            loggerInstance = mylogger_1.MyLogger.getInstance("base78", 3, "koa78");
            if (isDebug) {
                console.log('调试模式已启用');
                // 开发环境自动启用 detail 日志
                loggerInstance.clearDetailLog();
            }
            console.log('日志服务初始化完成');
        }
        catch (error) {
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
    static getLogger() {
        return loggerInstance;
    }
    /**
     * 初始化所有服务
     */
    initialize() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (this.container) {
                return this.container;
            }
            // 创建新的容器
            this.container = new inversify_1.Container();
            try {
                console.log('容器初始化开始');
                // 初始化配置服务
                this.container.bind(Config_1.Config).toSelf().inSingletonScope();
                const config = this.container.get(Config_1.Config);
                config.init();
                // 初始化日志服务
                // 日志服务在其他服务之前初始化，以便记录后续初始化过程
                this.initializeLogger();
                // 获取数据库和缓存配置
                const mysqlConfig = config.get('mysqls');
                const memcachedConfig = config.get('memcached');
                const redisConfig = config.get('redis');
                const sqliteConfig = config.get('sqlites');
                // 初始化数据库连接
                const dbConnections = DatabaseConnections_1.DatabaseConnections.getInstance(mysqlConfig, memcachedConfig, redisConfig, sqliteConfig); //, sqliteConfig
                // 使用 toConstantValue 绑定已存在的实例
                // 这种方式适用于:
                // 1. 已经创建好的实例（如通过 getInstance 获取的单例）
                // 2. 不需要依赖注入容器管理生命周期的对象
                // 3. 需要共享同一个实例的场景
                this.container.bind(DatabaseConnections_1.DatabaseConnections).toConstantValue(dbConnections);
                // 使用 toSelf().inSingletonScope() 绑定类定义
                // 这种方式适用于:
                // 1. 让依赖注入容器负责创建实例
                // 2. 需要容器管理生命周期的对象
                // 3. 可以享受依赖注入带来的解耦好处
                // 4. inSingletonScope() 确保在整个应用中只有一个实例
                this.container.bind(DatabaseService_1.DatabaseService).toSelf().inSingletonScope();
                this.container.bind(CacheService_1.CacheService).toSelf().inSingletonScope();
                this.container.bind(AuthService_1.AuthService).toSelf().inSingletonScope();
                // 初始化AuthService
                const authService = this.container.get(AuthService_1.AuthService);
                // 设置服务依赖
                const databaseService = this.container.get(DatabaseService_1.DatabaseService);
                databaseService.setDatabaseConnections(dbConnections);
                const cacheService = this.container.get(CacheService_1.CacheService);
                cacheService.setMemcache(dbConnections);
                authService.init(databaseService, cacheService);
                console.log('控制器初始化开始');
                // 绑定ControllerLoader服务
                this.container.bind(ControllerLoader_1.ControllerLoader).toSelf().inSingletonScope();
                // 预加载控制器，避免第一次请求时出现控制器找不到的问题
                const controllerLoader = this.container.get(ControllerLoader_1.ControllerLoader);
                controllerLoader.loadControllers();
                // 将容器挂载到 global 对象，方便在应用程序的其他部分访问
                global.appContainer = this.container;
                console.log('所有服务初始化完成');
                return this.container;
            }
            catch (error) {
                console.error('初始化失败:', error);
                throw error;
            }
        });
    }
    /**
     * 获取容器实例
     */
    getContainer() {
        return this.container;
    }
}
exports.ContainerManager = ContainerManager;
//# sourceMappingURL=ContainerManager.js.map