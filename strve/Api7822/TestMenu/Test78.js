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
const Base78 = require("../../../dist/dlldata/Base78").default;
const Util = require("util");
class Test78 extends Base78 {
    constructor(ctx) {
        super(ctx);
        //this.uidcid = "uid";
        this.tbname = "Test78";
        //这个不是表
        this.colsImp = [];
        this.cols = this.colsImp.concat(this.colsremark);
    }

    testupcheck(){
      const self = this;
      const up = self.up;
 
     
      return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
        try {
            yield self._upcheck();
        } catch (e) {
            reject(e);
            return;
        }     
        let back=  yield self.getCustomCols();
    
          resolve(back);
          return;
        }));
      }

    testcidmy() {
        const self = this;
        const up = self.up;
        
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            
            resolve(self.cidmy);
            return;
        }));
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

    test() {
        const self = this;
        const up = self.up;
        console.log("test in test" + up.uname);
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            resolve("看到我说明路由ok,中文ok,无权限调用OK" + up.parsn);
            return;
        }));
    }
    getConfig78() {
        const self = this;
        const up = self.up;
        console.log("test in getConfig78" + up.uname);
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            //resolve({ Argv: self.Argv, Config: self.Config });
            resolve("不能公开config测试的时候用用")
            return;
        }));
    }
}
exports.default = Test78;
//# sourceMappingURL=Test78.js.map