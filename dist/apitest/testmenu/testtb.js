"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const Base78_1 = require("../../controllers/Base78");
const decorators_1 = require("../../interfaces/decorators");
// 模拟数据
const mockData = [
    { kind: "newdata", item: "itemval", data: "mock_data_1", id: "mock-id-1", idpk: 1 },
    { kind: "kindval", item: "mock-item", data: "mock_data_2", id: "mock-id-2", idpk: 2 },
    // 可以根据需要添加更多模拟数据
];
class testtb extends Base78_1.CidBase78 {
    health() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let sb = 'SELECT IDPK FROM testtb limit 1';
            let tb = yield this.dbService.get(sb, [], this.up);
            if (tb.length == 0) {
                throw new Error("db error restart");
            }
            return "ok";
        });
    }
    test_nojson() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.logger.info("testtb test_nojson called");
            return JSON.stringify({ back: "Custom method result" });
        });
    }
    customMethod() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.logger.info("testtb customMethod called");
            return JSON.stringify({ back: "Custom method result" });
        });
    }
    get() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                this.logger.debug(`开始执行 ${this.constructor.name} get 方法`);
                this.logger.debug('UpInfo 内容: ' + JSON.stringify(this.up));
                // 使用模拟数据而不是数据库查询
                const result = mockData;
                this.logger.debug('模拟数据结果: ' + JSON.stringify(result));
                return result;
            }
            catch (error) {
                this.logger.error(`${this.constructor.name} get 方法执行错误: ${error instanceof Error ? error.message : String(error)}`);
                throw error;
            }
        });
    }
    m() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.logger.info("testtb m method called");
            return this.up.mid;
        });
    }
}
tslib_1.__decorate([
    (0, decorators_1.ApiMethod)(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", Promise)
], testtb.prototype, "test_nojson", null);
tslib_1.__decorate([
    (0, decorators_1.ApiMethod)(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", Promise)
], testtb.prototype, "customMethod", null);
tslib_1.__decorate([
    (0, decorators_1.ApiMethod)(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", Promise)
], testtb.prototype, "get", null);
tslib_1.__decorate([
    (0, decorators_1.ApiMethod)(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", Promise)
], testtb.prototype, "m", null);
exports.default = testtb;
//# sourceMappingURL=testtb.js.map