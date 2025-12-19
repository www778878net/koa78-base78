"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = exports.setupRoutes = void 0;
const tslib_1 = require("tslib");
const router_1 = tslib_1.__importDefault(require("@koa/router"));
const koa78_upinfo_1 = tslib_1.__importDefault(require("koa78-upinfo"));
const tslog78_1 = require("tslog78");
const ContainerManager_1 = require("../ContainerManager");
const ControllerLoader_1 = require("../utils/ControllerLoader");
const log = new tslog78_1.TsLog78();
const router = new router_1.default();
exports.router = router;
//let isdebug = true;
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
                // 修复：避免序列化包含循环引用的upInfo对象导致错误
                log.detail(`UpInfo created with sid: ${upInfo.sid}, method: ${upInfo.method}`);
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
                // 修复：避免序列化result对象导致循环引用错误
                log.detail(`Controller method ${apifun} executed successfully`);
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
        }));
        log.info('Routes setup completed');
    });
}
exports.setupRoutes = setupRoutes;
//# sourceMappingURL=route-registry.js.map