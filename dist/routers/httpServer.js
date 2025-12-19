"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stopServer = exports.startServer = void 0;
const tslib_1 = require("tslib");
const koa_1 = tslib_1.__importDefault(require("koa"));
const Config_1 = require("../config/Config");
const ContainerManager_1 = require("../ContainerManager");
const tslog78_1 = require("tslog78");
const elasticsearch78_1 = require("../services/elasticsearch78");
const router_1 = tslib_1.__importDefault(require("@koa/router"));
const koa78_upinfo_1 = tslib_1.__importDefault(require("koa78-upinfo"));
const ControllerLoader_1 = require("../utils/ControllerLoader");
const esClient = elasticsearch78_1.Elasticsearch78.getInstance();
const log = tslog78_1.TsLog78.Instance;
const router = new router_1.default();
// 统计中间件
const statsMiddleware = (ctx, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const start = Date.now(); // Request start time
    console.log('statsMiddleware');
    yield next();
    const ms = Date.now() - start; // Request duration
    // 如果 ctx.params 是 undefined，进行处理
    if (!ctx.params) {
        //console.warn(ctx);
        return; // 或者可以选择抛出一个错误，或者执行其他操作
    }
    // // 确保参数存在后再解构
    // const { apiver, apisys, apiobj, apifun } = ctx.params;
    // // 如果是测试接口，直接返回
    // //if (apiobj == "testtb") return;
    // const back = ctx.response.body ? JSON.stringify(ctx.response.body) : "";  // Response body
    // //const uploadSize = ctx.request.headers['content-length'];  // Request body size (in characters)
    // const downloadSize = back.length;  // Response body size
    // // 当前时间戳
    // const timestamp = new Date().toISOString();
    // // Prepare the document for Elasticsearch
    // const doc = {
    //     apiv: apiver,            // API version
    //     apisys: apisys,        // API system
    //     apiobj: apiobj,        // API object
    //     method: apifun,        // HTTP method
    //     num: 1,                // Invocation count (this will be incremented later)
    //     dlong: ms,             // Duration in milliseconds
    //     //uplen: uploadSize,     // Upload size in bytes
    //     downlen: downloadSize, // Download size in bytes      
    //     timestamp: timestamp
    // };
    // try {
    //     // Elasticsearch index and document ID are based on the method, apisys, and apiobj
    //     const index = 'sys_nodejs-main';
    //     const id = `${apifun}-${apisys}-${apiobj}-${apiver}`;
    //     // Prepare update fields for the upsert operation
    //     const updateData = {
    //         num: 1,              // Increment this field for each API call
    //         dlong: ms,           // Update the duration
    //         //uplen: uploadSize,   // Update upload size
    //         downlen: downloadSize// Update download size
    //     };
    //     await esClient.upsertData(index, id, doc, updateData);
    // } catch (error) {
    //     console.error('Error writing data to Elasticsearch:', error);
    // }
});
// 错误处理中间件
const errorHandler = (ctx, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('errorHandler');
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
        log.info("正在设置路由...");
        yield setupRoutes(app);
        log.info("路由设置成功");
        // 路由
        app.use(router.routes());
        app.use(router.allowedMethods());
        // 使用统计中间件（放在路由之后，避免影响路由匹配）
        app.use(statsMiddleware);
        // 中间件
        app.use(errorHandler);
        app.use(loggerMiddleware);
        // 使用 koa-bodyparser 作为唯一的 body 解析器
        app.use(bodyParser({
            enableTypes: ['json', 'form', 'text'],
            extendTypes: {
                text: ['text/xml', 'application/xml']
            },
            onerror: function (err, ctx) {
                ctx.throw('body parse error', 422);
            }
        }));
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
// 设置路由函数
function setupRoutes(app) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        log.info('Setting up routes...');
        // 从全局对象获取容器实例或者创建新的ContainerManager实例
        const containerManager = new ContainerManager_1.ContainerManager();
        const container = containerManager.getContainer() || global.appContainer;
        const controllerLoader = container.get(ControllerLoader_1.ControllerLoader);
        router.all('/:apiver/:apisys/:apiobj/:apifun', (ctx) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                const { apiver, apisys, apiobj, apifun } = ctx.params;
                log.detail(`Received request for: /${apiver}/${apisys}/${apiobj}/${apifun}`);
                if (apifun.startsWith('_') || !apiver.toLowerCase().startsWith('api') || apisys.toLowerCase().startsWith('dll')) {
                    log.debug(`Access denied for: /${apiver}/${apisys}/${apiobj}/${apifun}`);
                    ctx.status = 403;
                    ctx.body = { error: 'Access denied' };
                    return;
                }
                const ControllerClass = controllerLoader.getController(`${apiver}/${apisys}/${apiobj}`);
                if (!ControllerClass) {
                    log.error(`Controller not found for: ${apiver}/${apisys}/${apiobj}`);
                    ctx.status = 500;
                    ctx.body = { error: 'Internal Server Error', details: `Controller not found for: ${apiver}/${apisys}/${apiobj}` };
                    return;
                }
                log.detail(`Controller class found: ${ControllerClass.name}`);
                const controller = new ControllerClass();
                log.detail(`Controller instance created: ${controller.constructor.name}`);
                const upInfo = new koa78_upinfo_1.default(ctx);
                log.detail(`UpInfo created: ${JSON.stringify(upInfo)}`);
                controller.setup(upInfo);
                log.detail('Controller setup completed');
                if (typeof controller[apifun] !== 'function' || apifun.startsWith('_')) {
                    log.debug(`API function not found or not accessible: ${apifun}`);
                    ctx.status = 404;
                    ctx.body = { error: 'API function not found', details: apifun };
                    return;
                }
                log.debug(`Executing controller method: ${apifun}`);
                let result = yield controller[apifun]();
                log.detail(`Controller method ${apifun} executed, result: ${JSON.stringify(result)}`);
                if (controller.up.backtype === "protobuf") {
                    log.debug("Setting response type to protobuf");
                    ctx.set('Content-Type', 'application/x-protobuf');
                    ctx.body = result;
                    return;
                }
                log.debug(`Setting response type to JSON ${result}`);
                ctx.set('Content-Type', 'application/json');
                if (controller.up.backtype === "json" && typeof result !== 'string') {
                    result = JSON.stringify(result);
                }
                ctx.body = JSON.stringify({
                    res: controller.up.res,
                    errmsg: controller.up.errmsg,
                    kind: controller.up.backtype,
                    back: result
                });
            }
            catch (e) {
                log.error("Route error:", e);
                log.error("Stack trace:", e.stack);
                if (e instanceof Error) {
                    if (e.message.startsWith('err:get u info err3')) {
                        ctx.status = 401;
                        ctx.body = { error: 'Unauthorized', details: e.message };
                    }
                    else {
                        switch (e.message) {
                            case 'err:get u info err3':
                                ctx.status = 401;
                                ctx.body = { error: 'Unauthorized', details: e.message };
                                break;
                            case (e.message.startsWith('防止重放攻击') ? e.message : ''):
                                ctx.status = 429;
                                ctx.body = { error: 'Too Many Requests', details: 'Possible replay attack detected' };
                                break;
                            case (e.message.startsWith('参数验证失败') ? e.message : ''):
                            case (e.message.startsWith('up order err:') ? e.message : ''):
                            case (e.message.startsWith('checkCols err:') ? e.message : ''):
                                ctx.status = 400;
                                ctx.body = { error: 'Bad Request', details: e.message };
                                break;
                            default:
                                ctx.status = 500;
                                ctx.body = { error: 'Server Error', details: e.message, stack: e.stack };
                        }
                    }
                }
                else {
                    ctx.status = 500;
                    ctx.body = { error: 'An unknown error occurred' };
                }
            }
        }));
        app.use(router.routes());
        app.use(router.allowedMethods());
        app.use((ctx, next) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (ctx.status === 404) {
                log.debug(`Route not found: ${ctx.method} ${ctx.url}`);
                ctx.body = { error: 'Not Found', details: `The requested URL ${ctx.url} was not found on this server.` };
            }
            yield next();
        }));
        log.info('Routes setup completed');
    });
}
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