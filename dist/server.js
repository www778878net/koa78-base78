"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeApp = void 0;
const tslib_1 = require("tslib");
const Koa = require("koa");
const app = new Koa();
const httpServer_1 = require("./routers/httpServer");
const ContainerManager_1 = require("./ContainerManager");
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
function initializeApp(configPath) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const containerManager = new ContainerManager_1.ContainerManager(configPath);
        const container = yield containerManager.initialize();
        return container;
    });
}
exports.initializeApp = initializeApp;
// 初始化所有服务
function main() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        try {
            yield initializeApp();
            console.info('Application services initialized successfully');
            // 启动HTTP服务器
            (0, httpServer_1.startServer)().catch(error => {
                console.error('Failed to start HTTP server:', error);
                process.exit(1);
            });
        }
        catch (error) {
            console.error('Failed to initialize application:', error);
            process.exit(1);
        }
    });
}
main();
exports.default = initializeApp;
//# sourceMappingURL=server.js.map