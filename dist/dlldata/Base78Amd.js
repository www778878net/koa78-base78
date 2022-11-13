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
const memcache78_1 = require("@www778878net/memcache78");
const redis78_1 = require("@www778878net/redis78");
const Apiqq78_1 = require("../dllopen/Apiqq78");
const ApiWxSmall_1 = require("../dllopen/ApiWxSmall");
var iconv = require('iconv-lite');
var fs = require('fs');
//必须要带参数启动 不然就要报错 
var fspath = ""; // = process.argv[3]
for (var i = 0; i < process.argv.length; i++) {
    if (process.argv[i] == "config") {
        fspath = process.argv[i + 1];
        break;
    }
}
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
        //运行时    
        this.Config = Config78; //config78
        this.nodejslog = Config78.nodejslog; //是否统计nodejs效率
        this.iplog = Config78.iplog; //是否统计访客IP
        this.location = Config78.location; //运行环境
        this.Argv = process.argv; //process.argv
        //各种连接
        this.mysql2 = new mysql78_1.default(Config78.mysql2); //支持多mysql
        this.mysql1 = new mysql78_1.default(Config78.mysql); //支持多mysql
        this.mysql = this.mysql1; //语法糖简化 默认mysql
        this.memcache = new memcache78_1.default(Config78.memcached);
        this.redis = new redis78_1.default(Config78.redis);
        //表相关属性
        this.tbname = "";
        this.cols = []; //所有列
        this.colsImp = []; //除remark外
        this.uidcid = "cid"; //cid uid zid(都有可能) nid（都不用)
        this.colsremark = ["remark", "remark2", "remark3", "remark4", "remark5", "remark6"]; //所有表都有的默认字段
        //常量：
        this.cidmy = "d4856531-e9d3-20f3-4c22-fe3c65fb009c"; //管理员帐套
        this.cidguest = "GUEST000-8888-8888-8888-GUEST00GUEST"; //测试帐套
        this.mem_sid = "lovers_sid3_"; //保存用户N个ID 方便修改 千万不能改为lovers_sid_
        this.up = new koa78_upinfo_1.default(ctx);
        Config78.apiqq["host"] = Config78.host;
        this.apiqq = new Apiqq78_1.default(Config78.apiqq, this.memcache);
        this.apiwxsmall = new ApiWxSmall_1.default(Config78.apiwxsmall, this.memcache);
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
     * 自动判断修改还是新增 (自定义逻辑可重写覆盖此方法)
     * */
    m() {
        return this._m();
    }
    /**
     * get方法
     * */
    get() {
        return this._get();
    }
    del() {
        return this._del();
    }
    /**
     * 获取自定义栏位
     */
    getCustomCols() {
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
            let datatb;
            let values;
            var item = self.tbname + "_customfields";
            if (up.pars.length >= 1 && up.pars[0] != "")
                item += "_" + up.pars[0];
            if (self.uidcid === 'cid') {
                values = [up.cid, item];
                datatb = 'pars_co';
            }
            else {
                values = [up.uid, item];
                datatb = 'pars_users';
            }
            var sb = "SELECT data	FROM " + datatb + " where " + self.uidcid + "=? and item=?";
            let back = yield self.mysql1.doGet(sb, values, up);
            if (back.length === 0)
                back = '||||';
            else
                back = back[0]['data'];
            resolve(back);
        }));
    }
    /**
     * 权限检查(用户日期)
     */
    _vidateforuid(usefor) {
        const self = this;
        const up = self.up;
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            //await self._addWarn(usefor, "sys_sql", "services", "services_dinpay");
            let back;
            if (up.cid == self.cidmy) {
                back = {
                    code: 200
                };
                resolve(back);
                return;
            }
            //Config78.location == "test" &&
            if (up.cid == self.cidmy) {
                back = {
                    code: 200
                };
                resolve(back);
                return;
            }
            back = {
                code: -1,
                errback: up.cid
            };
            resolve(back);
        }));
    }
    _del() {
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
            var sb = "delete from  " + self.tbname + "   WHERE id=? and " + self.uidcid + "=? LIMIT 1";
            var values = [up.mid, up[self.uidcid]];
            let back = yield self.mysql.doM(sb, values, up);
            if (back == 0) {
                back = "err:没有行被修改";
            }
            else {
                back = up.mid;
            }
            if (back == 1)
                back = up.mid;
            resolve(back);
        }));
    }
    /**
     * 获取
     * @param where
     * @param colp
     */
    _get(where, colp) {
        const self = this;
        //colp = colp || this.cols;
        where = where || "";
        const up = self.up;
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                yield this._upcheck();
            }
            catch (e) {
                reject(e);
                return;
            }
            let values = [up[self.uidcid]];
            colp = colp || up.cols; //修改列
            if (where == "" && up.pars.length >= 1) {
                for (var i = 0; i < up.pars.length; i++) {
                    if (up.pars[i] != "") {
                        where += " and " + colp[i] + "=?";
                        values.push(up.pars[i]);
                    }
                }
            }
            var sb = 'SELECT `' + colp.join("`,`") + "`,id,upby,uptime,idpk FROM " + self.tbname
                + " WHERE " + self.uidcid + '=? ' + where;
            if (up.order !== "idpk")
                sb += '  order by ' + up.order;
            sb += ' limit ' + up.getstart + ',' + up.getnumber;
            //if (where !== '')
            //    values = values.concat(up.pars);
            let tb = yield self.mysql1.doGet(sb, values, up);
            resolve(tb);
        }));
    }
    _upcheck() {
        let self = this;
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            let up = self.up;
            //验证
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
            //数据库判断 获取用户信息
            let tmp = yield self.memcache.tbget(self.mem_sid + up.sid, up.debug);
            let t;
            if (!tmp) {
                //console.log(up.sid + JSON.stringify(tmp));
                switch (Config78.location) {
                    case "qq": //这里可以http请求验证用户
                        reject("err:get u info err html");
                        break;
                    default:
                        var cmdtext = "select t1.* ,companys.coname,companys.uid as idceo,companys.id as cid  from    (SELECT uname,id,upby,uptime,sid_web_date,  " +
                            "  idcodef,idpk   FROM lovers Where sid=? or sid_web=?)as t1 LEFT JOIN `companysuser` as t2 on" +
                            " t2.uid=t1.id and t2.cid=t1.idcodef left join companys    on t1.idcodef=companys.id";
                        var values = [up.sid, up.sid];
                        t = yield self.mysql.doGet(cmdtext, values, up);
                        if (t.length == 0)
                            tmp = "";
                        else {
                            tmp = t[0];
                            self.memcache.tbset(self.mem_sid + up.sid, tmp);
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
            if (up.uname == "sysadmin")
                up.debug = true;
            //await self._upcheck_debug();
            up.errmessage = "ok";
            resolve("ok");
        }));
    }
    /**
     * 自动判断修改还是新增
     * @param colp 自定义字段
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
                    back = "err:没有行被修改";
                    if (up.v >= 17.1) {
                        up.res = -8888;
                        up.errmsg = "没有行被修改";
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
     *新增
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
            //应改为减字段而不是填充空（避免覆盖数据）
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
    * 修改
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
            //下版改为减字段而不是填充空（避免覆盖数据）
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
                back = "err:没有行被修改";
                up.res = -8888;
                up.errmsg = "没有行被修改";
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
//Base78Amd.prototype.cidmy = "";
//Base78Amd.prototype.cidguest = "GUEST000-8888-8888-8888-GUEST00GUEST";
//Base78Amd.prototype.colsremark = ["remark", "remark2", "remark3", "remark4", "remark5", "remark6"];
//Base78Amd.prototype.Argv = process.argv;
//Base78Amd.prototype.Config = Config78;
//Base78Amd.prototype.mysql1 = new Mysql78(Config78.mysql);
//Base78Amd.prototype.mysql = Base78Amd.prototype.mysql1;
//Base78Amd.prototype.memcache = new MemCache78(Config78.memcached);
//Base78Amd.prototype.redis = new Redis78(Config78.redis);
//# sourceMappingURL=Base78Amd.js.map