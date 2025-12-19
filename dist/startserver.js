#!/usr/bin/env node
"use strict";
/**
 * 服务器启动文件
 * 用于测试和演示如何启动koa78-base78服务器
 */
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const index_1 = require("./index");
let serverInstance = null;
function main() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        serverInstance = new index_1.Server();
        yield serverInstance.start();
        // 保持进程运行
        console.log('Server started successfully. Press Ctrl+C to exit.');
        // 监听进程信号，优雅关闭
        process.on('SIGINT', () => tslib_1.__awaiter(this, void 0, void 0, function* () {
            console.log('Received SIGINT. Shutting down gracefully...');
            if (serverInstance) {
                yield serverInstance.close();
            }
            process.exit(0);
        }));
        process.on('SIGTERM', () => tslib_1.__awaiter(this, void 0, void 0, function* () {
            console.log('Received SIGTERM. Shutting down gracefully...');
            if (serverInstance) {
                yield serverInstance.close();
            }
            process.exit(0);
        }));
    });
}
// 如果直接运行此文件，则启动服务器
if (require.main === module) {
    main().catch(error => {
        console.error('Failed to start server:', error);
        process.exit(1);
    });
}
//# sourceMappingURL=startserver.js.map