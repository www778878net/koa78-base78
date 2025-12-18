#!/usr/bin/env node

/**
 * 服务器启动文件
 * 用于测试和演示如何启动koa78-base78服务器
 */

import { Server } from './index';

async function main() {
    const server = new Server();
    await server.start();
}

// 如果直接运行此文件，则启动服务器
if (require.main === module) {
    main();
}