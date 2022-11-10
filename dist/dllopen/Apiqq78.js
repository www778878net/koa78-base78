"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Util = require('util');
var Q = require('q');
var md5 = require("md5");
var crypto = require('crypto');
var Request78 = require('../dll78/Request78');
var Validate78 = require('../dlldata/Validate78');
var Xml78 = require('../dlldata/Xml78');
var mem_weixin_token = "Apiqq78_weixin_token";
const dayjs = require("dayjs");
/**
 * �ṩ����PKCS7�㷨�ļӽ��ܽӿ�
 *
 */
var PKCS7Encoder = {};
/**
 * ɾ�����ܺ����ĵĲ�λ�ַ�
 *
 * @param {String} text ���ܺ������
 */
PKCS7Encoder.decode = function (text) {
    var pad = text[text.length - 1];
    if (pad < 1 || pad > 32) {
        pad = 0;
    }
    return text.slice(0, text.length - pad);
};
/**
 * ����Ҫ���ܵ����Ľ�����䲹λ
 *
 * @param {String} text ��Ҫ������䲹λ����������
 */
PKCS7Encoder.encode = function (text) {
    var blockSize = 32;
    var textLength = text.length;
    //������Ҫ����λ��
    var amountToPad = blockSize - (textLength % blockSize);
    var result = new Buffer(amountToPad);
    result.fill(amountToPad);
    return Buffer.concat([text, result]);
};
class Apiqq78 {
    constructor(config, memcache) {
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
        this._tokenout = dayjs().add(-1, 'day'); //���ھ�Ҫ���»�ȡ
        var AESKey = new Buffer(config["encodingAESKey"] + '=', 'base64');
        if (AESKey.length !== 32) {
            console.log('encodingAESKey invalid');
            return;
        }
        this.key = AESKey;
        this.iv = AESKey.slice(0, 16);
    }
    /**
    *JSapi��ʱȨ��
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
    *JSspi��ȡTICKET_jsapi
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
                return new Request78().httpreq(url, "");
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
    * ��ȡ�ز��б�
    */
    getmaterial() {
        var self = this;
        var def = Q.defer();
        //���������� ��֪��Ϊʲô ֱ���ù���ȥ��
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
            new Request78().doreq(urls, formData).then(function (back) {
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
        new Request78().httpreq(urls, formData).then(function (back) {
            back = eval("(" + back + ")");
            def.resolve(back);
        });
        return def.promise;
    }
    /**
     * ΢��֧�� ����Ԥ������
     * out_trade_no ������
     * total_fee    �ܽ��
     * attach       services_dinpay���е�kind��infor
     * trade_type   ΢�Ž�������
     * describe     ��Ʒ����
     * openid       ΢���û���openid
     *
     */
    getprepay_id(out_trade_no, total_fee, attach, trade_type, describe, openid) {
        var self = this;
        var def = Q.defer();
        //if (describe == undefined) {
        //    describe = '��Ʒ����';
        //}
        var appid = self._appid;
        var urls = 'https://api.mch.weixin.qq.com/pay/unifiedorder';
        var mch_id = self.mch_id;
        var host = this._host;
        //else {
        //    //return{
        //    //    code: -1,
        //    //    errmsg:"��ʱ����֧�� ===ʧ��"
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
        new Request78().httpreq(urls, formData).then(function (back) {
            var obj = new Xml78(back);
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
     *   ��ȡ�û��Ƿ��ע���ںŵ�url
     */
    getUnionID(openid) {
        var self = this;
        var access_token = self.getToken();
        var url = 'https://api.weixin.qq.com/cgi-bin/user/info?access_token=' + access_token
            + '&openid=' + openid + '&lang=zh_CN';
        return url;
    }
    /**
     *������ʱ��ά��
     */
    getTicket(scene_id, seconds) {
        //scene_id:1 �ƹ�
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
            return new Request78().httpreq("https://api.weixin.qq.com/cgi-bin/qrcode/create?access_token="
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
     * ����ģ����Ϣ
     */
    sendMesModel(openid, template_id, data, remark) {
        var self = this;
        if (Validate78.isNull(openid)) {
            return;
        }
        var memitem = 'Apiqq781_' + openid + "_" + template_id + remark;
        //24Сʱͬ��������ֻ��һ��
        self.memcache.get(memitem).then(function (dotime) {
            if (dotime !== null) {
                throw new Error("24Сʱ");
            }
            self.memcache.set(memitem, 1);
            /* return new parsusers()._getByOpenid(openid,"openweixin");
        }).then(function (back) {
            if(back.length===1&&back[0]["data"]==="off")
                throw new Error("�û�����΢�Ų�����");*/
            //����΢������
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
            return new Request78().httpreq("https://api.weixin.qq.com/cgi-bin/message/template/send?access_token="
                + self._token, str);
        }).then(function (back) {
            console.log("sendMesModel:" + back);
        }).catch(function (err) {
            if (err.message !== "24Сʱ")
                console.log(err);
        });
    }
    /**
     * ��ȡ΢��token
     *
     */
    getToken() {
        var self = this;
        var def = Q.defer();
        var savemem = false;
        var tokensec = 600; //TOKEN��Ϊ10��������
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
                    return new Request78().get(url);
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
     * �õ���Ϣ �����ظ���֯xml
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
     * ��֤�Ƿ�΢�ŷ�����
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
     * �����Ľ��м���(�������)
     *
     * @param {String} text �����ܵ�����
     */
    encrypt(text) {
        // �㷨��AES_Encrypt[random(16B) + msg_len(4B) + msg + $CorpID]
        // ��ȡ16B������ַ���
        var randomString = crypto.pseudoRandomBytes(16);
        var msg = new Buffer(text);
        // ��ȡ4B�����ݳ��ȵ������ֽ���
        var msgLength = new Buffer(4);
        msgLength.writeUInt32BE(msg.length, 0);
        var id = new Buffer(this._appid);
        var bufMsg = Buffer.concat([randomString, msgLength, msg, id]);
        // �����Ľ��в�λ����
        var encoded = PKCS7Encoder.encode(bufMsg);
        // �������ܶ���AES����CBCģʽ�����ݲ���PKCS#7��䣻IV��ʼ������СΪ16�ֽڣ�ȡAESKeyǰ16�ֽ�
        var cipher = crypto.createCipheriv('aes-256-cbc', this.key, this.iv);
        cipher.setAutoPadding(false);
        var cipheredMsg = Buffer.concat([cipher.update(encoded), cipher.final()]);
        // ���ؼ������ݵ�base64����
        return cipheredMsg.toString('base64');
    }
    ;
    /**
     * �����Ľ��н���
     *
     * @param {String} text �����ܵ�����
     */
    decrypt(text) {
        // �������ܶ���AES����CBCģʽ�����ݲ���PKCS#7��䣻IV��ʼ������СΪ16�ֽڣ�ȡAESKeyǰ16�ֽ�
        var decipher = crypto.createDecipheriv('aes-256-cbc', this.key, this.iv);
        decipher.setAutoPadding(false);
        var deciphered = Buffer.concat([decipher.update(text, 'base64'), decipher.final()]);
        deciphered = PKCS7Encoder.decode(deciphered);
        // �㷨��AES_Encrypt[random(16B) + msg_len(4B) + msg + $CorpID]
        // ȥ��16λ�����
        var content = deciphered.slice(16);
        var length = content.slice(0, 4).readUInt32BE(0);
        return {
            message: content.slice(4, length + 4).toString(),
            id: content.slice(length + 4).toString()
        };
    }
    ;
    /**
     * code��token
     * @param code
     * @returns {*}
     * @private
     */
    _code2token(code) {
        var self = this;
        var def = Q.defer();
        var url = "https://api.weixin.qq.com/sns/oauth2/access_token?appid=" +
            self._appid + "&secret=" + self._secret + "&code=" + code + "&grant_type=authorization_code";
        new Request78().get(url).then(function (back) {
            var getback = eval("(" + back + ")");
            if (getback == undefined)
                getback = back;
            def.resolve(getback);
        });
        return def.promise;
    }
    ;
    /***
     * ��ȡ�˵�
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
        menu1["name"] = "VR����";
        menu1["sub_button"] = [];
        menu4 = {};
        menu4["name"] = "���û��һ�";
        menu4["type"] = "view";
        menu4["url"] = "https://open.weixin.qq.com/connect/oauth2/authorize?appid=" + self._appid + "&redirect_uri=" +
            "http%3A%2F%2F" + host + "%2Fhtml17%2FmobilePage%2Fbinding.html&response_type=code&scope=snsapi_base&state=weixin#wechat_redirect";
        menu1["sub_button"].push(menu4);
        var str = JSON.stringify(menu);
        return str;
    }
    /***
     * �޸Ĳ˵�
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
        //menu1["name"] = "���ʻ";
        //menu1["sub_button"] = [];
        //menu4 = {}
        //menu4["name"] = "����ͷ��";
        //menu4["type"] = "click";
        //menu4["key"] = "V1001_TODAY_TOP";
        ////menu4["name"] = "����ͷ��";
        ////menu4["type"] = "view";
        ////menu4["url"] = "https://open.weixin.qq.com/connect/oauth2/authorize?appid=" + self._appid +"&redirect_uri=" +
        ////    "https%3A%2F%2F" + host + "%2Fhtml17%2FmobilePage%2Fdeveloping.html&response_type=code&scope=snsapi_base&state=weixin#wechat_redirect";
        //menu1["sub_button"].push(menu4);
        //menu["button"].push(menu1)
        menu2 = {};
        menu2["name"] = "�����ҳ";
        //menu2["sub_button"] = [];
        //menu6 = {}
        //menu6["name"] = "��ҵ����";
        menu2["type"] = "view";
        menu2["url"] = "https://open.weixin.qq.com/connect/oauth2/authorize?appid=" + self._appid + "&redirect_uri=" +
            "http%3A%2F%2F" + host + "%2Fhtml17%2Findex.html&response_type=code&scope=snsapi_base&state=weixin#wechat_redirect";
        //menu2["sub_button"].push(menu6);
        //menu7 = {}
        //menu7["name"] = "�����Ͱ�";
        //menu7["type"] = "view";
        //menu7["url"] = "https://open.weixin.qq.com/connect/oauth2/authorize?appid=" + self._appid + "&redirect_uri=" +
        //    "https%3A%2F%2F" + host + "%2Fhtml17%2FmobilePage%2Fexchange%2Findex.html&response_type=code&scope=snsapi_base&state=weixin#wechat_redirect";
        //menu2["sub_button"].push(menu7);
        //menu8 = {}
        //menu8["name"] = "����Ͷ��";
        //menu8["type"] = "view";
        //menu8["url"] = "https://open.weixin.qq.com/connect/oauth2/authorize?appid=" + self._appid +"&redirect_uri=" +
        //    "https%3A%2F%2F" + host + "%2Fhtml17%2FmobilePage%2Fdeveloping.html&response_type=code&scope=snsapi_base&state=weixin#wechat_redirect";
        //menu2["sub_button"].push(menu8);
        menu["button"].push(menu2);
        //menu3 = {};
        //menu3["name"] = "����";
        //menu3["sub_button"] = [];
        menu11 = {};
        menu11["name"] = "֪ʶ��";
        menu11["type"] = "view";
        menu11["url"] = "https://open.weixin.qq.com/connect/oauth2/authorize?appid=" + self._appid + "&redirect_uri=" +
            "http%3A%2F%2Ferp.778878.net&response_type=code&scope=snsapi_base&state=98ed9139-783d-be32-de55-b1bbe289abca#wechat_redirect";
        //menu3["sub_button"].push(menu11);
        //menu12 = {}
        //menu12["name"] = "��Ա��ļ";
        //menu12["type"] = "view";
        //menu12["url"] = "https://open.weixin.qq.com/connect/oauth2/authorize?appid=" + self._appid +"&redirect_uri=" +
        //    "https%3A%2F%2F" + host + "%2Fhtml17%2FmobilePage%2Fdeveloping.html&response_type=code&scope=snsapi_base&state=weixin#wechat_redirect";
        //menu3["sub_button"].push(menu12);
        //menu13 = {}
        //menu13["name"] = "��Ա�ֲ�";
        //menu13["type"] = "view";
        //menu13["url"] = "https://open.weixin.qq.com/connect/oauth2/authorize?appid=" + self._appid +"&redirect_uri=" +
        //    "https%3A%2F%2F" + host + "%2Fhtml17%2FmobilePage%2Fdeveloping.html&response_type=code&scope=snsapi_base&state=weixin#wechat_redirect";
        //menu3["sub_button"].push(menu13);
        //menu14 = {}
        //menu14["name"] = "APP����";
        //menu14["type"] = "view";
        //menu14["url"] = "https://open.weixin.qq.com/connect/oauth2/authorize?appid=" + self._appid +"&redirect_uri=" +
        //    "https%3A%2F%2F" + host + "%2Fhtml17%2FmobilePage%2Fdeveloping.html&response_type=code&scope=snsapi_base&state=weixin#wechat_redirect";
        //menu3["sub_button"].push(menu14);
        menu["button"].push(menu11);
        menu11 = {};
        menu11["name"] = "΢�ŵ�¼����";
        menu11["type"] = "view";
        menu11["url"] = "https://open.weixin.qq.com/connect/oauth2/authorize?appid=" + self._appid + "&redirect_uri=http%3A%2F%2F" +
            "erp.778878.net%2F%23%2F&response_type=code&scope=snsapi_base&state=weixin#wechat_redirect";
        menu["button"].push(menu11);
        var str = JSON.stringify(menu);
        var def = Q.defer();
        self.getToken().then(function (back) {
            return new Request78().httpreq("https://api.weixin.qq.com/cgi-bin/menu/create?access_token=" + back, str);
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