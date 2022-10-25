import dayjs = require("dayjs");
import Base78 from "../dlldata/Base78";



export default class lovers extends Base78 {
    constructor(ctx: any) {

        super(ctx);
        //this.uidcid = "uid";
        this.tbname = "lovers";
         
        this.colsImp = [
            //用户名 密码 客户端鉴权
            "uname", "pwd", "sid",
            //网页端鉴权 网页端过期时间（暂未用）
            "sid_web", "sid_web_date", 
            //当前cid 
            "idcodef"
        ];
        this.cols = this.colsImp.concat(this.colsremark);
    }

    /**
   * 登录
   */
    login(): Promise<any> {
        const self = this;
        const up = self.up;
        const loginerr: string = "love_loginerr2_";
        return new Promise(async (resolve, reject) => {
            try {
                await this._upcheck();
            } catch (e) {
                //reject(e);
                //return;
            }

            var uname = up.pars[0].trim();
            var pwd = up.pars[1];

            let back: any = "";
            let love_loginerr = await self.memcache.get(loginerr + uname);
            if (love_loginerr >= 20) {
                reject("err:登录次失败,24小时后再试!" + love_loginerr);
                return;
            }
            var sb = 'SELECT pwd ,uname, coname, sid_web, idcodef   FROM lovers LEFT OUTER JOIN      companys ON lovers.idcodef = companys.id ' +
                'where  uname=? ';
            let sid = up.getNewid();
            let tb = await self.mysql1.doGet(sb, [uname], up);
            let values: string[];
            if (tb.length == 0) {
                ////新增用户
                //back = ['err:请先注册'];
                //resolve(back);
                if (uname.indexOf('sys') === 0) {
                    reject('err:新用户不允许以sys开头!请重新输入用户名!');
                    return;
                }
                var sb = " INSERT INTO  lovers  (cid, uname,pwd,sid,sid_web,sid_web_date,id,upby,uptime,idcodef) SELECT ?,?,?,?,?,?,?,?,?,?";
                values = ["",uname, pwd, sid, sid, dayjs().add(7, 'day').format('YYYY-MM-DD HH:mm:ss'), sid, uname, up.utime, self.cidguest];
                back = await self.mysql1.doM(sb, values, up);

                sb = 'SELECT pwd ,uname, coname, sid_web, idcodef   FROM lovers LEFT OUTER JOIN      companys ON lovers.idcodef = companys.id ' +
                    'where  uname=? '; 
                let tb = await self.mysql1.doGet(sb, [uname], up);
                back = tb[0]
                resolve(back);
                return;
            } else {
                let result = tb[0];
           
                if (pwd !== result["pwd"]) {
                    back = ['err:用户名密码不正确', '用户名密码不正确'];
                    if (uname != "guest") {
                        if (!love_loginerr)
                            self.memcache.set(loginerr + uname, 1, 14400);
                        else
                            self.memcache.incr(loginerr + uname);
                    }
                    resolve(back);
                    return;
                } else {
                    self.memcache.del(loginerr + uname);
                }

                if (result["idcodef"] === null) {
                    result["idcodef"] = self.cidguest;
                    result["coname"] = "测试帐套-可进入基础数据建立帐套";
                }
                if (uname == 'guest') {
                    sid = 'GUEST888-8888-8888-8888-GUEST88GUEST';
                } else if (uname == "syssc" || uname == 'testfz') {
                    sid = result["sid_web"];
                } else {
                    self.memcache.del(self.mem_sid + result["sid_web"]);
                    sb = 'UPDATE lovers SET sid_web=?,sid_web_date=?,uptime=? WHERE uname=?';
                    values = [sid, dayjs().add(7, 'day').format('YYYY-MM-DD HH:mm:ss'), up.utime, uname];
                    self.mysql.doM(sb, values, up);
                }
          
                result["sid_web"] = sid
                back = result
          
                resolve(back);
            }


        });
    }

