import Koa = require('koa');
import { startServer } from './routers/httpServer';
import { ContainerManager } from './ContainerManager';

export class Server {
    /**
     * 启动服务器
     * 一键初始化所有服务并启动HTTP服务器
     * 
     * 使用方法:
     * ```typescript
     * import { Server } from 'koa78-base78';
     * 
     * const server = new Server();
     * server.start().then(() => {
     *   console.log('服务器启动完成');
     * }).catch(error => {
     *   console.error('服务器启动失败:', error);
     * });
     * ```
     * 
     * @param configPath 配置文件路径（可选）
     */
    async start(configPath?: string) {
        try {
            // 初始化容器管理器
            const containerManager = new ContainerManager(configPath);
            const container = await containerManager.initialize();
            
            console.info('Application services initialized successfully');

            // 启动HTTP服务器
            await startServer();
            console.info('HTTP server started successfully');
        } catch (error) {
            console.error('Failed to start application:', error);
            process.exit(1);
        }
    }
}

// 默认导出Server类
export default Server;