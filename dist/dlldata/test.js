"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const Base78_1 = require("./Base78");
class test extends Base78_1.default {
    constructor(ctx) {
        super(ctx);
        //this.uidcid = "uid";
        this.tbname = "test";
        //这个不是表
        this.colsImp = [];
        this.cols = this.colsImp.concat(this.colsremark);
    }
    testredis() {
        const self = this;
        const up = self.up;
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            let setback = yield self.redis.set("testitem", 8, 60);
            let getback = yield self.redis.get("testitem");
            resolve(getback);
            return;
        }));
    }
}
exports.default = test;
//# sourceMappingURL=test.js.map