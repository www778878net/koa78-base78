import Koa = require('koa');
const app = new Koa();
import { startServer, stopServer } from './routers/httpServer';
import { ContainerManager } from './ContainerManager';


/**
 * 应用初始化函数
 * 用户可以通过此函数一键初始化所有服务
 * 
 * 使用方法:
 * ```typescript
 * import { initializeApp } from 'koa78-base78/dist/server';
 * 
 * // 通过命令行参数或环境变量指定配置文件路径
 * initializeApp().then(() => {
 *   console.log('应用初始化完成');
 *   // 现在可以通过 global.appContainer 获取服务实例
 *   // const dbService = global.appContainer.get(DatabaseService);
 * }).catch(error => {
 *   console.error('应用初始化失败:', error);
 * });
 * ```
 * 
 * @param configPath 配置文件路径（可选）
 * @returns Promise<Container>
 */
export async function initializeApp(configPath?: string) {
    const containerManager = new ContainerManager(configPath);
    const container = await containerManager.initialize();
    return container;
}

// 初始化所有服务
async function main() {
    try {
        await initializeApp();
        console.info('Application services initialized successfully');

        // 启动HTTP服务器
        startServer().catch(error => {
            console.error('Failed to start HTTP server:', error);
            process.exit(1);
        });
    } catch (error) {
        console.error('Failed to initialize application:', error);
        process.exit(1);
    }
}

main();

export default initializeApp;