import UpInfo from '@www778878net/koa78-upinfo'
import Mysql78 from '@www778878net/mysql78'
import Validate78 from "./Validate78";
import MemCache78 from "@www778878net/memcache78";
import Redis78 from '@www778878net/redis78';
import Apiqq78 from '../dllopen/Apiqq78';
import ApiWxSmall from '../dllopen/ApiWxSmall';
import * as iconv from 'iconv-lite';
import * as fs from 'fs';
//必须要带参数启动 不然就要报错 
let fspath = "";// = process.argv[3]
for (let i = 0; i < process.argv.length; i++) {
    if (process.argv[i] == "config") {
        fspath = process.argv[i + 1]
        break;
    }
}
const Config78 = loadjson(fspath);
function loadjson(filepath) {
    let data;
    try {
        const jsondata = iconv.decode(fs.readFileSync(filepath), "utf8");
        data = JSON.parse(jsondata);
    }
    catch (err) {
        console.log(err);
    }
    return data;
}

export default class Base78Amd {
    up: UpInfo;
    //运行时    
    Config: object = Config78;//config78
    nodejslog: object = Config78.nodejslog;//是否统计nodejs效率
    iplog: boolean = Config78.iplog;//是否统计访客IP
    location: string = Config78.location;//运行环境
    Argv: string[] = process.argv;//process.argv

    //各种连接
    static mysql782: Mysql78 = new Mysql78(Config78.mysql2);//支持多mysql
    static mysql781: Mysql78 = new Mysql78(Config78.mysql);//支持多mysql
    static memcache78: MemCache78 = new MemCache78(Config78.memcached);
    static redis78: Redis78 = new Redis78(Config78.redis);

    mysql2: Mysql78 = Base78Amd.mysql782;//支持多mysql
    mysql1: Mysql78 = Base78Amd.mysql781;//支持多mysql
    mysql: Mysql78 = Base78Amd.mysql781;//语法糖简化 默认mysql    
    memcache: MemCache78 = Base78Amd.memcache78;
    redis: Redis78 = Base78Amd.redis78;
    apiqq: Apiqq78 = new Apiqq78(Config78.apiqq, Base78Amd.memcache78); //公众号
    apiwxsmall: ApiWxSmall = new ApiWxSmall(Config78.apiwxsmall, Base78Amd.memcache78) //小程序
    //表相关属性
    tbname: string = "";
    cols: string[] = [];//所有列
    colsImp: string[] = [];//除remark外
    uidcid: string = "cid";//cid uid zid(都有可能) nid（都不用)
    colsremark: string[] = ["remark", "remark2", "remark3", "remark4", "remark5", "remark6"];//所有表都有的默认字段

