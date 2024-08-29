const Util = require('util');
const md5 = require("md5");
const crypto = require('crypto');
import  Request78 from '../dll78/Request78';
import Validate78 from '../dlldata/Validate78';
import Xml78old from  '../dlldata/Xml78' ;
const mem_weixin_token = "Apiqq78_weixin_token";
import dayjs = require("dayjs");
import MemCache78 from "memcache78";
 
/**
 * @deprecated 独立出去
 */
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
 * @returns {Promise<string>}
 */
 code2Session(code) {
  const url = "https://api.weixin.qq.com/sns/jscode2session?appid=" +
      this._appid + "&secret=" + this._secret + "&js_code=" + code + "&grant_type=authorization_code";

  return new Request78().get(url).then(function (back) {
      return back;
  });
}
 
  
}