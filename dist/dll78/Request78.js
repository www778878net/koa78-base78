"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Util = require('util');
var Q = require('q');
var request = require('request');
var iconv = require('iconv-lite');
//iconv.encodings = require("iconv-lite/encodings")
var urlencode = require('urlencode');
class Request78 {
    constructor() {
    }
    doreq_multipart(url, data = "", headers = "", method = "", code = "") {
        code = code || "utf8";
        method = method || "POST";
        var def = Q.defer();
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
                    def.reject(e);
                }
                else {
                    var body = iconv.decode(body, code);
                    def.resolve(body);
                }
            });
        }
        catch (err) {
            def.reject(err);
        }
        return def.promise;
    }
    ;
    /**
    * ǿ�Զ���
    * @param url
    * @param code
    */
    doreq(url, data = {}, headers = "", method = "", code = "") {
        code = code || "utf8";
        method = method || "POST";
        var def = Q.defer();
        try {
            request({
                url: url,
                method: method,
                encoding: null,
                headers: headers,
                formData: data
            }, function (e, r, body) {
                if (e) {
                    def.reject(e);
                }
                else {
                    var body = iconv.decode(body, code);
                    def.resolve(body);
                }
            });
        }
        catch (err) {
            def.reject(err);
        }
        return def.promise;
    }
    ;
    /**
     * ֱ����httpreqҲ�� ��GET��������Ҳ��
     * @param url
     * @param code
     * @returns {*}
     */
    get(url, code = "") {
        code = code || "UTF-8";
        var def = Q.defer();
        var headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.63 Safari/537.36'
        };
        try {
            request({
                method: 'GET', headers: headers, encoding: null,
                uri: url, timeout: 1500
            }, function (error, response, body) {
                var str = body;
                try {
                    str = iconv.decode(body, code);
                }
                catch (e) {
                    console.log(e);
                }
                def.resolve(str);
            });
        }
        catch (err) {
            def.reject(err);
        }
        return def.promise;
    }
    ;
    /**
     *���׵��÷���
     * @param filename
     * @param data
     * @returns {*}
     */
    httpreq(url, data = "", method = "", code = "") {
        method = method || "POST";
        code = code || "utf8";
        var def = Q.defer();
        var headers = {
            'User-Agent': 'request',
            "charset": code
        };
        var post_body;
        try {
            post_body = urlencode.stringify(data, { charset: code });
        }
        catch (err) {
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
                    def.reject(e);
                }
                else {
                    var body = iconv.decode(body, code);
                    def.resolve(body);
                }
            });
        }
        catch (err) {
            def.reject(err);
        }
        return def.promise;
    }
    ;
}
exports.default = Request78;
//# sourceMappingURL=Request78.js.map