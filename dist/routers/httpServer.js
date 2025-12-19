"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stopServer = exports.startServer = void 0;
const tslib_1 = require("tslib");
const koa_1 = tslib_1.__importDefault(require("koa"));
const koabody78_1 = tslib_1.__importDefault(require("@www778878net/koabody78"));
const route_registry_1 = require("./route-registry");
const Config_1 = require("../config/Config");
const tslog78_1 = require("tslog78");
const elasticsearch78_1 = require("../services/elasticsearch78"); // 假设您的 Elasticsearch 客户端类
const esClient = elasticsearch78_1.Elasticsearch78.getInstance();
const log = new tslog78_1.TsLog78();
// 统计中间件
const statsMiddleware = (ctx, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const start = Date.now(); // Request start time
    yield next();
    const ms = Date.now() - start; // Request duration
    // 如果 ctx.params 是 undefined，进行处理
    if (!ctx.params) {
        //console.warn(ctx);
        return; // 或者可以选择抛出一个错误，或者执行其他操作
    }
    // 确保参数存在后再解构
    const { apiver, apisys, apiobj, apifun } = ctx.params;
    // 如果是测试接口，直接返回
    if (apiobj == "testtb")
        return;
    const back = ctx.response.body ? JSON.stringify(ctx.response.body) : ""; // Response body
    //const uploadSize = ctx.request.headers['content-length'];  // Request body size (in characters)
    const downloadSize = back.length; // Response body size
    // 当前时间戳
    const timestamp = new Date().toISOString();
    // Prepare the document for Elasticsearch
    const doc = {
        apiv: apiver,
        apisys: apisys,
        apiobj: apiobj,
        method: apifun,
        num: 1,
        dlong: ms,
        //uplen: uploadSize,     // Upload size in bytes
        downlen: downloadSize,
        timestamp: timestamp
    };
    try {
        // Elasticsearch index and document ID are based on the method, apisys, and apiobj
        const index = 'sys_nodejs-main';
        const id = `${apifun}-${apisys}-${apiobj}-${apiver}`;
        // Prepare update fields for the upsert operation
        const updateData = {
            num: 1,
            dlong: ms,
            //uplen: uploadSize,   // Update upload size
            downlen: downloadSize // Update download size
        };
        yield esClient.upsertData(index, id, doc, updateData);
    }
    catch (error) {
        console.error('Error writing data to Elasticsearch:', error);
    }
});
// 错误处理中间件
const errorHandler = (ctx, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        yield next();
    }
    catch (err) {
        log.error('服务器错误:', err);
        ctx.status = err.status || 500;
        ctx.body = {
            error: err.message || '内部服务器错误',
            details: process.env.NODE_ENV === 'production' ? undefined : err.stack
        };
        ctx.app.emit('error', err, ctx);
    }
});
// 日志中间件
const loggerMiddleware = (ctx, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const start = Date.now();
    yield next();
    const ms = Date.now() - start;
    log.info(`${ctx.method} ${ctx.url} - ${ms}ms`);
});
function startServer(port) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        log.info("正在启动服务器...");
        const config = Config_1.Config.getInstance();
        const httpPort = port || config.get('port') || config.get('httpPort') || 3000;
        log.info(`尝试在端口 ${httpPort} 上启动服务器`);
        const app = new koa_1.default();
        // 使用 koa-bodyparser 作为唯一的 body 解析器
        // 根据项目规范，body parser中间件必须在路由中间件前注册，确保POST数据正确解析
        app.use((0, koabody78_1.default)({
            enableTypes: ['json', 'form', 'text'],
            extendTypes: {
                text: ['text/xml', 'application/xml']
            },
            onerror: function (err, ctx) {
                ctx.throw('body parse error', 422);
            }
        }));
        log.info("正在设置路由...");
        yield (0, route_registry_1.setupRoutes)(app);
        log.info("路由设置成功");
        // 路由
        app.use(route_registry_1.router.routes());
        app.use(route_registry_1.router.allowedMethods());
        // 使用统计中间件（放在路由之后，避免影响路由匹配）
        app.use(statsMiddleware);
        // 中间件
        app.use(errorHandler);
        app.use(loggerMiddleware);
        return new Promise((resolve, reject) => {
            const httpServer = app.listen(httpPort, () => {
                log.info(`HTTP 服务器正在端口 ${httpPort} 上运行`);
                resolve({ app, httpServer });
            });
            httpServer.on('error', (error) => {
                log.error(error, '服务器错误:');
                if (error.code === 'EADDRINUSE') {
                    log.error(`端口 ${httpPort} 已被占用。请选择一个不同的端口。`);
                }
                else {
                    log.error(error, '启动 HTTP 服务器失败:');
                }
                reject(error);
            });
        });
    });
}
exports.startServer = startServer;
function stopServer(server) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            if (server && server.close) {
                server.close((err) => {
                    if (err) {
                        log.error(err, '关闭服务器时出错:');
                        reject(err);
                    }
                    else {
                        log.info('服务器成功关闭');
                        resolve();
                    }
                });
            }
            else {
                resolve();
            }
        });
    });
}
exports.stopServer = stopServer;
//# sourceMappingURL=httpServer.js.map