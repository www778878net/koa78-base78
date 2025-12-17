"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiMethod = void 0;
const tslib_1 = require("tslib");
const AuthService_1 = require("../services/AuthService");
function ApiMethod() {
    return function (target, propertyKey, descriptor) {
        const originalMethod = descriptor.value;
        descriptor.value = function (...args) {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                try {
                    // 执行 upcheck
                    yield AuthService_1.AuthService.getInstance().upcheck(this.up, this.tableConfig.cols, this.dbname);
                    // 执行原始方法
                    return yield originalMethod.apply(this, args);
                }
                catch (error) {
                    if (error instanceof Error) {
                        this._setBack(-8888, error.message);
                    }
                    else {
                        this._setBack(-8888, 'An unknown error occurred');
                    }
                    throw error;
                }
            });
        };
        return descriptor;
    };
}
exports.ApiMethod = ApiMethod;
//# sourceMappingURL=decorators.js.map