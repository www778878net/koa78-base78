import Router from '@koa/router';
import { Context } from 'koa';
import Base78 from '../controllers/Base78';
import UpInfo from 'koa78-upinfo';
import { TsLog78 } from 'tslog78';
import { ContainerManager } from '../ContainerManager';
import { ControllerLoader } from '../utils/ControllerLoader';

const log = new TsLog78();
const router = new Router();

//let isdebug = true;

export async function setupRoutes(app: any) {
    log.info('Setting up routes...');

    // 从全局对象获取容器实例或者创建新的ContainerManager实例
    const containerManager = new ContainerManager();
    const container = containerManager.getContainer() || (global as any).appContainer;

    const controllerLoader = container.get(ControllerLoader);

    router.all('/:apiver/:apisys/:apiobj/:apifun', async (ctx: Context) => {
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
            const controller = new ControllerClass() as Base78<any>;
            log.detail(`Controller instance created: ${controller.constructor.name}`);

            const upInfo = new UpInfo(ctx);
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
            let result = await controller[apifun]();
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

        } catch (e) {
            log.error("Route error:", e);
            log.error("Stack trace:", e.stack);

            if (e instanceof Error) {
                if (e.message.startsWith('err:get u info err3')) {
                    ctx.status = 401;
                    ctx.body = { error: 'Unauthorized', details: e.message };
                } else {
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
            } else {
                ctx.status = 500;
                ctx.body = { error: 'An unknown error occurred' };
            }
        }
    });

    app.use(router.routes());
    app.use(router.allowedMethods());

    app.use(async (ctx, next) => {
        if (ctx.status === 404) {
            log.debug(`Route not found: ${ctx.method} ${ctx.url}`);
            ctx.body = { error: 'Not Found', details: `The requested URL ${ctx.url} was not found on this server.` };
        }
    });

    log.info('Routes setup completed');
}
// 导出路由器，以便在其他地方使用
export { router };