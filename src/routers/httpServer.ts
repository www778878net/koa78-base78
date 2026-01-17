import Koa from 'koa';
import { Config } from '../config/Config';
import { ContainerManager } from '../ContainerManager';
import { TsLog78 } from 'tslog78';

import http from 'http';
import { Elasticsearch78 } from '../services/elasticsearch78';
import Router from '@koa/router';
import { Context } from 'koa';
import Base78 from '../controllers/Base78';
import UpInfo from 'koa78-upinfo';
import { ControllerLoader } from '../utils/ControllerLoader';
import bodyParser from 'koa-bodyparser';



// const esClient = Elasticsearch78.getInstance();
const log = TsLog78.Instance;
const router = new Router();
// 统计中间件
const statsMiddleware = async (ctx: Koa.Context, next: () => Promise<any>) => {
    const start = Date.now();  // Request start time

    await next();
    const ms = Date.now() - start;  // Request duration
    // 如果 ctx.params 是 undefined，直接返回
    // if (!ctx.params) {
    //     return; // 直接返回，不进行统计
    // }
    // // 确保参数存在后再解构
    // const { apiver, apisys, apiobj, apifun } = ctx.params;

    // // 如果是测试接口，直接返回
    // if (apiobj == "testtb") return;

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
};

// 错误处理中间件
const errorHandler = async (ctx: Koa.Context, next: () => Promise<any>) => {
    try {

        await next();
    } catch (err) {
        log.error('服务器错误:', err);
        ctx.status = err.status || 500;
        ctx.body = {
            error: err.message || '内部服务器错误',
            details: process.env.NODE_ENV === 'production' ? undefined : err.stack
        };
        ctx.app.emit('error', err, ctx);
    }
};

// 日志中间件
const loggerMiddleware = async (ctx: Koa.Context, next: () => Promise<any>) => {
    const start = Date.now();
    await next();
    const ms = Date.now() - start;

    // 检查是否是心跳API，如果是则不输出日志
    const isHeartbeatApi = (ctx as any).isHeartbeatApi;
    if (!isHeartbeatApi) {
        log.info(`${ctx.method} ${ctx.url} - ${ms}ms`);
    }
};

export async function startServer(port?: number): Promise<{ app: Koa, httpServer: http.Server }> {
    log.info("正在启动服务器...");
    const config = Config.getInstance();
    const httpPort = port || config.get('port') || config.get('httpPort') || 3000;
    log.info(`尝试在端口 ${httpPort} 上启动服务器`);

    const app = new Koa();


    // 中间件注册：按顺序加载
    app.use(errorHandler);           // 错误处理应在最外层
    app.use(statsMiddleware);        // 统计信息收集
    app.use(loggerMiddleware);       // 日志记录
    app.use(bodyParser());           // 使用koa-bodyparser解析请求体
    log.info("正在设置路由...");
    await setupRoutes(app);
    log.info("路由设置成功");







    return new Promise((resolve, reject) => {
        const httpServer = app.listen(httpPort, () => {
            log.info(`HTTP 服务器正在端口 ${httpPort} 上运行`);
            resolve({ app, httpServer });
        });

        httpServer.on('error', (error: NodeJS.ErrnoException) => {
            log.error(error, '服务器错误:');
            if (error.code === 'EADDRINUSE') {
                log.error(`端口 ${httpPort} 已被占用。请选择一个不同的端口。`);
            } else {
                log.error(error, '启动 HTTP 服务器失败:');
            }
            reject(error);
        });
    });
}

// 设置路由函数
async function setupRoutes(app: Koa) {
    log.info('Setting up routes...');

    // 从全局对象获取容器实例或者创建新的ContainerManager实例
    const containerManager = new ContainerManager();
    const container = containerManager.getContainer() || (global as any).appContainer;

    const controllerLoader = container.get(ControllerLoader);

    router.all('/:apiver/:apisys/:apiobj/:apifun', async (ctx: Context) => {
        try {
            const { apiver, apisys, apiobj, apifun } = ctx.params;

            // 判断是否是心跳API，如果是则不输出详细日志
            const isHeartbeatApi = apiver.toLowerCase() === 'apitest' &&
                                   apisys.toLowerCase() === 'testmenu' &&
                                   apiobj.toLowerCase() === 'test78' &&
                                   apifun.toLowerCase() === 'test';

            // 设置标志供日志中间件使用
            (ctx as any).isHeartbeatApi = isHeartbeatApi;

            if (!isHeartbeatApi) {
                log.detail(`Received request for: /${apiver}/${apisys}/${apiobj}/${apifun}`);
            }

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

            if (!isHeartbeatApi) {
                log.detail(`Controller class found: ${ControllerClass.name}`);
            }
            const controller = new ControllerClass() as Base78<any>;
            if (!isHeartbeatApi) {
                log.detail(`Controller instance created: ${controller.constructor.name}`);
            }

            const upInfo = new UpInfo(ctx);

            controller.setup(upInfo);


            if (typeof controller[apifun] !== 'function' || apifun.startsWith('_')) {
                log.debug(`API function not found or not accessible: ${apifun}`);
                ctx.status = 404;
                ctx.body = { error: 'API function not found', details: apifun };
                return;
            }

            if (!isHeartbeatApi) {
                log.debug(`Executing controller method: ${apifun}`);
            }
            let result = await controller[apifun]();
            if (!isHeartbeatApi) {
                log.detail(`Controller method ${apifun} executed, result: ${JSON.stringify(result)}`);
            }

            if (controller.up.backtype === "protobuf") {
                log.debug("Setting response type to protobuf");
                ctx.set('Content-Type', 'application/x-protobuf');
                // 确保返回的是二进制数据而不是字符串
                if (typeof result === 'string') {
                    // 如果是字符串，尝试转换为Buffer
                    ctx.body = Buffer.from(result, 'binary');
                } else if (result instanceof Uint8Array) {
                    // 如果已经是Uint8Array，直接使用
                    ctx.body = Buffer.from(result);
                } else {
                    // 其他情况，尝试转换为Buffer
                    ctx.body = result;
                }
                return;
            }

            if (!isHeartbeatApi) {
                log.debug(`Setting response type to JSON ${result}`);
            }
            ctx.set('Content-Type', 'application/json');
            ctx.body = {
                res: controller.up.res,
                errmsg: controller.up.errmsg,
                kind: controller.up.backtype,
                back: result
            };

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
        await next();
    });

    log.info('Routes setup completed');
}

export async function stopServer(server: http.Server) {
    return new Promise<void>((resolve, reject) => {
        if (server && server.close) {
            server.close((err: Error | undefined) => {
                if (err) {
                    log.error(err, '关闭服务器时出错:');
                    reject(err);
                } else {
                    log.info('服务器成功关闭');
                    resolve();
                }
            });
        } else {
            resolve();
        }
    });
}