"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Server = void 0;
const tslib_1 = require("tslib");
const httpServer_1 = require("./routers/httpServer");
const ContainerManager_1 = require("./ContainerManager");
class Server {
    constructor() {
        this.httpServer = null;
    }
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
    start(configPath) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                // 初始化容器管理器
                const containerManager = new ContainerManager_1.ContainerManager(configPath);
                const container = yield containerManager.initialize();
                console.info('Application services initialized successfully');
                // 启动HTTP服务器
                this.httpServer = yield (0, httpServer_1.startServer)();
                console.info('HTTP server started successfully');
                return this.httpServer;
            }
            catch (error) {
                console.error('Failed to start application:', error);
                process.exit(1);
            }
        });
    }
    /**
     * 关闭服务器
     */
    close() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (this.httpServer && this.httpServer.httpServer) {
                yield new Promise((resolve) => {
                    this.httpServer.httpServer.close(() => {
                        console.log('HTTP server closed.');
                        resolve();
                    });
                });
            }
        });
    }
}
exports.Server = Server;
// 默认导出Server类
exports.default = Server;
//# sourceMappingURL=server.js.map