#!/usr/bin/env node
"use strict";
/**
 * 服务器启动文件
 * 用于测试和演示如何启动koa78-base78服务器
 */
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const index_1 = require("./index");
function main() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const server = new index_1.Server();
        yield server.start();
    });
}
// 如果直接运行此文件，则启动服务器
if (require.main === module) {
    main();
}
//# sourceMappingURL=startserver.js.map