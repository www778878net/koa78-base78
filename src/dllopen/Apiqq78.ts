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
 * 提供基于PKCS7算法的加解密接口
 *
 */
const PKCS7Encoder:any = {};

/**
 * 删除解密后明文的补位字符
 *
 * @param {String} text 解密后的明文
 */
PKCS7Encoder.decode = function (text) {
    let pad = text[text.length - 1];

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
    const blockSize = 32;
    const textLength = text.length;
    //计算需要填充的位数
    const amountToPad = blockSize - (textLength % blockSize);

    const result = new Buffer(amountToPad);
    result.fill(amountToPad);

    return Buffer.concat([text, result]);
};

/**
 * @deprecated 独立出去 改await
 */
export default class Apiqq78 {
    _host: string;
    mch_id: string;
    mch_key: string;
    myuserid: string;
    memcache: MemCache78;
    apppayid: string;
    apppaySecrect: string;
    _appid: string;
    _secret: string;
    token: string;
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
        this.mch_id = config["mch_id"];
        this.mch_key = config["mch_key"];
        this.myuserid = config["myuserid"];
        this.memcache = memcache;
        this.apppayid = config["apppayid"];
        this.apppaySecrect = config["apppaySecrect"];
        this._appid = config["appid"];
        this._secret = config["secret"];
        this.token = config["token"];
        this._token = null;//token
        this._tokenout = dayjs().add(-1, 'day');//过期就要重新获取

        const AESKey = new Buffer(config["encodingAESKey"] + '=', 'base64');
        if (AESKey.length !== 32) {
            //console.log('encodingAESKey invalid');
            return
        }
        this.key = AESKey;
        this.iv = AESKey.slice(0, 16);
    } 
/**
 * 获取 JSAPI 临时权限签名
 */
getJsapiSignature(url) {
  const self = this;

  return new Promise((resolve, reject) => {
      self.getTicketJsapi().then(jsapiTicket => {
          const nonceStr = Math.random().toString(32).substr(2);
          const time = new Date().getTime().toString().slice(0, 10);
          const tmpStr = `jsapi_ticket=${jsapiTicket}&noncestr=${nonceStr}&timestamp=${time}&url=${url}`;

          const shasum = crypto.createHash('sha1');
          shasum.update(tmpStr);
          const sign = shasum.digest('hex');

          const back = {
              timestamp: time,
              nonceStr: nonceStr,
              signature: sign
          };

          resolve(back);
      }).catch(error => {
          reject(error);
      });
  });
}

/**
 * 获取 JSAPI Ticket
 */
getTicketJsapi() {
  const self = this;
  const memJsapiTicket = "apiqq78_getTicket_jsapi4";

  return new Promise((resolve, reject) => {
      self.memcache.get(memJsapiTicket).then(back => {
          if (back) {
              resolve(back);
              return;
          }

          self.getToken().then(token => {
              const url = `https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=${token}&type=jsapi`;

              new Request78().httpreq(url, "")
                  .then(response => {
                      const back = JSON.parse((response as string));
                      const errcode = back.errcode;

                      if (errcode > 0) {
                          reject(new Error(`Error getting ticket: ${back.errmsg}`));
                      } else {
                          const ticket = back.ticket;
                          self.memcache.set(memJsapiTicket, ticket, 7100);
                          resolve(ticket);
                      }
                  })
                  .catch(error => {
                      reject(error);
                  });
          }).catch(error => {
              reject(error);
          });
      }).catch(error => {
          reject(error);
      });
  });
}
 
 

 
    /**
     *   获取用户是否关注公众号的url
     */
    getUnionID    (openid) {
        const self = this;
        const access_token = self.getToken();
        const url = 'https://api.weixin.qq.com/cgi-bin/user/info?access_token=' + access_token
            + '&openid=' + openid + '&lang=zh_CN';
        return url;
    } 

 
 
 /**
 * 获取微信 Token
 */
