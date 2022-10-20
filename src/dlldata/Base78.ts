﻿import Base78Amd from "./Base78Amd";
const Util = require('util');
/**
 * 基类 主要是展示out逻辑  
 * */
export default  class Base78 extends Base78Amd {
    constructor(ctx: any) {
        super(ctx);
    }

    out(method: string): Promise<any> {
        const self = this;

        return new Promise(async (resolve, reject) => {
            if (typeof self[method] !== 'function') {
                resolve('apifun not find:' + method);
                return;
            }
            let back: any;
            const up = self.up;
            //防止网络重放攻击
            //调用的是M方法 5秒内CACHE值相同 API地址相同不允许
            if (up.v >= 17.2) {
                if (method.charAt(0) == "m") {//&& up.ip!="127.0.0.1"
                    back = await self.memcache.get(up.ctx.request.path + up.cache);
                    if (back) { 
                        resolve("err:防止重放攻击" + up.ctx.request.path + up.cache);
                        return;
                    }
                    self.memcache.set(up.ctx.request.path + up.cache, 1, 5);
                }
            }

            try {
                //不建议reject 可以设置res=-N来返回预期的错误
                back = await self[method]();
            } catch (e) {
                //这里记录错误
                console.log("doing err log3" + Util.inspect(e));
                back = e;
                up.res = -8888;
                up.errmsg = Util.inspect(e);
            };

            try {
                if (!isNaN(back)) back = back.toString();


                if (self.up.backtype == "json") {
                    back = JSON.stringify(back);
                }
                if (up.v >= 17.1) {
                    if (up.res == -8888) up.backtype = "string";
                    if (back == "\"\"") up.backtype = "string";
                    if (up.backtype == "string" && back.substring(0, 1) != "\"")
                        back = "\"" + back + "\"";
                    if (up.ctx.request.method == "SOCK") {
                        back = "{\"res\":" + up.res + ",\"errmsg\":\""
                            + up.errmsg + "\",\"kind\":\"" + up.backtype + "\",\"back\":"
                            + back + ",\"path\":\"" + up.ctx["request"]["path"]
                            + "\",\"backpar\":\"" + up.ctx["request"]["backpar"]
                            + "\"}";

                    } else
                        back = "{\"res\":" + up.res + ",\"errmsg\":\""
                            + up.errmsg + "\",\"kind\":\"" + up.backtype + "\",\"back\":"
                            + back + "}"



                }

                if (self.up.jsonp) {
                    back = "_jqjsp({data:" + back + "})";
                }

                resolve(back);
                //ip记录                

                let sb;
                let tmp = await self.memcache.get("sys_ip_" + up.uid + up.ip);
                if (!tmp && up.uname != undefined) {
                    await self.memcache.set("sys_ip_" + up.uid + up.ip, 1);

                    let obj: any = {
                        uid: up.uid,
                        ip: up.ip
                    };
                    obj = JSON.stringify(obj);
                    if (up.uid != "") {
                        //await self.redis.setlpush('Base7817_sys_ip', obj);
                        sb = "insert into sys_ip(uid,ip, upby,uptime,id)"
                            + "values(?,?,?,?,?)";
                        await self.mysql.doM(sb, [up.uid, up.ip, up.uname, up.utime, up.getNewid()], up);
                    }
                }

                //耗时统计
                up.debug = false;
                let msec = new Date().getTime() - up.uptime.getTime();

                ////次数redis
                //await self.redis.zincrby('Base7817_sysnodejs_frequency', 1, up.method);
                ////耗时redis
                //await self.redis.zincrby('Base7817_sysnodejs_time_consuming', msec, up.method);

                ////上传redis
                //await self.redis.zincrby('Base7817_sysnodejs_upload', up.pars.join(",").length, up.method);

                ////下载redis
                //await self.redis.zincrby('Base7817_sysnodejs_download', back.length, up.method);


                let values = ["api7817",up.apisys,up.apiobj,  up.method, "1", msec, up.pars.join(",").length, back.length, up.utime, up.getNewid()
                    , msec, up.pars.join(",").length, back.length];
                sb = "insert into sys_nodejs(apiv,apisys,apiobj, method,num,dlong,uplen,downlen,uptime,id)" +
                    "values(?,?,?,?,?,?,?,?,?,?)ON DUPLICATE KEY UPDATE num=num+1,dlong=dlong+?,uplen=uplen+?,downlen=downlen+?";
                await self.mysql1.doM(sb, values, up);// 

            } catch (e) {
                e = Util.inspect(e);
                //这里记录错误
                //self.mysql._addWarn(up.uname + "--" + self.tbname + "--" + up.method + "--" + e, "err" + up.apisys, self.up);
                if (self.up.jsonp) {
                    e = "_jqjsp({data:" + e + "})";
                }
                resolve(e)
                //reject(e);
            }
        }).catch(function (e) {
            //这里打印非预期的错误
            console.log("out err " + Util.inspect(e));
            self.up.ctx.body = Util.inspect(e)
        });

    }

}