"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require('lodash');
/**
 * @deprecated 独立出去
 */
class Xml78old {
    constructor(xmlin) {
        this.xml = xmlin;
    }
    xmlBuild(data, root) {
        const items = [];
        items.push('<?xml version="1.0" encoding="utf-8"?>');
        items.push('<' + root + ' xmlns="http://mns.aliyuncs.com/doc/v1/">');
        for (const key in data) {
            if (data[key].length > 0) {
                items.push('<' + key + '>' + data[key] + '</' + key + '>');
            }
        }
        items.push('</' + root + '>');
        return items.join('');
    }
    _getOneTag(tag) {
        const xml = this.xml;
        const data = [];
        if (xml.indexOf('<' + tag + '>') !== -1) {
            const tree = xml.split('<' + tag + '>');
            _.each(tree, function (v) {
                if (v.indexOf('</' + tag + '>') !== -1) {
                    let item = (v.split('</' + tag + '>')[0]).trim();
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
}
exports.default = Xml78old;
//# sourceMappingURL=Xml78.js.map