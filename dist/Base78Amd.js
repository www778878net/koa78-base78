"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const koa78_upinfo_1 = require("@www778878net/koa78-upinfo");
//import MemCache78 from "./MemCache78";
class Base78Amd {
    constructor(ctx) {
        //memcache: MemCache78;
        //���������
        this.tbname = "";
        this.cols = []; //������
        this.colsImp = []; //��remark��
        this.uidcid = "cid"; //cid uid zid(���п���) nid��������)
        this.colsremark = []; //���б����е�Ĭ���ֶ�
        this.up = new koa78_upinfo_1.default(ctx);
    }
}
exports.default = Base78Amd;
//# sourceMappingURL=Base78Amd.js.map