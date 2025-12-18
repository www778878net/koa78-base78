"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const Base78_1 = require("../../controllers/Base78");
const decorators_1 = require("../../interfaces/decorators");
class Test78 extends Base78_1.CidBase78 {
    testMemcachedAdd() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const lockKey = `${this.constructor.name}_2day_report_lock_test`;
            // 尝试获取锁
            const lock = yield this.cacheService.add(lockKey, 'locked');
            const reback = yield this.cacheService.get(lockKey);
            const back = {
                lock: lock,
                lockKey: lockKey,
                reback: reback
            };
            return back;
        });
    }
    testMemcached() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.cacheService.set("test", "testMemcached");
            return this.cacheService.get("test");
        });
    }
    testRedis() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.cacheService.redisSet("test", "testRedis");
            return this.cacheService.redisGet("test");
        });
    }
    test() {
        const self = this;
        const up = self.up;
        console.log("test in test" + up.uname);
        return new Promise((resolve, reject) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            resolve("看到我说明路由ok,中文ok,无权限调用OK" + up.parsn);
            return;
        }));
    }
    getConfig78() {
        const self = this;
        const up = self.up;
        console.log("test in getConfig78" + up.uname);
        return new Promise((resolve, reject) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            resolve("不能公开config测试的时候用用");
            //resolve({ Argv: self.Argv, Config: self.Config });
            return;
        }));
    }
}
tslib_1.__decorate([
    (0, decorators_1.ApiMethod)(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", Promise)
], Test78.prototype, "testMemcachedAdd", null);
tslib_1.__decorate([
    (0, decorators_1.ApiMethod)(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", Promise)
], Test78.prototype, "testMemcached", null);
tslib_1.__decorate([
    (0, decorators_1.ApiMethod)(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", Promise)
], Test78.prototype, "testRedis", null);
exports.default = Test78;
//# sourceMappingURL=Test78.js.map