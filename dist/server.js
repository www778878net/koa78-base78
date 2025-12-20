"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Server = void 0;
const tslib_1 = require("tslib");
// import Koa = require('koa');//不能修改这里 因为我们要动态导入模块的 改这个没意义不修改tsconfig.json
const httpServer_1 = require("./routers/httpServer");
const ContainerManager_1 = require("./ContainerManager");
class Server {
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
                yield (0, httpServer_1.startServer)();
                console.info('HTTP server started successfully');
            }
            catch (error) {
                console.error('Failed to start application:', error);
                process.exit(1);
            }
        });
    }
}
exports.Server = Server;
// 默认导出Server类
exports.default = Server;
//# sourceMappingURL=server.js.map