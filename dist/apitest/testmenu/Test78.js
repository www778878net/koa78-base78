"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const Base78_1 = require("../../controllers/Base78");
const decorators_1 = require("../../interfaces/decorators");
class Test78 extends Base78_1.CidBase78 {
    constructor() {
        super();
        // 设置分表配置示例 - 按天分表
        this.setShardingConfig({
            type: 'daily',
            retentionDays: 5,
            tableSQL: `
                CREATE TABLE IF NOT EXISTS {TABLE_NAME} (
                    id VARCHAR(36) NOT NULL DEFAULT '',
                    name VARCHAR(100) NOT NULL DEFAULT '',
                    content TEXT NOT NULL,
                    upby VARCHAR(50) NOT NULL DEFAULT '',
                    uptime DATETIME NOT NULL,
                    idpk INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                    ${this.tableConfig.uidcid} VARCHAR(36) NOT NULL DEFAULT ''
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3
            `
        });
    }
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
    testShardingConfig() {
        var _a, _b, _c;
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // 测试分表配置是否正确设置
            return {
                shardingType: (_a = this.shardingConfig) === null || _a === void 0 ? void 0 : _a.type,
                retentionDays: (_b = this.shardingConfig) === null || _b === void 0 ? void 0 : _b.retentionDays,
                hasTableSQL: !!((_c = this.shardingConfig) === null || _c === void 0 ? void 0 : _c.tableSQL)
            };
        });
    }
    testDynamicTableName() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // 测试动态表名生成
            return this.getDynamicTableName();
        });
    }
    testPerformShardingMaintenance() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                // 执行分表维护任务
                yield this.performShardingTableMaintenance();
                return "分表维护任务执行成功";
            }
            catch (error) {
                return `分表维护任务执行失败: ${error.message}`;
            }
        });
    }
    test2() {
        const self = this;
        const up = self.up;
        console.log("test   in3 test2" + up.uname);
        return new Promise((resolve, reject) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            resolve("有权限调用OK" + up.parsn);
            return;
        }));
    }
    test() {
        const self = this;
        const up = self.up;
        console.log("testtb in test" + up.uname);
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
tslib_1.__decorate([
    (0, decorators_1.ApiMethod)(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", Promise)
], Test78.prototype, "testShardingConfig", null);
tslib_1.__decorate([
    (0, decorators_1.ApiMethod)(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", Promise)
], Test78.prototype, "testDynamicTableName", null);
tslib_1.__decorate([
    (0, decorators_1.ApiMethod)(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", Promise)
], Test78.prototype, "testPerformShardingMaintenance", null);
tslib_1.__decorate([
    (0, decorators_1.ApiMethod)(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", Promise)
], Test78.prototype, "test2", null);
exports.default = Test78;
//# sourceMappingURL=Test78.js.map