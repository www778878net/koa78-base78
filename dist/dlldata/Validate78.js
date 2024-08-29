"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Util = require('util');
const validator = require("validator");
/**
 * @deprecated 直接用validator
 */
class Validate78 {
    static isEmail(str) {
        return validator.isEmail(str);
    }
    static isMobile(str) {
        return validator.isMobilePhone(str, 'zh-CN');
    }
    static isNull(str) {
        return validator.isNull(str);
    }
    static isNum(str) {
        return validator.isNumeric(str.toString()) || validator.isFloat(str.toString());
    }
}
exports.default = Validate78;
//# sourceMappingURL=Validate78.js.map