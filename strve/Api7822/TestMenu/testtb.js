"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Base78 = require("../../../dist/dlldata/Base78").default;
/**
 * 参数表 （测试用）
 * */
class testtb extends Base78 {
    constructor(ctx) {
        super(ctx);
        //this.uidcid = "uid";//默认是cid
        this.tbname = "testtb";
        this.colsImp = [
            //类别   项目   设置值
            "kind", "item", "data"
        ];
        this.cols = this.colsImp.concat(this.colsremark);
    }
    m() {
        this.up.debug = true;
        return this._m();
    }
}
exports.default = testtb;
//# sourceMappingURL=testtb.js.map