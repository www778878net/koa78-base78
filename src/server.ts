import Koa = require('koa');

const app = new Koa();
import { startServer, stopServer } from './routers/httpServer';
import { ContainerManager } from './ContainerManager';

const containerManager = new ContainerManager();




let httpPort = 88;
const convert = require('koa-convert');



// 初始化所有服务
async function initializeApp() {
    const container = await containerManager.initialize();
    const log = ContainerManager.getLogger();
    // 启动HTTP服务器
    startServer().catch(error => {
        log?.error(error);
        process.exit(1);
    });

}

initializeApp().catch(error => {
    console.error('Failed to initialize application:', error);
});