    //常量：
    cidmy: string = "d4856531-e9d3-20f3-4c22-fe3c65fb009c";//管理员帐套
    cidguest: string = "GUEST000-8888-8888-8888-GUEST00GUEST";//测试帐套
    mem_sid: string = "lovers_sid3_";//保存用户N个ID 方便修改 千万不能改为lovers_sid_
    constructor(ctx) {
        this.up = new UpInfo(ctx);
        Config78.apiqq["host"] = Config78.host;
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
     * 自动判断修改还是新增 (自定义逻辑可重写覆盖此方法)
     * */
    m(): Promise<string> {
        return this._m();
    }

    /**
     * get方法
     * */
    get(): Promise<string> {
        return this._get();
    }

    del(): Promise<string> {
        return this._del();
    }



    /**
     * 权限检查(用户日期)
     */
    _vidateforuid(usefor): Promise<object> {
        const self = this;
        const up = self.up;
        return new Promise(async (resolve, reject) => {

            //await self._addWarn(usefor, "sys_sql", "services", "services_dinpay");
            let back;
            if (up.cid == self.cidmy) {
                back = {
                    code: 200
                }
                resolve(back);
                return;
            }
            //Config78.location == "test" &&
            if (up.cid == self.cidmy) {
                back = {
                    code: 200
                }
                resolve(back);
                return;
            }
            back = {
                code: -1
                , errback: up.cid
            }
            resolve(back);

        });
    }

    _del(): Promise<string> {
        const self = this;
        const up = self.up;
        return new Promise(async (resolve, reject) => {
            try {
                await this._upcheck();
            } catch (e) {
                reject(e);
                return;
            }

            const sb = "delete from  " + self.tbname + "   WHERE id=? and " + self.uidcid + "=? LIMIT 1";
            const values = [up.mid, up[self.uidcid]];
            let back: any = await self.mysql.doM(sb, values, up);

            if (back == 0) {
                back = "err:没有行被修改";

            }
            else {
                back = up.mid;

            }

            if (back == 1) back = up.mid;
            resolve(back);
        });
    }
    /**
     * 获取
     * @param where
     * @param colp
     */
    _get(where?: string, colp?: string[]): Promise<string> {
        const self = this;
        //colp = colp || this.cols;
        where = where || "";
        const up = self.up;
        return new Promise(async (resolve, reject) => {
            try {
                await this._upcheck();
            } catch (e) {
                reject(e);
                return;
            }
            const values = [up[self.uidcid]];
            colp = colp || up.cols;//修改列
            let iswhereauto = false;
            if (where == "") iswhereauto = true
            if (up.pars.length >= 1) {
                for (let i = 0; i < up.pars.length; i++) {
                    if (up.pars[i] != "") {
                        if (iswhereauto)
                            where += " and " + colp[i] + "=?";
                        values.push(up.pars[i]);
                    }
                }
            }

            let sb = 'SELECT `' + colp.join("`,`") + "`,id,upby,uptime,idpk FROM " + self.tbname
                + " WHERE " + self.uidcid + '=? ' + where;

            if (up.order !== "idpk")
                sb += '  order by ' + up.order;
            sb += ' limit ' + up.getstart + ',' + up.getnumber;

            //if (where !== '')
            //    values = values.concat(up.pars);
            const tb = await self.mysql.doGet(sb, values, up);
            resolve(tb);
        });
    }




    async _upcheck(): Promise<string> {
  const up = this.up;

  // 验证
  if (up.errmsg === "ok") {
    return "ok";
  }

  if (up.sid === '' || up.sid.length !== 36) {
    throw new Error(`${up.uname} sid err ${up.sid}`);
  }

  if (up.bcid.length === 36 && (up.bcid.indexOf("-") !== 8 || up.bcid.indexOf("-", 19) !== 23)) {
    throw new Error(`${up.uname} bcid err ${up.bcid}`);
  }

  if (up.mid === '' || up.mid.length !== 36) {
    throw new Error(`${up.method} mid err ${up.mid}`);
  }

  if (!Validate78.isNum(up.getstart) || !Validate78.isNum(up.getnumber)) {
    throw new Error('getstart or number err' + up.getstart + up.getnumber);
  }

  if (!up.inOrder(this.cols)) {
    throw new Error("up order err:" + up.order);
  }

  const checkColsResult = up.checkCols(this.cols);
  if (checkColsResult !== "checkcolsallok") {
    throw new Error("checkCols err:" + checkColsResult + JSON.stringify(up.cols));
  }

  if (up.cols.length === 1 && up.cols[0] === "all")
    up.cols = this.cols;

  // 数据库判断 获取用户信息
  let tmp = await this.memcache.tbget(this.mem_sid + up.sid, up.debug);

  if (tmp === "pool null") tmp = "";

  if (!tmp) {
    switch (Config78.location) {
      case "qq":
        throw new Error("err:get u info err html");
        break;
      default:
        const cmdtext = "select t1.*, companys.coname, companys.uid as idceo, companys.id as cid from (SELECT uname, id, upby, uptime, sid_web_date, idcodef, idpk FROM lovers WHERE sid=? OR sid_web=?) as t1 LEFT JOIN companysuser as t2 ON t2.uid=t1.id AND t2.cid=t1.idcodef LEFT JOIN companys ON t1.idcodef=companys.id";
        const values = [up.sid, up.sid];
        const result = await this.mysql.doGet(cmdtext, values, up);

        if (result.length === 0) tmp = "";
        else {
          tmp = result[0];
          this.memcache.tbset(this.mem_sid + up.sid, tmp);
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

    if (up.uname === "sysadmin")
      up.debug = true;

    up.bcid = up.bcid || up.cid;
    up.errmsg = "ok";

    return "ok";
  } else {
    throw new Error("err:get u info err3");
  }
}

    /**
     * 自动判断修改还是新增 
     * @param colp 自定义字段
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
                const sb = 'SELECT id FROM ' + self.tbname + ' where id=? ';
                let back: any = await self.mysql.doGet(sb, [up.mid], up);
                //console.log(back)
                if (back.length == 1)
                    back = await self._mUpdate(colp);
                else
                    back = await self._mAdd(colp);
                //console.log(back)
                if (back == 0) {

                    back = "err:没有行被修改";
                    if (up.v >= 17.1) {
                        up.res = -8888;
                        up.errmsg = "没有行被修改";
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
     *新增
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

            //应改为减字段而不是填充空（避免覆盖数据）
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

            let sb = "INSERT INTO " + self.tbname + "(`";
            sb += colp.join("`,`");
            sb += "`,id,upby,uptime," + self.uidcid + "  ) VALUES( ?,?,?,?";
            for (let i = 0; i < colp.length; i++) {
                sb += ",?";
            }
            sb += ")";
            const values = up.pars.slice(0, colp.length);
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
    * 修改
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
            //下版改为减字段而不是填充空（避免覆盖数据）
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
            let sb2 = "UPDATE  " + self.tbname + " SET ";
            sb2 += colp.join("=?,") + "=?,upby=?,uptime=? WHERE id=? and " + self.uidcid + "=? LIMIT 1";
            const values2 = up.pars.slice(0, colp.length);
            values2.push(up.uname);
            values2.push(up.utime);
            values2.push(up.mid);
            values2.push(up[self.uidcid]);

            let back = await self.mysql.doM(sb2, values2, up);
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

        });
    }
}
//Base78Amd.prototype.cidmy = "";
//Base78Amd.prototype.cidguest = "GUEST000-8888-8888-8888-GUEST00GUEST";
//Base78Amd.prototype.colsremark = ["remark", "remark2", "remark3", "remark4", "remark5", "remark6"];
//Base78Amd.prototype.Argv = process.argv;
//Base78Amd.prototype.Config = Config78;
//Base78Amd.prototype.mysql1 = new Mysql78(Config78.mysql);
//Base78Amd.prototype.mysql1 = new Mysql78(Config78.mysql);
//Base78Amd.prototype.mysql = Base78Amd.prototype.mysql1;
//Base78Amd.prototype.memcache = new MemCache78(Config78.memcached);
//Base78Amd.prototype.redis = new Redis78(Config78.redis);