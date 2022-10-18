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
const Validate78_1 = require("./Validate78");
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
    mAdd(colp) {
        // colp = colp || this.colsImp;
        //if (this.ismongo)
        //    return this._mAddMongo();
        return this._mAdd(colp);
    }
    mUpdate(colp) {
        // colp = colp || this.colsImp;
        //if (this.ismongo)
        //    return this._mUpdateMongo();
        return this._mUpdate(colp);
    }
    /**
     * �Զ��ж��޸Ļ������� (�Զ����߼�����д���Ǵ˷���)
     * */
    m() {
        return this._m();
    }
    _upcheck() {
        let self = this;
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            let up = self.up;
            //��֤
            if (up.errmessage == "ok") {
                resolve("ok");
                return;
            }
            //up.redis = self.redis;
            if (up.sid === '' || up.sid.length !== 36) {
                up.errmessage = up.uname + 'sid err' + up.sid;
            }
            //if (up.cidn === '' || up.cidn.length !== 36) {
            //    up.errmessage = up.uname + 'cid err' + up.cidn;
            //}
            if (up.bcid.length == 36 && (up.bcid.indexOf("-") !== 8 || up.bcid.indexOf("-", 19) !== 23)) {
                up.errmessage = up.uname + 'bcid err' + up.bcid;
            }
            if (up.mid === '' || up.mid.length !== 36) {
                up.errmessage = up.method + 'mid err' + up.mid;
            }
            if (!Validate78_1.default.isNum(up.getstart) || !Validate78_1.default.isNum(up.getnumber)) {
                up.errmessage = 'getstart or number err' + up.getstart + up.getnumber;
            }
            if (up.errmessage !== "") {
                reject(up.errmessage);
                return;
            }
            if (!up.inOrder(self.cols)) {
                reject("up order err:" + up.order);
                return;
            }
            let tmps = up.checkCols(self.cols);
            if (tmps != "checkcolsallok") {
                reject("checkCols err:" + tmps + JSON.stringify(up.cols));
                return;
            }
            if (up.cols.length === 1 && up.cols[0] === "all")
                up.cols = self.cols;
            //���ݿ��ж� ��ȡ�û���Ϣ
            let tmp = ""; // await self.memcache.tbget(self.mem_sid + up.sid, up.debug);
            let t;
            if (!tmp) {
                //console.log(up.sid + JSON.stringify(tmp));
                switch (Config78.location) {
                    case "qq": //�������http������֤�û�
                        reject("err:get u info err html");
                        break;
                    default:
                        var cmdtext = "select t1.* ,companys.coname,companys.uid as idceo,companys.id as cid  from    (SELECT uname,pwd,id,upby,uptime,sid_web_date,  " +
                            "  idcoDef,openweixin ,truename,mobile,idpk   FROM lovers Where sid=? or sid_web=?)as t1 LEFT JOIN `companysuser` as t2 on" +
                            " t2.uid=t1.id and t2.cid=t1.idcodef left join companys    on t1.idcodef=companys.id";
                        var values = [up.sid, up.sid];
                        t = yield self.mysql.doGet(cmdtext, values, up);
                        if (t.length == 0)
                            tmp = "";
                        else {
                            tmp = t[0];
                            //self.memcache.tbset(self.mem_sid + up.sid, tmp);
                        }
                        break;
                }
            }
            if (tmp) {
                up.uid = tmp["id"];
                up.uname = tmp["uname"];
                up.cid = tmp["cid"];
                up.coname = tmp["coname"];
                up.idceo = tmp["idceo"];
                up.weixin = tmp["openweixin"];
                up.truename = tmp["truename"];
                up.idpk = tmp["idpk"];
                up.mobile = tmp["mobile"];
            }
            else {
                reject("err:get u info err3");
                return;
            }
            up.bcid = up.bcid || up.cid;
            if (up.uname == "test")
                up.debug = true;
            //await self._upcheck_debug();
            up.errmessage = "ok";
            resolve("ok");
        }));
    }
    /**
     * �Զ��ж��޸Ļ�������
     * @param colp �Զ����ֶ�
     */
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
    /**
     *����
     * @param colp
     */
    _mAdd(colp) {
        const self = this;
        const up = self.up;
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                yield this._upcheck();
            }
            catch (e) {
                reject(e);
                return;
            }
            //Ӧ��Ϊ���ֶζ��������գ����⸲�����ݣ�
            if (up.v >= 17.2) {
                colp = colp || this.cols;
                if (up.pars.length < colp.length) {
                    colp = colp.slice(0, up.pars.length);
                }
            }
            else {
                colp = colp || this.colsImp;
                if (up.pars.length < colp.length) {
                    for (let j = up.pars.length; j < colp.length; j++) {
                        up.pars.push('');
                    }
                }
            }
            let sb = "INSERT INTO " + self.tbname + "(";
            sb += colp.join(",");
            sb += ",id,upby,uptime," + self.uidcid + "  ) VALUES( ?,?,?,?";
            for (let i = 0; i < colp.length; i++) {
                sb += ",?";
            }
            sb += ")";
            let values = up.pars.slice(0, colp.length);
            values.push(up.mid);
            values.push(up.uname);
            values.push(up.utime);
            values.push(up[self.uidcid]);
            let back = yield self.mysql.doM(sb, values, up);
            if (back == 1)
                back = up.mid;
            resolve(back);
        }));
    }
    /**
    * �޸�
    * @param colp
    */
    _mUpdate(colp) {
        const self = this;
        const up = self.up;
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                yield this._upcheck();
            }
            catch (e) {
                reject(e);
                return;
            }
            //�°��Ϊ���ֶζ��������գ����⸲�����ݣ�
            if (up.v >= 17.2) {
                colp = colp || up.cols;
                if (up.pars.length < colp.length) {
                    colp = colp.slice(0, up.pars.length);
                }
            }
            else {
                colp = colp || self.colsImp;
                if (up.pars.length < colp.length) {
                    for (let j = up.pars.length; j < colp.length; j++) {
                        up.pars.push('');
                    }
                }
            }
            //update
            var sb2 = "UPDATE  " + self.tbname + " SET ";
            sb2 += colp.join("=?,") + "=?,upby=?,uptime=? WHERE id=? and " + self.uidcid + "=? LIMIT 1";
            var values2 = up.pars.slice(0, colp.length);
            values2.push(up.uname);
            values2.push(up.utime);
            values2.push(up.mid);
            values2.push(up[self.uidcid]);
            let back = yield self.mysql.doM(sb2, values2, up);
            if (back == 0) {
                up.backtype = "string";
                back = "err:û���б��޸�";
                up.res = -8888;
                up.errmsg = "û���б��޸�";
                //query["_state"] = 'fail';
            }
            else {
                back = up.mid;
                //query["_state"] = 'ok';
            }
            resolve(back);
        }));
    }
}
exports.default = Base78Amd;
Base78Amd.prototype.mysql1 = new mysql78_1.default(Config78.mysql);
Base78Amd.prototype.mysql = Base78Amd.prototype.mysql1;
//# sourceMappingURL=Base78Amd.js.map