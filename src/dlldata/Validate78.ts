
const Util = require('util');
import * as validator from "validator";
/**
 * @deprecated 直接用validator
 */
export default class Validate78 {
    static isEmail(str:string): boolean {
        return validator.isEmail(str);
    }

    static isMobile(str: string): boolean {
        return validator.isMobilePhone(str, 'zh-CN');
    }

    static isNull(str: string): boolean {
        return validator.isNull(str);
    }

    static isNum(str: string|number): boolean {
        return validator.isNumeric(str.toString()) || validator.isFloat(str.toString());
    }

 
}
