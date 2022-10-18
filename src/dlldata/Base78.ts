import Base78Amd from "./Base78Amd";
const Util = require('util');
/**
 * ���� ��Ҫ��չʾout�߼�  
 * */
export default  class Base78 extends Base78Amd {
    constructor(ctx: any) {
        super(ctx);
    }

    out(method: string): Promise<any> {
        const self = this;

        return new Promise(async (resolve, reject) => {
            if (typeof self[method] !== 'function') {
                resolve('apifun not find');
                return;
            }
            let back: any;
            const up = self.up;
            //��ֹ�����طŹ���
            //���õ���M���� 5����CACHEֵ��ͬ API��ַ��ͬ������
            if (up.v >= 17.2) {
                if (method.charAt(0) == "m") {//&& up.ip!="127.0.0.1"
                    //back = await self.memcache.get(up.ctx.request.path + up.cache);
                    //if (back) {

                    //    resolve("err:��ֹ�طŹ���" + up.ctx.request.path + up.cache);
                    //    return;
                    //}
                    //self.memcache.set(up.ctx.request.path + up.cache, 1, 5);
                }
            }

            try {
                //������reject ��������res=-N������Ԥ�ڵĴ���
                back = await self[method]();
            } catch (e) {
                //�����¼����
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
            } catch (e) {
                e = Util.inspect(e);
                //�����¼����
                //self.mysql._addWarn(up.uname + "--" + self.tbname + "--" + up.method + "--" + e, "err" + up.apisys, self.up);
                if (self.up.jsonp) {
                    e = "_jqjsp({data:" + e + "})";
                }
                resolve(e)
                //reject(e);
            }
        }).catch(function (e) {
            //�����ӡ��Ԥ�ڵĴ���
            console.log("out err " + Util.inspect(e));
            self.up.ctx.body = Util.inspect(e)
        });

    }

}