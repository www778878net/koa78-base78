"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Util = require('util');
var Q = require('q');
var md5 = require("md5");
var crypto = require('crypto');
const Request78_1 = require("../dll78/Request78");
const Validate78_1 = require("../dlldata/Validate78");
const Xml78_1 = require("../dlldata/Xml78");
var mem_weixin_token = "Apiqq78_weixin_token";
const dayjs = require("dayjs");
/**
 * 提供基于PKCS7算法的加解密接口
 *
 */
var PKCS7Encoder = {};
/**
 * 删除解密后明文的补位字符
 *
 * @param {String} text 解密后的明文
 */
PKCS7Encoder.decode = function (text) {
    var pad = text[text.length - 1];
    if (pad < 1 || pad > 32) {
        pad = 0;
    }
    return text.slice(0, text.length - pad);
};
/**
 * 对需要加密的明文进行填充补位
 *
 * @param {String} text 需要进行填充补位操作的明文
 */
PKCS7Encoder.encode = function (text) {
    var blockSize = 32;
    var textLength = text.length;
    //计算需要填充的位数
    var amountToPad = blockSize - (textLength % blockSize);
    var result = new Buffer(amountToPad);
    result.fill(amountToPad);
    return Buffer.concat([text, result]);
};
class Apiqq78 {
    constructor(config, memcache) {
        if (!config)
            config = {};
        //appid, secret, encodingAESKey, token, myuserid, memcache
        //, mch_id, mch_key, apppayid, apppaySecrect, host
        this._host = config["host"];
        this.mch_id = config["mch_id"];
        this.mch_key = config["mch_key"];
        this.myuserid = config["myuserid"];
        this.memcache = memcache;
        this.apppayid = config["apppayid"];
        this.apppaySecrect = config["apppaySecrect"];
        this._appid = config["appid"];
        this._secret = config["secret"];
        this.token = config["token"];
        this._token = null; //token
        this._tokenout = dayjs().add(-1, 'day'); //过期就要重新获取
        var AESKey = new Buffer(config["encodingAESKey"] + '=', 'base64');
        if (AESKey.length !== 32) {
            console.log('encodingAESKey invalid');
            return;
        }
        this.key = AESKey;
        this.iv = AESKey.slice(0, 16);
    }
    /**
    *JSapi临时权限
    */
    getjsapi_signature(url) {
        var self = this;
        var def = Q.defer();
        self.getTicket_jsapi().then(function (jsapi_ticket) {
            var nonce_str = Math.random().toString(32).substr(2);
            var time = new Date().getTime().toString().slice(0, 10);
            var tmpstr = "jsapi_ticket=" + jsapi_ticket + "&noncestr="
                + nonce_str + "&timestamp=" + time + "&url=" + url;
            var shasum = crypto.createHash('sha1');
            shasum.update(tmpstr);
            var sign = shasum.digest('hex');
            var back = {
                timestamp: time,
                nonceStr: nonce_str,
                signature: sign
            };
            def.resolve(back);
        });
        return def.promise;
    }
    /**
    *JSspi获取TICKET_jsapi
    */
    getTicket_jsapi() {
        var self = this;
        var mem_jsapi_Ticket = "apiqq78_getTicket_jsapi4";
        var def = Q.defer();
        var savemem = false;
        self.memcache.get(mem_jsapi_Ticket).then(function (back) {
            if (back) {
                def.resolve(back);
                return def.promise;
            }
            self.getToken().then(function (token) {
                var url = "https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token="
                    + token + "&type=jsapi";
                return new Request78_1.default().httpreq(url, "");
            }).then(function (back) {
                back = JSON.parse(back);
                var errcode = back["errcode"];
                if (errcode > 0)
                    return "err";
                var ticket = back["ticket"];
                self.memcache.set(mem_jsapi_Ticket, ticket, 7100);
                def.resolve(ticket);
            });
        });
        return def.promise;
    }
    /**
    * 获取素材列表
    */
    getmaterial() {
        var self = this;
        var def = Q.defer();
        //不能这样调 不知道为什么 直接用工具去调
        var formData = {
            "type": "news",
            "offset": 0,
            "count": 20
        };
        // formData = JSON.stringify(formData)
        //console.log(formData)
        self.getToken().then(function (token) {
            var urls = "https://api.weixin.qq.com/cgi-bin/material/batchget_material?access_token="
                + token;
            new Request78_1.default().doreq(urls, formData).then(function (back) {
                console.log(back);
                back = eval("(" + back + ")");
                def.resolve(back);
            });
        });
        return def.promise;
    }
    /**
    *
    *
    */
    getuserinfo(token, openid) {
        var self = this;
        var def = Q.defer();
        var formData = "";
        var urls = "https://api.weixin.qq.com/sns/userinfo?access_token="
            + token + "&openid=" + openid + "&lang=zh_CN";
        new Request78_1.default().httpreq(urls, formData).then(function (back) {
            back = eval("(" + back + ")");
            def.resolve(back);
        });
        return def.promise;
    }
    /**
     * 微信支付 创建预定单号
     * out_trade_no 订单号
     * total_fee    总金额
     * attach       services_dinpay表中的kind和infor
     * trade_type   微信交易类型
     * describe     商品描述
     * openid       微信用户的openid
     *
     */
    getprepay_id(out_trade_no, total_fee, attach, trade_type, describe, openid) {
        var self = this;
        var def = Q.defer();
        //if (describe == undefined) {
        //    describe = '商品描述';
        //}
        var appid = self._appid;
        var urls = 'https://api.mch.weixin.qq.com/pay/unifiedorder';
        var mch_id = self.mch_id;
        var host = this._host;
        //else {
        //    //return{
        //    //    code: -1,
        //    //    errmsg:"暂时不许支付 ===失败"
        //    //};  
        //}
        var notify_url = host + '/apinet/services/services_dinpay/getWxBack';
        var nonce_str = Math.random().toString(32).substr(2);
        var spbill_create_ip = '127.0.0.1';
        var key = self.mch_key;
        var openidstr = '';
        if (trade_type != 'NATIVE') {
            openidstr = '&openid=' + openid;
        }
        var unifiedPayment = 'appid=' + appid + '&attach=' + attach + '&body='
            + describe + '&mch_id=' + mch_id + '&nonce_str='
            + nonce_str + '&notify_url=' + notify_url + openidstr
            + '&out_trade_no=' + out_trade_no + '&spbill_create_ip='
            + spbill_create_ip + '&total_fee=' + total_fee + '&trade_type='
            + trade_type + '&key=' + key;
        var sign = md5(unifiedPayment).toUpperCase();
        var data = {};
        data['appid'] = appid;
        data['attach'] = attach;
        data['body'] = describe;
        data['mch_id'] = mch_id;
        data['nonce_str'] = nonce_str;
        data['notify_url'] = notify_url;
        if (trade_type != 'NATIVE') {
            data['openid'] = openid;
        }
        data['out_trade_no'] = out_trade_no;
        data['total_fee'] = total_fee;
        data['trade_type'] = trade_type;
        data['spbill_create_ip'] = spbill_create_ip;
        data['sign'] = sign;
        var formData = '<xml>';
        formData += '<appid>' + appid + '</appid>';
        formData += '<attach>' + attach + '</attach>';
        formData += '<body>' + describe + '</body>';
        formData += '<mch_id>' + mch_id + '</mch_id>';
        formData += '<nonce_str>' + nonce_str + '</nonce_str>';
        formData += '<notify_url>' + notify_url + '</notify_url>';
        if (trade_type != 'NATIVE') {
            formData += '<openid>' + openid + '</openid>';
        }
        formData += '<out_trade_no>' + out_trade_no + '</out_trade_no>';
        formData += '<total_fee>' + total_fee + '</total_fee>';
        formData += '<trade_type>' + trade_type + '</trade_type>';
        formData += '<spbill_create_ip>' + spbill_create_ip + '</spbill_create_ip>';
        formData += '<sign>' + sign + '</sign>';
        formData += '</xml>';
        //var formData = this._buildXml(data);
        new Request78_1.default().httpreq(urls, formData).then(function (back) {
            var obj = new Xml78_1.default(back);
            var result_code = obj._getOneTag("result_code") == undefined ? '' : obj._getOneTag("result_code")[0];
            var return_code = obj._getOneTag("return_code") == undefined ? '' : obj._getOneTag("return_code")[0];
            var return_msg = obj._getOneTag("return_msg") == undefined ? '' : obj._getOneTag("return_msg")[0];
            var err_code_des = obj._getOneTag("err_code_des") == undefined ? '' : obj._getOneTag("err_code_des")[0];
            var err = {};
            if (return_msg != '') {
                err['err'] = return_msg;
            }
            if (err_code_des != '') {
                err['errmsg'] = err_code_des;
            }
            if (result_code != '' && result_code == 'FAIL') {
                err['code'] = -1;
                def.resolve(err);
            }
            if (return_code != '' && return_code == 'FAIL') {
                err['code'] = -1;
                def.resolve(err);
            }
            if (trade_type == 'NATIVE') {
                var code_url = obj._getOneTag("code_url")[0];
                def.resolve(code_url);
            }
            var prepay_id = obj._getOneTag("prepay_id")[0];
            var note = Math.random().toString(32).substr(2);
            var time = new Date().getTime().toString().slice(0, 10);
            var str = 'appId=' + appid + '&nonceStr=' + note + '&package=prepay_id='
                + prepay_id + '&signType=MD5&timeStamp=' + time + "&key=" + key;
            var pagekage = md5(str).toUpperCase();
            var json = '{"paySign":"' + pagekage + '","prepay_id":"'
                + prepay_id + '","out_trade_no":"' + out_trade_no
                + '","appid":"' + appid + '","nonceStr":"' + note + '",'
                + '"timestamp":"' + time + '"}';
            def.resolve(json);
        });
        return def.promise;
    }
    /**
     *   获取用户是否关注公众号的url
     */
    getUnionID(openid) {
        var self = this;
        var access_token = self.getToken();
        var url = 'https://api.weixin.qq.com/cgi-bin/user/info?access_token=' + access_token
            + '&openid=' + openid + '&lang=zh_CN';
        return url;
    }
    /**
     *创建临时二维码
     */
    getTicket(scene_id, seconds) {
        //scene_id:1 推广
        var self = this;
        var sec = seconds || 2592000;
        var def = Q.defer();
        self.getToken().then(function (back) {
            var postdata = {};
            postdata["expire_seconds"] = sec;
            postdata["action_name"] = "QR_SCENE";
            postdata["action_info"] = { "scene": { "scene_id": scene_id } };
            var str = JSON.stringify(postdata);
            //{"expire_seconds": 604800, "action_name": "QR_SCENE", "action_info": {"scene": {"scene_id": 123}}};
            return new Request78_1.default().httpreq("https://api.weixin.qq.com/cgi-bin/qrcode/create?access_token="
                + self._token, str);
        }).then(function (back) {
            back = JSON.parse(back);
            switch (back["errcode"]) {
                case 42001:
                case 40001:
                    self.memcache.set(mem_weixin_token, "", 7000);
                    self._tokenout = dayjs().add(-1, 'day');
                    console.log("getTicket:new");
                    //self.getTicket
                    break;
            }
            /* if(back["errcode"]==42001){
                self.memcache.set(mem_weixin_token, "", 7000);
                self._tokenout=new Date().addDays(-1);
                console.log("getTicket:new");
            }*/
            def.resolve(back["ticket"]);
            //def.resolve(back["ticket"]);
        }).catch(function (err) {
            def.reject("Apiqq78.getTicket." + err.message);
        });
        return def.promise;
    }
    ;
    /**
     * 发送模板消息
     */
    sendMesModel(openid, template_id, data, remark) {
        var self = this;
        if (Validate78_1.default.isNull(openid)) {
            return;
        }
        var memitem = 'Apiqq781_' + openid + "_" + template_id + remark;
        //24小时同样的内容只发一次
        self.memcache.get(memitem).then(function (dotime) {
            if (dotime !== null) {
                throw new Error("24小时");
            }
            self.memcache.set(memitem, 1);
            /* return new parsusers()._getByOpenid(openid,"openweixin");
        }).then(function (back) {
            if(back.length===1&&back[0]["data"]==="off")
                throw new Error("用户设置微信不提醒");*/
            //发送微信提醒
            return self.getToken();
        }).then(function (back) {
            var postdata = {};
            postdata["touser"] = openid;
            postdata["template_id"] = template_id;
            postdata["url"] = "http://www.778878.net";
            var tmp = {};
            for (var key in data) {
                tmp[key] = {
                    "value": data[key],
                    "color": "#173177"
                };
            }
            postdata["data"] = tmp;
            var str = JSON.stringify(postdata);
            return new Request78_1.default().httpreq("https://api.weixin.qq.com/cgi-bin/message/template/send?access_token="
                + self._token, str);
        }).then(function (back) {
            console.log("sendMesModel:" + back);
        }).catch(function (err) {
            if (err.message !== "24小时")
                console.log(err);
        });
    }
    /**
     * 获取微信token
     *
     */
    getToken() {
        var self = this;
        var def = Q.defer();
        var savemem = false;
        var tokensec = 600; //TOKEN改为10分钟试下
        if (self._tokenout > new Date()) {
            def.resolve(self._token);
            console.log("weixintoken1:" + self._token);
        }
        else {
            self.memcache.get(mem_weixin_token).then(function (back) {
                if (!back) {
                    self.memcache.set(mem_weixin_token, "", tokensec);
                    savemem = true;
                    var url = "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=" +
                        self._appid + "&secret=" + self._secret;
                    return new Request78_1.default().get(url);
                }
                else
                    return back;
            }).then(function (backs) {
                if (backs === "") {
                    def.resolve(self._token);
                    return;
                }
                var back = eval("(" + backs + ")");
                self._token = back["access_token"];
                //console.log("weixintoken:" + self._token);
                if (!self._token) {
                    console.log("weixintoken err:" + backs);
                }
                self._tokenout = dayjs().add(tokensec, 'second');
                //console.log(self._tokenout)
                if (savemem) {
                    self.memcache.set(mem_weixin_token, backs, tokensec);
                }
                def.resolve(self._token);
            }).catch(function (err) {
                console.log("weixintokenerr:" + err);
            });
        }
        return def.promise;
    }
    ;
    /**
     * 得到消息 立即回复组织xml
     */
    getMesBack(ToUserName, Content) {
        var data = {};
        data["ToUserName"] = ToUserName;
        data["FromUserName"] = this.myuserid;
        data["CreateTime"] = new Date().getTime().toString();
        data["MsgType"] = "text";
        data["Content"] = Content;
        return this._buildXml(data);
    }
    ;
    _buildXml(data, root = "") {
        var items = [];
        root = root || "xml";
        items.push('<' + root + '>');
        for (var key in data) {
            if (data[key].length > 0) {
                if (key === "CreateTime")
                    items.push('<' + key + '>' + data[key] + '</' + key + '>');
                else
                    items.push('<' + key + '><![CDATA[' + data[key] + ']]></' + key + '>');
            }
        }
        items.push('</' + root + '>');
        return items.join('');
    }
    ;
    /**
     * 验证是否微信发来的
     * @param timestamp
     * @param nonce
     * @param encrypt
     */
    getSignature(timestamp, nonce) {
        var shasum = crypto.createHash('sha1');
        var arr = [this.token, timestamp, nonce].sort();
        shasum.update(arr.join(''));
        return shasum.digest('hex');
    }
    ;
    /**
     * 对明文进行加密(这个不行)
     *
     * @param {String} text 待加密的明文
     */
    encrypt(text) {
        // 算法：AES_Encrypt[random(16B) + msg_len(4B) + msg + $CorpID]
        // 获取16B的随机字符串
        var randomString = crypto.pseudoRandomBytes(16);
        var msg = new Buffer(text);
        // 获取4B的内容长度的网络字节序
        var msgLength = new Buffer(4);
        msgLength.writeUInt32BE(msg.length, 0);
        var id = new Buffer(this._appid);
        var bufMsg = Buffer.concat([randomString, msgLength, msg, id]);
        // 对明文进行补位操作
        var encoded = PKCS7Encoder.encode(bufMsg);
        // 创建加密对象，AES采用CBC模式，数据采用PKCS#7填充；IV初始向量大小为16字节，取AESKey前16字节
        var cipher = crypto.createCipheriv('aes-256-cbc', this.key, this.iv);
        cipher.setAutoPadding(false);
        var cipheredMsg = Buffer.concat([cipher.update(encoded), cipher.final()]);
        // 返回加密数据的base64编码
        return cipheredMsg.toString('base64');
    }
    ;
    /**
     * 对密文进行解密
     *
     * @param {String} text 待解密的密文
     */
    decrypt(text) {
        // 创建解密对象，AES采用CBC模式，数据采用PKCS#7填充；IV初始向量大小为16字节，取AESKey前16字节
        var decipher = crypto.createDecipheriv('aes-256-cbc', this.key, this.iv);
        decipher.setAutoPadding(false);
        var deciphered = Buffer.concat([decipher.update(text, 'base64'), decipher.final()]);
        deciphered = PKCS7Encoder.decode(deciphered);
        // 算法：AES_Encrypt[random(16B) + msg_len(4B) + msg + $CorpID]
        // 去除16位随机数
        var content = deciphered.slice(16);
        var length = content.slice(0, 4).readUInt32BE(0);
        return {
            message: content.slice(4, length + 4).toString(),
            id: content.slice(length + 4).toString()
        };
    }
    ;
    /**
     * code换token
     * @param code
     * @returns {*}
     * @private
     */
    _code2token(code) {
        var self = this;
        var def = Q.defer();
        var url = "https://api.weixin.qq.com/sns/oauth2/access_token?appid=" +
            self._appid + "&secret=" + self._secret + "&code=" + code + "&grant_type=authorization_code";
        new Request78_1.default().get(url).then(function (back) {
            var getback = eval("(" + back + ")");
            if (getback == undefined)
                getback = back;
            def.resolve(getback);
        });
        return def.promise;
    }
    ;
    /***
     * 获取菜单
     */
    getMenuModJson() {
        var self = this;
        var host = "www.vrjmy.com";
        if (self._appid == "wxd357cfff189404a9") {
            host = "net.778878.net";
        }
        var menu = {};
        menu["button"] = [];
        var menu1 = {};
        var menu2 = {};
        var menu3 = {};
        var menu4 = {};
        var menu5 = {};
        var menu6 = {};
        var menu7 = {};
        var menu8 = {};
        var menu9 = {};
        var menu10 = {};
        var menu11 = {};
        var menu12 = {};
        var menu13 = {};
        var menu14 = {};
        var menu15 = {};
        menu1 = {};
        menu1["name"] = "VR艺术";
        menu1["sub_button"] = [];
        menu4 = {};
        menu4["name"] = "老用户找回";
        menu4["type"] = "view";
        menu4["url"] = "https://open.weixin.qq.com/connect/oauth2/authorize?appid=" + self._appid + "&redirect_uri=" +
            "http%3A%2F%2F" + host + "%2Fhtml17%2FmobilePage%2Fbinding.html&response_type=code&scope=snsapi_base&state=weixin#wechat_redirect";
        menu1["sub_button"].push(menu4);
        var str = JSON.stringify(menu);
        return str;
    }
    /***
     * 修改菜单
     */
    menuMod() {
        var self = this;
        var host = self._host;
        var menu = {};
        menu["button"] = [];
        var menu1 = {};
        var menu2 = {};
        var menu3 = {};
        var menu4 = {};
        var menu5 = {};
        var menu6 = {};
        var menu7 = {};
        var menu8 = {};
        var menu9 = {};
        var menu10 = {};
        var menu11 = {};
        var menu12 = {};
        var menu13 = {};
        var menu14 = {};
        var menu15 = {};
        //menu1 = {};
        //menu1["name"] = "精彩活动";
        //menu1["sub_button"] = [];
        //menu4 = {}
        //menu4["name"] = "今日头牌";
        //menu4["type"] = "click";
        //menu4["key"] = "V1001_TODAY_TOP";
        ////menu4["name"] = "今日头牌";
        ////menu4["type"] = "view";
        ////menu4["url"] = "https://open.weixin.qq.com/connect/oauth2/authorize?appid=" + self._appid +"&redirect_uri=" +
        ////    "https%3A%2F%2F" + host + "%2Fhtml17%2FmobilePage%2Fdeveloping.html&response_type=code&scope=snsapi_base&state=weixin#wechat_redirect";
        //menu1["sub_button"].push(menu4);
        //menu["button"].push(menu1)
        menu2 = {};
        menu2["name"] = "轰叭首页";
        //menu2["sub_button"] = [];
        //menu6 = {}
        //menu6["name"] = "美业美购";
        menu2["type"] = "view";
        menu2["url"] = "https://open.weixin.qq.com/connect/oauth2/authorize?appid=" + self._appid + "&redirect_uri=" +
            "http%3A%2F%2F" + host + "%2Fhtml17%2Findex.html&response_type=code&scope=snsapi_base&state=weixin#wechat_redirect";
        //menu2["sub_button"].push(menu6);
        //menu7 = {}
        //menu7["name"] = "积分送吧";
        //menu7["type"] = "view";
        //menu7["url"] = "https://open.weixin.qq.com/connect/oauth2/authorize?appid=" + self._appid + "&redirect_uri=" +
        //    "https%3A%2F%2F" + host + "%2Fhtml17%2FmobilePage%2Fexchange%2Findex.html&response_type=code&scope=snsapi_base&state=weixin#wechat_redirect";
        //menu2["sub_button"].push(menu7);
        //menu8 = {}
        //menu8["name"] = "环球投资";
        //menu8["type"] = "view";
        //menu8["url"] = "https://open.weixin.qq.com/connect/oauth2/authorize?appid=" + self._appid +"&redirect_uri=" +
        //    "https%3A%2F%2F" + host + "%2Fhtml17%2FmobilePage%2Fdeveloping.html&response_type=code&scope=snsapi_base&state=weixin#wechat_redirect";
        //menu2["sub_button"].push(menu8);
        menu["button"].push(menu2);
        //menu3 = {};
        //menu3["name"] = "发布";
        //menu3["sub_button"] = [];
        menu11 = {};
        menu11["name"] = "知识库";
        menu11["type"] = "view";
        menu11["url"] = "https://open.weixin.qq.com/connect/oauth2/authorize?appid=" + self._appid + "&redirect_uri=" +
            "http%3A%2F%2Ferp.778878.net&response_type=code&scope=snsapi_base&state=98ed9139-783d-be32-de55-b1bbe289abca#wechat_redirect";
        //menu3["sub_button"].push(menu11);
        //menu12 = {}
        //menu12["name"] = "会员招募";
        //menu12["type"] = "view";
        //menu12["url"] = "https://open.weixin.qq.com/connect/oauth2/authorize?appid=" + self._appid +"&redirect_uri=" +
        //    "https%3A%2F%2F" + host + "%2Fhtml17%2FmobilePage%2Fdeveloping.html&response_type=code&scope=snsapi_base&state=weixin#wechat_redirect";
        //menu3["sub_button"].push(menu12);
        //menu13 = {}
        //menu13["name"] = "会员手册";
        //menu13["type"] = "view";
        //menu13["url"] = "https://open.weixin.qq.com/connect/oauth2/authorize?appid=" + self._appid +"&redirect_uri=" +
        //    "https%3A%2F%2F" + host + "%2Fhtml17%2FmobilePage%2Fdeveloping.html&response_type=code&scope=snsapi_base&state=weixin#wechat_redirect";
        //menu3["sub_button"].push(menu13);
        //menu14 = {}
        //menu14["name"] = "APP下载";
        //menu14["type"] = "view";
        //menu14["url"] = "https://open.weixin.qq.com/connect/oauth2/authorize?appid=" + self._appid +"&redirect_uri=" +
        //    "https%3A%2F%2F" + host + "%2Fhtml17%2FmobilePage%2Fdeveloping.html&response_type=code&scope=snsapi_base&state=weixin#wechat_redirect";
        //menu3["sub_button"].push(menu14);
        menu["button"].push(menu11);
        menu11 = {};
        menu11["name"] = "微信登录测试";
        menu11["type"] = "view";
        menu11["url"] = "https://open.weixin.qq.com/connect/oauth2/authorize?appid=" + self._appid + "&redirect_uri=http%3A%2F%2F" +
            "erp.778878.net%2F%23%2F&response_type=code&scope=snsapi_base&state=weixin#wechat_redirect";
        menu["button"].push(menu11);
        var str = JSON.stringify(menu);
        var def = Q.defer();
        self.getToken().then(function (back) {
            return new Request78_1.default().httpreq("https://api.weixin.qq.com/cgi-bin/menu/create?access_token=" + back, str);
        }).then(function (back) {
            def.resolve(back + str);
        }).catch(function (err) {
            def.resolve(str);
        });
        return def.promise;
    }
    ;
}
exports.default = Apiqq78;
//# sourceMappingURL=Apiqq78.js.map