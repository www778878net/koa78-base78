"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const koa_1 = tslib_1.__importDefault(require("koa"));
const routers_1 = tslib_1.__importDefault(require("./routers"));
const ContainerManager_1 = require("./ContainerManager");
const app = new koa_1.default();
var iconv = require('iconv-lite');
var fs = require('fs');
let port = 88;
const convert = require('koa-convert');
// 创建容器管理器实例，不传入配置文件路径（会自动从命令行参数解析）
const containerManager = new ContainerManager_1.ContainerManager();
// 初始化所有服务
function initializeApp() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const container = yield containerManager.initialize();
        //阿里云用这个OK
        const body = require('@www778878net/koabody78');
        app.use(convert(body()));
        app.use(convert(routers_1.default.routes()));
        app.on('error', function (err, ctx) {
            //这里增加错误日志
            console.log(ctx.request);
            console.log(err);
        });
        app.listen(port, () => {
            console.log('listen  OK' + port);
        });
    });
}
initializeApp().catch(error => {
    console.error('Failed to initialize application:', error);
});
//# sourceMappingURL=server.js.map