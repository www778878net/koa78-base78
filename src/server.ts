import Koa from 'koa';
import router from './routers';
import { ContainerManager } from './ContainerManager';
const app = new Koa();

var iconv = require('iconv-lite');
var fs = require('fs');


let port = 88;
const convert = require('koa-convert');

// 创建容器管理器实例，不传入配置文件路径（会自动从命令行参数解析）
const containerManager = new ContainerManager();

// 初始化所有服务
async function initializeApp() {
    const container = await containerManager.initialize();

    //阿里云用这个OK
    const body = require('@www778878net/koabody78');
    app.use(convert(body()));

    app.use(convert(router.routes()));

    app.on('error', function (err, ctx) {
        //这里增加错误日志
        console.log(ctx.request);
        console.log(err);
    });

    app.listen(port, () => {
        console.log('listen  OK' + port);
    });
}

initializeApp().catch(error => {
    console.error('Failed to initialize application:', error);
});