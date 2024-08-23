
var Util = require('util');

var request = require('request');
var iconv = require('iconv-lite');
//iconv.encodings = require("iconv-lite/encodings")
var urlencode = require('urlencode');

export default class Request78 {
    constructor( ) { 

    }

    doreq_multipart(url, data = "", headers = "", method = "", code = "") {
      code = code || "utf8";
      method = method || "POST";
  
      return new Promise((resolve, reject) => {
          try {
              request({
                  url: url,
                  method: method,
                  encoding: null,
                  headers: headers,
                  multipart: true,
                  formData: data
              }, function (e, r, body) {
                  if (e) {
                      reject(e);
                  } else {
                      const decodedBody = iconv.decode(body, code);
                      resolve(decodedBody);
                  }
              });
          } catch (err) {
              reject(err);
          }
      });
  }

  /**
 * 强自定义
 * @param url
 * @param code
 */
 doreq(url, data = {}, headers = "", method = "", code = "") {
  code = code || "utf8";
  method = method || "POST";

  return new Promise((resolve, reject) => {
      try {
          request({
              url: url,
              method: method,
              encoding: null,
              headers: headers,
              formData: data
          }, function (e, r, body) {
              if (e) {
                  reject(e);
              } else {
                  const decodedBody = iconv.decode(body, code);
                  resolve(decodedBody);
              }
          });
      } catch (err) {
          reject(err);
      }
  });
}
  /**
 * 直接用httpreq也行 简化GET方法这样也行
 * @param url
 * @param code
 * @returns {Promise<string>}
 */
 get(url, code = "") {
  code = code || "UTF-8";
  return new Promise((resolve, reject) => {
      var headers = {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.63 Safari/537.36'
      };
      try {
          request(
              {
                  method: 'GET',
                  headers: headers,
                  encoding: null,
                  uri: url,
                  timeout: 1500
              },
              function (error, response, body) {
                  var str = body;
                  try {
                      str = iconv.decode(body, code);
                  } catch (e) {
                      console.log(e);
                  }
                  if (error) {
                      reject(error);
                  } else {
                      resolve(str);
                  }
              }
          );
      } catch (err) {
          reject(err);
      }
  });
}

   /**
 * 简易调用方法
 * @param url
 * @param data
 * @param method
 * @param code
 * @returns {Promise<string>}
 */
 httpreq(url, data = "", method = "", code = "") {
  method = method || "POST";
  code = code || "utf8";

  return new Promise((resolve, reject) => {
      var headers = {
          'User-Agent': 'request',
          "charset": code
      };
      var post_body;
      try {
          post_body = urlencode.stringify(data, { charset: code });
      } catch (err) {
          post_body = data;
      }
      headers["Content-Type"] = 'application/x-www-form-urlencoded';

      try {
          request({
              url: url,
              method: method,
              encoding: null,
              headers: headers,
              body: post_body
          }, function (e, r, body) {
              if (e) {
                  reject(e);
              } else {
                  var body = iconv.decode(body, code);
                  resolve(body);
              }
          });
      } catch (err) {
          reject(err);
      }
  });
}
}