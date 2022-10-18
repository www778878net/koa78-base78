import UpInfo from '@www778878net/koa78-upinfo'
import Mysql78 from '@www778878net/mysql78'
import Validate78 from "./Validate78";
//import MemCache78 from "./MemCache78";
var iconv = require('iconv-lite');
var fs = require('fs');
var fspath = process.argv[3]
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

export default class Base78Amd {
    up: UpInfo;

    //��������
    mysql2: Mysql78 = new Mysql78(null);
    mysql1: Mysql78 = new Mysql78(null);
    mysql: Mysql78 = new Mysql78(null);
    //memcache: MemCache78;
    //���������
    tbname: string = "";
    cols: string[] = [];//������
    colsImp: string[] = [];//��remark��
    uidcid: string = "cid";//cid uid zid(���п���) nid��������)
    colsremark: string[] = [];//���б��е�Ĭ���ֶ�

    constructor(ctx: any) {
        this.up = new UpInfo(ctx);

    }

    mAdd(colp?: string[]): Promise<string> {
        // colp = colp || this.colsImp;
        //if (this.ismongo)
        //    return this._mAddMongo();
        return this._mAdd(colp);
    }

    mUpdate(colp?: string[]): Promise<string> {
        // colp = colp || this.colsImp;
        //if (this.ismongo)
        //    return this._mUpdateMongo();
        return this._mUpdate(colp);
    }

    /**
     * �Զ��ж��޸Ļ������� (�Զ����߼�����д���Ǵ˷���)
     * */
    m(): Promise<string> {
        return this._m();
    }


    _upcheck(): Promise<string> {
        let self = this;

        return new Promise(async (resolve, reject) => {
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
            if (!Validate78.isNum(up.getstart) || !Validate78.isNum(up.getnumber)) {
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
            let tmps = up.checkCols(self.cols)
            if (tmps != "checkcolsallok") {
                reject("checkCols err:" + tmps + JSON.stringify(up.cols));
                return;
            }

            if (up.cols.length === 1 && up.cols[0] === "all")
                up.cols = self.cols;


            //���ݿ��ж� ��ȡ�û���Ϣ

            let tmp =""// await self.memcache.tbget(self.mem_sid + up.sid, up.debug);

           
            let t;
            if (!tmp) {
                //console.log(up.sid + JSON.stringify(tmp));
                switch (Config78.location) {
                    case "qq"://�������http������֤�û�
                        reject("err:get u info err html");
                        break;
                    default:

                        var cmdtext = "select t1.* ,companys.coname,companys.uid as idceo,companys.id as cid  from    (SELECT uname,pwd,id,upby,uptime,sid_web_date,  " +
                            "  idcoDef,openweixin ,truename,mobile,idpk   FROM lovers Where sid=? or sid_web=?)as t1 LEFT JOIN `companysuser` as t2 on" +
                            " t2.uid=t1.id and t2.cid=t1.idcodef left join companys    on t1.idcodef=companys.id";
                        var values = [up.sid, up.sid];
                        t = await self.mysql.doGet(cmdtext, values, up);

                        if (t.length == 0) tmp = "";
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
                up.idpk = tmp["idpk"]
                up.mobile = tmp["mobile"];

            } else {

                reject("err:get u info err3");
                return;
            }
            up.bcid = up.bcid || up.cid;


    
            if (  up.uname == "test")
                up.debug = true;
         

            //await self._upcheck_debug();
        

            up.errmessage = "ok";

            resolve("ok");
        })
    }

    /**
     * �Զ��ж��޸Ļ������� 
     * @param colp �Զ����ֶ�
     */
    _m(colp?: string[]): Promise<string> {
        const self = this;

        const up = self.up;
        //if (up.v >= 18.2) {
        //    colp = colp || this.cols;
        //} else

        return new Promise(async (resolve, reject) => {
            try {
                await this._upcheck();
            } catch (e) {
                reject(e);
                return;
            }
            if (up.v >= 17.2) {
                colp = colp || up.cols;
            } else {
                colp = colp || this.colsImp;
            }
            try {
                var sb = 'SELECT id FROM ' + self.tbname + ' where id=? ';
                let back: any = await self.mysql.doGet(sb, [up.mid], up);
                //console.log(back)
                if (back.length == 1)
                    back = await self._mUpdate(colp);
                else
                    back = await self._mAdd(colp);
                //console.log(back)
                if (back == 0) {

                    back = "err:û���б��޸�";
                    if (up.v >= 17.1) {
                        up.res = -8888;
                        up.errmsg = "û���б��޸�";
                    }

                }
                else if (back == 1) back = up.mid;
                else back = "" + back;
                resolve(back)
            } catch (e) {
                reject(e);
                return;
            }


        });
    }

    /**
     *����
     * @param colp
     */
    _mAdd(colp?: string[]): Promise<any> {

        const self = this;
        const up = self.up;

        return new Promise(async (resolve, reject) => {
            try {
                await this._upcheck();
            } catch (e) {
                reject(e);
                return;
            }

            //Ӧ��Ϊ���ֶζ��������գ����⸲�����ݣ�
            if (up.v >= 17.2) {
                colp = colp || this.cols;
                if (up.pars.length < colp.length) {
                    colp = colp.slice(0, up.pars.length);
                }
            } else {
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


            let back = await self.mysql.doM(sb, values, up); 
            if (back == 1) back = up.mid;
            resolve(back);
        });
    }

    /**
    * �޸�
    * @param colp
    */
    _mUpdate(colp?: string[]): Promise<string> {

        const self = this;
        const up = self.up;
        return new Promise(async (resolve, reject) => {
            try {
                await this._upcheck();
            } catch (e) {
                reject(e);
                return;
            }
            //�°��Ϊ���ֶζ��������գ����⸲�����ݣ�
            if (up.v >= 17.2) {
                colp = colp || up.cols;
                if (up.pars.length < colp.length) {
                    colp = colp.slice(0, up.pars.length);
                }
            } else {
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

            let back = await self.mysql.doM(sb2, values2, up);
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

        });
    }
}

Base78Amd.prototype.mysql1 = new Mysql78(Config78.mysql);
Base78Amd.prototype.mysql = Base78Amd.prototype.mysql1;