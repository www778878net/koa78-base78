"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const Base78_1 = tslib_1.__importDefault(require("../../controllers/Base78"));
const decorators_1 = require("../../interfaces/decorators");
class Test78 extends Base78_1.default {
    get colsImp() {
        return ["field1", "field2"];
    }
    get uidcid() {
        return "cid";
    }
    test2() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const self = this;
            const up = self.up;
            console.log("test in test" + up.uname);
            return new Promise((resolve, reject) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                resolve("有权限调用OK" + up.parsn);
                return;
            }));
        });
    }
    test() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const self = this;
            const up = self.up;
            console.log("test in test" + up.uname);
            return new Promise((resolve, reject) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                resolve("看到我说明路由ok,中文ok,无权限调用OK" + up.parsn);
                return;
            }));
        });
    }
}
tslib_1.__decorate([
    (0, decorators_1.ApiMethod)(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", Promise)
], Test78.prototype, "test2", null);
exports.default = Test78;
//# sourceMappingURL=Test78.js.map