    /**
  * 注册获取短信验证码
   * 同个号码5分钟发一次
   * 同个IP也是
  */
    getMobileVzReg(): Promise<any> {

        const self = this;
        const up = self.up;

        return new Promise(async (resolve, reject) => {
            try {
                await this._upcheck();
            } catch (e) {
                reject(e);
                return;
            }
            let mobile = up.pars[0];
            //5分钟发一次
            let tmp = await self.memcache.get(self.tbname + "getvz2" + mobile);
            if (tmp) {
                resolve("err:短信有延迟 请稍等 3分钟才允许验证一次!");
                return;
            }
            await self.memcache.set(self.tbname + "getvz2" + mobile, 1, 180);
            //同个IP1分钟一次防刷
            tmp = await self.memcache.get(self.tbname + "getvz" + up.ip);
            if (tmp) {
                resolve("err:短信有延迟 请稍等 1分钟才允许验证一次!");
                return;
            }
            await self.memcache.set(self.tbname + "getvz" + up.ip, 1, 60);


            //一个随机验证码
            //后续验证验证码对不对
            let sjnum = Math.floor(Math.random() * 1000000);
            //await self._addWarn("getMobileVzReg:" + sjnum, "lovers", "lovers", "lovers");
            await self.memcache.set(self.tbname + "mobileyz" + mobile, sjnum);

            let back=sjnum

            //暂时没有接短信服务 直接返回先 后面要处理
            //let sb = 'insert into `services_mes_sms` (`uid`,`uname`,`mid`,`ddate`,tou,template,content,`upby`,`uptime`,`id`) ' +
            //    ' values(?,?,?,?,?,?,?,?,?,?)';
            //let back = await self.mysql.doM(sb, [up.uid, up.uname, "mobileyz"
            //    , up.utime, mobile, "SMS_168591175", "{\"code\":" + sjnum + "}", up.uname, up.utime, up.getNewid()], up);
            //back = "验证码已发出 请注意接收.";
    
            resolve(back);
        });
    }

 
    /**
    * 注册
    */
    reg(): Promise<any> {
        //老用户绑定微信只需要用户名 密码 微信OPENID
        //新用户注册都需要
        const self = this;
        const up = self.up;

        return new Promise(async (resolve, reject) => {
            try {
                await this._upcheck();
            } catch (e) {
                //reject(e);
                //return;
            }
            let uname = up.pars[0].trim();
            let pwd = up.pars[1];
            let qq = up.pars[2];
            let mobile = up.pars[3];
            let openwx = up.pars[4];
            let truename = up.pars[5];
            let mobilevz = up.pars[6];

            if (truename == "") truename = uname;
            if (openwx == null || openwx == "openwx") openwx = "";

            //验证码有没 是否和手机对应
            let sjnum = await self.memcache.get(self.tbname + "mobileyz" + mobile);
            if (sjnum != mobilevz  ) {
                resolve('err:验证码不正确!请验证手机!');
                return;
            }

            let back: any = "";
            let sid = up.getNewid();
            let sb = 'SELECT pwd ,uname, coname, sid_web, idcodef,openweixin,lovers.idpk  FROM lovers LEFT OUTER JOIN      companys ON lovers.idcodef = companys.id ' +
                'where  uname=? ';
            let tb = await self.mysql.doGet(sb, [uname], up);

            if (tb.length == 0) {
                //新增用户
                if (uname.indexOf('sys') === 0) {
                    resolve('err:新用户不允许以sys开头!请重新输入用户名!');
                    return;
                }
                sb = " INSERT INTO  lovers  ( uname,pwd,sid,sid_web,"
                    + " sid_web_date, id, upby, uptime"
                    + "  , idcodef, mobile, qq, truename,openweixin,email) values(?, ?,?,?,?,?,?,?,?,?,?,?,?,?)";
                let values = [uname, pwd, sid, sid
                    , dayjs().add(7,'day').format('YYYY-MM-DD HH:mm:ss'), sid, uname, up.utime
                    , sid, mobile, qq, truename, openwx, qq + "@qq.com"];
                back = await self.mysql1.doMAdd(sb, values, up);
                if (back) {
                    //新用户直接新建帐套
                    var cidnew = sid;
                    sb = "INSERT INTO companys(uid,coname,id,upby,uptime)SELECT ?,?,?,?,?";
                    values = [cidnew, uname, cidnew, uname, up.utime];
                    self.mysql.doM(sb, values, up);
                    sb = "insert into companysuser (cid,uid,id,upby,uptime) SELECT ?,?,?,?,?";
                    values = [cidnew, cidnew, cidnew, uname, up.utime];
                    self.mysql.doM(sb, values, up);


                }
                sb = 'SELECT pwd ,uname, coname, sid_web, idcodef,openweixin,lovers.idpk  FROM lovers LEFT OUTER JOIN      companys ON lovers.idcodef = companys.id ' +
                    'where  uname=? ';
                tb = await self.mysql.doGet(sb, [uname], up);
                tb = tb[0]
                back = tb
                resolve(back);
            }
            else {
                resolve('err:用户名已被占用!请重新输入用户名!');
                return;
            }
        });
    }
}
