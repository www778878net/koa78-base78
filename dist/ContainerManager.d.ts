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
import { TsLog78 } from "tslog78";
export declare class ContainerManager {
    private configPath;
    private container;
    constructor(configPath?: string);
    /**
     * 从命令行参数中解析配置文件路径
     * 支持以下格式:
     * - node index.js config config.json
     * - node index.js config.json
     */
    private getConfigPathFromArgs;
    /**
     * 初始化日志服务
     */
    private initializeLogger;
    /**
     * 获取日志实例
     *
     * 使用静态方法而非依赖注入的原因：
     * 1. 日志服务需要在容器初始化早期就能使用
     * 2. 简化日志服务的获取方式
     * 3. 避免在容器尚未初始化完成时无法获取日志服务
     */
    static getLogger(): TsLog78 | null;
    /**
     * 初始化所有服务
     */
    initialize(): Promise<Container>;
    /**
     * 获取容器实例
     */
    getContainer(): Container | null;
}
