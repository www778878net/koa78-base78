"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require('lodash');
class Xml78 {
    constructor(xmlin) {
        this.xml = xmlin;
    }
    xmlBuild(data, root) {
        var items = [];
        items.push('<?xml version="1.0" encoding="utf-8"?>');
        items.push('<' + root + ' xmlns="http://mns.aliyuncs.com/doc/v1/">');
        for (var key in data) {
            if (data[key].length > 0) {
                items.push('<' + key + '>' + data[key] + '</' + key + '>');
            }
        }
        items.push('</' + root + '>');
        return items.join('');
    }
    ;
    _getOneTag(tag) {
        var xml = this.xml;
        var data = [];
        if (xml.indexOf('<' + tag + '>') !== -1) {
            var tree = xml.split('<' + tag + '>');
            _.each(tree, function (v) {
                if (v.indexOf('</' + tag + '>') !== -1) {
                    var item = (v.split('</' + tag + '>')[0]).trim();
                    if (item.length > 0) {
                        if (item.indexOf("<![CDATA[") === 0)
                            item = item.substring(9, item.length - 3);
                        data.push(item);
                    }
                }
            });
        }
        if (data.length === 0) {
            return null;
        }
        return data;
    }
    ;
}
exports.default = Xml78;
//# sourceMappingURL=Xml78.js.map