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
const koa78_upinfo_1 = require("@www778878net/koa78-upinfo");
const mysql78_1 = require("@www778878net/mysql78");
//import MemCache78 from "./MemCache78";
var iconv = require('iconv-lite');
var fs = require('fs');
var fspath = process.argv[3];
var Config78 = loadjson(fspath);
function loadjson(filepath) {
    var data;
    try {
        var jsondata = iconv.decode(fs.readFileSync(filepath, "binary"), "utf8");
        data = JSON.parse(jsondata);
    }
    catch (err) {
        console.log(err);
    }
    return data;
}
class Base78Amd {
    constructor(ctx) {
        //��������
        this.mysql2 = new mysql78_1.default(null);
        this.mysql1 = new mysql78_1.default(null);
        this.mysql = new mysql78_1.default(null);
        //memcache: MemCache78;
        //���������
        this.tbname = "";
        this.cols = []; //������
        this.colsImp = []; //��remark��
        this.uidcid = "cid"; //cid uid zid(���п���) nid��������)
        this.colsremark = []; //���б����е�Ĭ���ֶ�
        this.up = new koa78_upinfo_1.default(ctx);
    }
    _m(colp) {
        const self = this;
        const up = self.up;
        //if (up.v >= 18.2) {
        //    colp = colp || this.cols;
        //} else
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                yield this._upcheck();
            }
            catch (e) {
                reject(e);
                return;
            }
            if (up.v >= 17.2) {
                colp = colp || up.cols;
            }
            else {
                colp = colp || this.colsImp;
            }
            try {
                var sb = 'SELECT id FROM ' + self.tbname + ' where id=? ';
                let back = yield self.mysql.doGet(sb, [up.mid], up);
                //console.log(back)
                if (back.length == 1)
                    back = yield self._mUpdate(colp);
                else
                    back = yield self._mAdd(colp);
                //console.log(back)
                if (back == 0) {
                    back = "err:û���б��޸�";
                    if (up.v >= 17.1) {
                        up.res = -8888;
                        up.errmsg = "û���б��޸�";
                    }
                }
                else if (back == 1)
                    back = up.mid;
                else
                    back = "" + back;
                resolve(back);
            }
            catch (e) {
                reject(e);
                return;
            }
        }));
    }
}
exports.default = Base78Amd;
Base78Amd.prototype.mysql1 = new mysql78_1.default(Config78.mysql);
Base78Amd.prototype.mysql = Base78Amd.prototype.mysql1;
//# sourceMappingURL=Base78Amd.js.map