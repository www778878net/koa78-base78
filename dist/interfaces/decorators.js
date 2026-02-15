"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiMethod = ApiMethod;
const tslib_1 = require("tslib");
const AuthService_1 = require("../services/AuthService");
const mylogger_1 = require("../utils/mylogger");
// 延迟初始化logger缓存，避免模块加载时初始化导致502错误
let _logger = null;
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
                    // 记录详细的错误信息（tbname, dbname, method, apimicro, apiobj, apifun, error, sid）
                    const errorInfo = {
                        tbname: ((_a = this.tableConfig) === null || _a === void 0 ? void 0 : _a.tbname) || 'unknown',
                        dbname: this.dbname || 'default',
                        method: propertyKey,
                        apimicroro: (_b = this.up) === null || _b === void 0 ? void 0 : _apimicroicro,
                        apiobj: (_c = this.up) === null || _c === void 0 ? void 0 : _c.apiobj,
                        apifun: (_d = this.up) === null || _d === void 0 ? void 0 : _d.apifun,
                        error: errorMessage,
                        sid: (_e = this.up) === null || _e === void 0 ? void 0 : _e.sid
                    };
                    // 延迟初始化logger，只在首次使用时才创建，避免模块加载时初始化导致502
                    if (!_logger) {
                        try {
                            _logger = mylogger_1.MyLogger.getInstance("base78", 3, "koa78");
                        }
                        catch (err) {
                            // logger初始化失败，使用console.error作为后备
                            console.error(`[ApiMethod Error] ${JSON.stringify(errorInfo)}`);
                            throw new Error(`参数验证失败: ${errorMessage}`);
                        }
                    }
                    _logger.error(`[ApiMethod Error] ${JSON.stringify(errorInfo)}`, error);
                    throw new Error(`参数验证失败: ${errorMessage}`);
                }
            });
        };
        return descriptor;
    };
}
//# sourceMappingURL=decorators.js.map