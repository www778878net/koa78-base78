"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Util = require('util');
var Q = require('q');
var md5 = require("md5");
var crypto = require('crypto');
const Request78_1 = require("../dll78/Request78");
var mem_weixin_token = "Apiqq78_weixin_token";
class ApiWxSmall {
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
        new Request78_1.default().get(url).then(function (back) {
            //var getback = eval("(" + back + ")");
            //if (getback == undefined)
            //    getback = back
            def.resolve(back);
        });
        return def.promise;
    }
}
exports.default = ApiWxSmall;
//# sourceMappingURL=ApiWxSmall.js.map