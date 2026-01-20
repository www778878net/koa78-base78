"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiMethod = ApiMethod;
const tslib_1 = require("tslib");
const AuthService_1 = require("../services/AuthService");
const mylogger_1 = require("../utils/mylogger");
// 获取logger实例（单例模式）
const log = mylogger_1.MyLogger.getInstance("base78", 3, "koa78");
function ApiMethod() {
    return function (target, propertyKey, descriptor) {
        const originalMethod = descriptor.value;
        descriptor.value = function (...args) {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                var _a, _b, _c, _d, _e;
                try {
                    // 从容器中获取AuthService实例
                    const container = global.appContainer;
                    if (!container) {
                        throw new Error('App container not initialized');
                    }
                    const authService = container ? container.get(AuthService_1.AuthService) : AuthService_1.AuthService.getInstance();
                    // 执行 upcheck
                    yield authService.upcheck(this.up, this.tableConfig.cols, this.dbname);
                    // 执行原始方法
                    return yield originalMethod.apply(this, args);
                }
                catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
                    this._setBack(-8888, errorMessage);
                    // 记录错误日志：包含表名、方法名和错误信息
                    const errorInfo = {
                        tbname: ((_a = this.tableConfig) === null || _a === void 0 ? void 0 : _a.tbname) || 'unknown',
                        dbname: this.dbname || 'default',
                        method: propertyKey,
                        apisys: (_b = this.up) === null || _b === void 0 ? void 0 : _b.apisys,
                        apiobj: (_c = this.up) === null || _c === void 0 ? void 0 : _c.apiobj,
                        apifun: (_d = this.up) === null || _d === void 0 ? void 0 : _d.apifun,
                        error: errorMessage,
                        sid: (_e = this.up) === null || _e === void 0 ? void 0 : _e.sid
                    };
                    // 使用MyLogger记录错误日志到文件
                    log.error(`[ApiMethod Error] ${JSON.stringify(errorInfo)}`, error);
                    // 重新抛出错误，让上层处理器捕获并返回适当的 HTTP 状态码
                    // 错误消息会被 httpServer.ts 中的错误处理器捕获
                    throw new Error(`参数验证失败: ${errorMessage}`);
                }
            });
        };
        return descriptor;
    };
}
//# sourceMappingURL=decorators.js.map