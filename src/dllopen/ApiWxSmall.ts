var Util = require('util');
var Q = require('q');
var md5 = require("md5");
var crypto = require('crypto');
import  Request78 from '../dll78/Request78';
import Validate78 from '../dlldata/Validate78';
import Xml78 from  '../dlldata/Xml78' ;
var mem_weixin_token = "Apiqq78_weixin_token";
import dayjs = require("dayjs");
import MemCache78 from "@www778878net/memcache78";
 

export default class ApiWxSmall {
    _host: string; 
 
    memcache: MemCache78; 
    _appid: string;
    _secret: string;
 
    _token: any;
    _tokenout: any;
    key: any;
    iv: any;

    constructor(config, memcache) {
        if (!config)
            config = {};
        //appid, secret, encodingAESKey, token, myuserid, memcache
        //, mch_id, mch_key, apppayid, apppaySecrect, host
        this._host = config["host"]; 
        this.memcache = memcache;
 
        this._appid = config["appid"];
        this._secret = config["secret"]; 
 
    }  

    /**
     * 小程序登录
     * @param code
     */
    code2Session(code) {
        //https://api.weixin.qq.com/sns/jscode2session?appid=APPID&secret=SECRET&js_code=JSCODE&grant_type=authorization_code
        var self = this;
        var def = Q.defer();
        var url = "https://api.weixin.qq.com/sns/jscode2session?appid=" +
            self._appid + "&secret=" + self._secret + "&js_code=" + code + "&grant_type=authorization_code";

        new Request78().get(url).then(function (back) {
            //var getback = eval("(" + back + ")");
            //if (getback == undefined)
            //    getback = back
            def.resolve(back);
        });
        return def.promise;
    }
 
  
}