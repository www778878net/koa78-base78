"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Util = require('util');
const md5 = require("md5");
const crypto = require('crypto');
const Request78_1 = require("../dll78/Request78");
const mem_weixin_token = "Apiqq78_weixin_token";
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
     * @returns {Promise<string>}
     */
    code2Session(code) {
        const url = "https://api.weixin.qq.com/sns/jscode2session?appid=" +
            this._appid + "&secret=" + this._secret + "&js_code=" + code + "&grant_type=authorization_code";
        return new Request78_1.default().get(url).then(function (back) {
            return back;
        });
    }
}
exports.default = ApiWxSmall;
//# sourceMappingURL=ApiWxSmall.js.map