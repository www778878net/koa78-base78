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
//Base78.ts
const koa78_upinfo_1 = require("koa78-upinfo");
const Base78Amd_1 = require("./Base78Amd");
const Util = require("util");
/**
 * 基类 主要是展示out逻辑  和语法糖
 * */
class Base78 extends Base78Amd_1.default {
    constructor(ctx) {
        super(ctx);
    }
    /**
    * 设置返回值类型
    * @param res 默认0 负值为错误
    * @param errmsg 默认为空
    * @param kind 默认json ,string,jsondt(JSON表)
    */
    _setBack(res, errmsg, kind = "") {
        const up = this.up;
        up.backtype = kind || "string";
        up.res = res || 0;
        up.errmsg = errmsg || "";
    }
    out(method) {
        const self = this;
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            if (typeof self[method] !== 'function') {
                resolve('apifun not find:' + method);
                return;
            }
            let back;
            const up = self.up;
            //防止网络重放攻击
            //调用的是M方法 5秒内CACHE值相同 API地址相同不允许
            if (up.v >= 17.2) {
                if (method.charAt(0) == "m") { //&& up.ip!="127.0.0.1"
                    back = yield self.memcache.get(up.ctx.request.path + up.cache);
                    if (back) {
                        back = "err:防止重放攻击" + up.ctx.request.path + up.cache;
                        up.res = -8887;
                        up.errmsg = back;
                        resolve(back);
                        return;
                    }
                    self.memcache.set(up.ctx.request.path + up.cache, 1, 2);
                }
            }
            try {
                //不建议reject 可以设置res=-N来返回预期的错误
                back = yield self[method]();
            }
            catch (e) {
                up.errmsg = e.message;
                //这里记录错误
                back = JSON.stringify(e);
                up.res = -8888;
                console.log("doing err log3:" + Util.inspect(e));
            }
            try {
                if (back == null)
                    back = "";
                if (self.up.backtype == "json") {
                    back = JSON.stringify(back);
                }
                if (up.v >= 17.1) {
                    if (up.res == -8888)
                        up.backtype = "string";
                    if (back == "\"\"")
                        up.backtype = "string";
                    if (up.backtype == "string") {
                        if (!isNaN(back))
                            back = back.toString();
                        if (back.length >= 1 && back.substring(0, 1) != "\"")
                            back = "\"" + back + "\"";
                        if (back == "")
                            back = "\"\"";
                    }
                    if (up.ctx.request.method == "SOCK") {
                    }
                    else
                        back = "{\"res\":" + up.res + ",\"errmsg\":\""
                            + up.errmsg + "\",\"kind\":\"" + up.backtype + "\",\"back\":"
                            + back + "}";
                }
                if (self.up.jsonp) {
                    back = "_jqjsp({data:" + back + "})";
                }
                resolve(back);
                //ip记录                
                let sb;
                if (self.iplog) {
                    const tmp = yield self.memcache.get("sys_ip_" + up.uid + up.ip);
                    if (!tmp && up.uname != undefined) {
                        yield self.memcache.set("sys_ip_" + up.uid + up.ip, 1);
                        if (up.uid != "") {
                            sb = "insert into sys_ip(uid,ip, upby,uptime,id)"
                                + "values(?,?,?,?,?)";
                            yield self.mysql.doM(sb, [up.uid, up.ip, up.uname, up.utime, koa78_upinfo_1.default.getNewid()], up);
                        }
                    }
                }
                //耗时统计
                up.debug = false;
                const msec = new Date().getTime() - up.uptime.getTime();
                if (self.nodejslog && self.nodejslog["issave"]) {
                    if (self.nodejslog["redis"] && self.redis.host) {
                        //次数redis
                        yield self.redis.zincrby('Base7817_sysnodejs_frequency', 1, up.method);
                        //耗时redis
                        yield self.redis.zincrby('Base7817_sysnodejs_time_consuming', msec, up.method);
                        //上传redis
                        yield self.redis.zincrby('Base7817_sysnodejs_upload', up.pars.join(",").length, up.method);
                        //下载redis
                        yield self.redis.zincrby('Base7817_sysnodejs_download', back.length, up.method);
                    }
                    const values = ["api7817", up.apisys, up.apiobj, up.method, "1", msec, up.pars.join(",").length, back.length, up.utime, koa78_upinfo_1.default.getNewid(),
                        msec, up.pars.join(",").length, back.length];
                    sb = "insert into sys_nodejs(apiv,apisys,apiobj, method,num,dlong,uplen,downlen,uptime,id)" +
                        "values(?,?,?,?,?,?,?,?,?,?)ON DUPLICATE KEY UPDATE num=num+1,dlong=dlong+?,uplen=uplen+?,downlen=downlen+?";
                    yield self.mysql.doM(sb, values, up); // 
                }
            }
            catch (e) {
                e = Util.inspect(e);
                //这里记录错误
                //self.mysql._addWarn(up.uname + "--" + self.tbname + "--" + up.method + "--" + e, "err" + up.apisys, self.up);
                if (self.up.jsonp) {
                    e = "_jqjsp({data:" + e + "})";
                }
                resolve(e);
                //reject(e);
            }
        })).catch(function (e) {
            //这里打印非预期的错误
            console.log("out err " + Util.inspect(e));
            self.up.ctx.body = Util.inspect(e);
        });
    }
    /**
    * 获取自定义栏位
    */
    getCustomCols() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._upcheck(); // 错误会直接抛出
            let item = this.tbname + "_customfields"; // 直接使用 this
            if (this.up.pars.length >= 1 && this.up.pars[0] !== "")
                item += "_" + this.up.pars[0];
            let datatb;
            let values;
            if (this.uidcid === 'cid') {
                values = [this.up.cid, item];
                datatb = 'pars_co';
            }
            else {
                values = [this.up.uid, item];
                datatb = 'pars_users';
            }
            const sb = `SELECT data FROM ${datatb} WHERE ${this.uidcid}=? AND item=?`;
            const back = yield this.mysql.doGet(sb, values, this.up);
            if (back.length === 0)
                return '||||'; // 直接返回字符串
            else
                return back[0]['data']; // 直接返回字符串
        });
    }
    mysql1M(sb, values) {
        return this.mysql.doM(sb, values, this.up);
    }
    mysql1Get(sb, values) {
        return this.mysql.doGet(sb, values, this.up);
    }
}
exports.default = Base78;
//# sourceMappingURL=Base78.js.map