export default class Server {
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
    start(configPath?: string): Promise<void>;
}