getToken() {
  const self = this;
  const tokensec = 600; // TOKEN 改为 10 分钟试下

  return new Promise((resolve, reject) => {
      if (self._tokenout > new Date()) {
          resolve(self._token);
          console.log("weixintoken1:" + self._token);
          return;
      }

      self.memcache.get(mem_weixin_token).then(back => {
          if (!back) {
              self.memcache.set(mem_weixin_token, "", tokensec);
              const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${self._appid}&secret=${self._secret}`;
              new Request78().get(url)
                  .then(response => {
                      const back = eval('(' + response + ')');
                      self._token = back.access_token;
                      if (!self._token) {
                          console.log("weixintoken err:", response);
                      }
                      self._tokenout = dayjs().add(tokensec, 'second');
                      self.memcache.set(mem_weixin_token, (response as string | number), tokensec);
                      resolve(self._token);
                  })
                  .catch(error => {
                      console.log("weixintokenerr:", error);
                      reject(error);
                  });
          } else {
                back = eval('(' + back + ')');
              self._token = back.access_token;
              if (!self._token) {
                  console.log("weixintoken err:", back);
              }
              self._tokenout = dayjs().add(tokensec, 'second');
              resolve(self._token);
          }
      }).catch(error => {
          console.log("weixintokenerr:", error);
          reject(error);
      });
  });
}

    /**
     * 得到消息 立即回复组织xml
     */
    getMesBack  (ToUserName, Content) {
        const data = {};
        data["ToUserName"] = ToUserName;
        data["FromUserName"] = this.myuserid;
        data["CreateTime"] = new Date().getTime().toString();
        data["MsgType"] = "text";
        data["Content"] = Content;

        return this._buildXml(data);
    }


     _buildXml (data, root="") {
        const items:any = [];
        root = root || "xml";
        items.push('<' + root + '>');
        for (const key in data) {
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

    /**
     * 验证是否微信发来的
     * @param timestamp
     * @param nonce
     * @param encrypt
     */
    getSignature  (timestamp, nonce) {
        const shasum = crypto.createHash('sha1');
        const arr = [this.token, timestamp, nonce].sort();
        shasum.update(arr.join(''));
        return shasum.digest('hex');
    }


    /**
     * 对明文进行加密(这个不行)
     *
     * @param {String} text 待加密的明文
     */
    encrypt   (text) {
        // 算法：AES_Encrypt[random(16B) + msg_len(4B) + msg + $CorpID]
        // 获取16B的随机字符串
        const randomString = crypto.pseudoRandomBytes(16);

        const msg = new Buffer(text);

        // 获取4B的内容长度的网络字节序
        const msgLength = new Buffer(4);
        msgLength.writeUInt32BE(msg.length, 0);

        const id = new Buffer(this._appid);


        const bufMsg = Buffer.concat([randomString, msgLength, msg, id]);

        // 对明文进行补位操作
        const encoded = PKCS7Encoder.encode(bufMsg);

        // 创建加密对象，AES采用CBC模式，数据采用PKCS#7填充；IV初始向量大小为16字节，取AESKey前16字节
        const cipher = crypto.createCipheriv('aes-256-cbc', this.key, this.iv);
        cipher.setAutoPadding(false);

        const cipheredMsg = Buffer.concat([cipher.update(encoded), cipher.final()]);

        // 返回加密数据的base64编码
        return cipheredMsg.toString('base64');
    }

    /**
     * 对密文进行解密
     *
     * @param {String} text 待解密的密文
     */
    decrypt   (text) {
        // 创建解密对象，AES采用CBC模式，数据采用PKCS#7填充；IV初始向量大小为16字节，取AESKey前16字节
        const decipher = crypto.createDecipheriv('aes-256-cbc', this.key, this.iv);
        decipher.setAutoPadding(false);
        let deciphered = Buffer.concat([decipher.update(text, 'base64'), decipher.final()]);

        deciphered = PKCS7Encoder.decode(deciphered);
        // 算法：AES_Encrypt[random(16B) + msg_len(4B) + msg + $CorpID]
        // 去除16位随机数
        const content = deciphered.slice(16);
        const length = content.slice(0, 4).readUInt32BE(0);

        return {
            message: content.slice(4, length + 4).toString(),
            id: content.slice(length + 4).toString()
        };
    }

/**
 * 使用 code 交换 token
 * @param {string} code - 从微信授权服务器获取的 code
 * @returns {Promise} - 返回包含 access_token 和其他相关信息的对象
 * @private
 */
_code2token(code) {
  const self = this;
  const url = `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${self._appid}&secret=${self._secret}&code=${code}&grant_type=authorization_code`;

  return new Promise((resolve, reject) => {
      new Request78().get(url)
          .then(response => {
              let getBack;
              try {
                  getBack = eval('(' + response + ')');
              } catch (e) {
                  getBack = response;
              }
              if (typeof getBack !== 'object') {
                  reject(new Error(`Invalid response format: ${response}`));
              } else {
                  resolve(getBack);
              }
          })
          .catch(error => {
              reject(error);
          });
  });
}

    /***
     * 获取菜单
     */
     getMenuModJson   () {
        const self = this;
        let host = "www.vrjmy.com"
        if (self._appid == "wxd357cfff189404a9") {
            host = "net.778878.net"
        }

        const menu = {};
        menu["button"] = [];
        let menu1 = {};
        const menu2 = {};
        const menu3 = {};
        let menu4 = {};
        const menu5 = {};
        const menu6 = {};
        const menu7 = {};
        const menu8 = {};
        const menu9 = {};
        const menu10 = {};
        const menu11 = {};
        const menu12 = {};
        const menu13 = {};
        const menu14 = {};
        const menu15 = {};
        menu1 = {};
        menu1["name"] = "VR艺术";
        menu1["sub_button"] = [];

        menu4 = {}
        menu4["name"] = "老用户找回";
        menu4["type"] = "view";
        menu4["url"] = "https://open.weixin.qq.com/connect/oauth2/authorize?appid=" + self._appid + "&redirect_uri=" +
            "http%3A%2F%2F" + host + "%2Fhtml17%2FmobilePage%2Fbinding.html&response_type=code&scope=snsapi_base&state=weixin#wechat_redirect";
        menu1["sub_button"].push(menu4);

       
        const str = JSON.stringify(menu);
        return str;

    }
 
}