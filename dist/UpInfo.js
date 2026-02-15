"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const dayjs_1 = tslib_1.__importDefault(require("dayjs"));
class UpInfo {
    constructor(ctx) {
        var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12, _13, _14, _15, _16, _17;
        // 数据获取非必填字段
        this.getstart = 0;
        this.getnumber = 15;
        this.order = "idpk";
        this.bcid = "";
        this.mid = "";
        this.pars = [];
        this.cols = [];
        this.midpk = 0;
        this.upid = 0;
        this.type = 0;
        // 调试监控用
        this.debug = false;
        this.pcid = "";
        this.pcname = "";
        this.source = "";
        this.v = 24; // api版本号不同于apisys是后端逻辑不要弄进数据库
        this.cache = "";
        // 自动获取或服务器生成
        this.ip = "";
        this.ctx = null;
        this.method = "";
        this.apiobj = ""; // 类或能力或微服务中的步骤
        this.apifun = ""; // 类中的函数
        this.apimicro = ""; // 微服务
        this.apisys = ""; // 多个微服务组合的系统
        this.uptime = new Date();
        this.utime = (0, dayjs_1.default)().format('YYYY-MM-DD HH:mm:ss');
        this.upby = "";
        this.errmessage = "";
        // 上传临时存 验证后再用
        this.cidn = "";
        this.parsn = "";
        this.colsn = "";
        // 需数据库读取验证
        this.sid = "";
        this.cid = "";
        this.uid = "";
        this.coname = '测试帐套';
        this.pwd = "";
        this.weixin = "";
        this.idceo = "";
        this.truename = "";
        this.mobile = "";
        this.idpk = 0;
        // 返回用
        this.res = 0;
        this.errmsg = "";
        this.backtype = "json";
        this.jsonp = false;
        this.base64 = false;
        this.json = true;
        // 弃用下版删除
        this.jsonbase64 = false;
        if (!ctx)
            return;
        this.ctx = ctx;
        const { request: req } = ctx;
        this.method = req.path;
        if (ctx.params) {
            this.apisys = ctx.params.apisys;
            this.apimicro = ctx.params.apimicro;
            this.apiobj = ctx.params.apiobj;
            this.apifun = ctx.params.apifun;
        }
        let pars = null;
        if (req.method === "GET") {
            pars = req.query;
        }
        else if (req.method === "POST") {
            pars = (_b = req.fields) !== null && _b !== void 0 ? _b : req.body;
        }
        else if (req.method === "SOCK") {
            pars = req.header;
            this.method = req.header["method"];
            const [apisys, apimicro, apiobj, apifun] = this.method.split("/");
            this.apisys = apisys;
            this.apimicro = apimicro;
            this.apiobj = apiobj;
            this.apifun = apifun;
        }
        if (!pars)
            return;
        this.type = (_c = pars.type) !== null && _c !== void 0 ? _c : 0;
        this.bcid = (_d = pars.bcid) !== null && _d !== void 0 ? _d : "d4856531-e9d3-20f3-4c22-fe3c65fb009c";
        this.v = +((_f = (_e = req.header['v']) !== null && _e !== void 0 ? _e : pars.v) !== null && _f !== void 0 ? _f : 24);
        this.getstart = +((_g = pars.getstart) !== null && _g !== void 0 ? _g : 0);
        this.parsn = (_j = (_h = pars["pars[]"]) !== null && _h !== void 0 ? _h : pars.pars) !== null && _j !== void 0 ? _j : "";
        this.source = (_l = (_k = req.header['source']) !== null && _k !== void 0 ? _k : pars.source) !== null && _l !== void 0 ? _l : 'no';
        this.uname = (_o = (_m = req.header['uname']) !== null && _m !== void 0 ? _m : pars.uname) !== null && _o !== void 0 ? _o : 'guest';
        this.pwd = (_q = (_p = req.header['pwd']) !== null && _p !== void 0 ? _p : pars.pwd) !== null && _q !== void 0 ? _q : '';
        this.sid = (_s = (_r = req.header['sid']) !== null && _r !== void 0 ? _r : pars.sid) !== null && _s !== void 0 ? _s : '';
        (_t = this.sid) !== null && _t !== void 0 ? _t : (this.sid = "");
        this.mid = (_u = pars.mid) !== null && _u !== void 0 ? _u : _a.getNewid();
        this.midpk = +((_v = pars.midpk) !== null && _v !== void 0 ? _v : -1);
        this.getnumber = +((_w = pars.getnumber) !== null && _w !== void 0 ? _w : 15);
        this.pcid = (_y = (_x = req.header['pcid']) !== null && _x !== void 0 ? _x : pars.pcid) !== null && _y !== void 0 ? _y : '';
        this.pcname = (_0 = (_z = req.header['pcname']) !== null && _z !== void 0 ? _z : pars.pcname) !== null && _0 !== void 0 ? _0 : '';
        this.ip = (_1 = req.header['x-forwarded-for']) !== null && _1 !== void 0 ? _1 : "";
        this.ip = this.ip.includes("ffff") ? this.ip.substring(this.ip.indexOf("ffff") + 5) : this.ip;
        this.colsn = (_3 = (_2 = pars["cols[]"]) !== null && _2 !== void 0 ? _2 : pars.cols) !== null && _3 !== void 0 ? _3 : ["all"];
        this.order = (_4 = pars.order) !== null && _4 !== void 0 ? _4 : 'idpk desc';
        this.jsonp = (_5 = pars.jsonp) !== null && _5 !== void 0 ? _5 : false;
        this.backtype = (_6 = pars.backtype) !== null && _6 !== void 0 ? _6 : "json";
        this.upid = (_7 = pars.upid) !== null && _7 !== void 0 ? _7 : _a.getNewid();
        this.cache = (_9 = (_8 = req.header['cache']) !== null && _8 !== void 0 ? _8 : pars.cache) !== null && _9 !== void 0 ? _9 : this.mid;
        this.cols = typeof this.colsn === 'string' ? JSON.parse(this.colsn) : this.colsn;
        this.base64 = (_10 = pars.base64) !== null && _10 !== void 0 ? _10 : false;
        if (this.v >= 24) {
            this.json = (_11 = pars.json) !== null && _11 !== void 0 ? _11 : true;
            this.jsonbase64 = (_12 = pars.jsonbase64) !== null && _12 !== void 0 ? _12 : false;
        }
        else if (this.v >= 17.01) {
            this.json = (_13 = pars.json) !== null && _13 !== void 0 ? _13 : false;
            this.jsonbase64 = (_14 = pars.jsonbase64) !== null && _14 !== void 0 ? _14 : true;
            this.uname = this._decodeBase64((_15 = this.uname) !== null && _15 !== void 0 ? _15 : '');
            if (this.pcname !== "") {
                this.pcname = this._decodeBase64(this.pcname);
            }
        }
        else if (this.v === 17) {
            this.jsonbase64 = (_16 = pars.jsonbase64) !== null && _16 !== void 0 ? _16 : false;
            this.cidn = (_17 = pars.cid) !== null && _17 !== void 0 ? _17 : "";
        }
        if (this.parsn === "") {
            this.pars = [];
            return;
        }
        if (this.json) {
            try {
                this.pars = typeof this.parsn === 'string' ? JSON.parse(this.parsn) : this.parsn;
            }
            catch (e) {
                console.log(`${this.method} ${JSON.stringify(this.colsn)} json eval err: ${JSON.stringify(this.parsn)}`);
            }
        }
        if (this.jsonbase64) {
            try {
                const decodedPars = typeof this.parsn === 'string'
                    ? this._decodeBase64(this.parsn)
                    : '';
                if (this.v >= 22) {
                    this.pars = decodedPars !== "null" ? decodedPars.split(",~") : [];
                }
                else {
                    this.pars = typeof this.pars === 'string' && this.pars !== "null" ? JSON.parse(this.pars) : [];
                }
            }
            catch (e) {
                console.log(`jsonbase eval err: ${JSON.stringify(e)}`);
                console.log(`${this.method} ${JSON.stringify(this.colsn)} jsonbase eval err: ${JSON.stringify(this.parsn)}`);
            }
        }
        if (this.base64) {
            if (typeof this.parsn === 'string') {
                this.pars = [this._decodeBase64(this.parsn)];
            }
            else if (Array.isArray(this.parsn)) {
                this.pars = this.parsn.map(p => this._decodeBase64(p));
            }
            else {
                console.log('error parsn kind');
                this.pars = [];
            }
        }
    }
    _decodeBase64(encodestr) {
        return Buffer.from(encodestr.replace(/\*/g, "+").replace(/-/g, "/").replace(/\./g, "="), 'base64').toString();
    }
    static setMaster(up) {
        this._masterInstance = up;
    }
    static getMaster() {
        this._masterInstance.pars = [];
        return this._masterInstance;
    }
    ;
    static getGuest() {
        const up2 = new _a(null);
        Object.assign(up2, {
            sid: 'GUEST888-8888-8888-8888-GUEST88GUEST',
            cid: 'GUEST000-8888-8888-8888-GUEST00GUEST',
            bcid: 'd4856531-e9d3-20f3-4c22-fe3c65fb009c',
            mid: this.getNewid(),
            uname: 'guest',
            pars: [],
            getstart: 0,
            ip: "127.0.0.1"
        });
        return up2;
    }
    ;
    static getNewid() {
        const s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
        return `${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`;
    }
    inArray(o, cols) {
        return cols.includes(o);
    }
    checkCols(cols) {
        if (this.cols.length === 1 && (this.cols[0] === 'all' || this.cols[0] === 'idpk')) {
            return "checkcolsallok";
        }
        let isback = "checkcolsallok";
        try {
            this.cols.forEach(item => {
                if (!cols.includes(item))
                    isback = item;
            });
        }
        catch (e) {
            console.log(`checkCols err: ${e}`);
            return isback;
        }
        return isback;
    }
    ;
    inOrder(cols) {
        let isin = true;
        const orders = this.order.split(",");
        for (const o of orders) {
            let order = o;
            const descIndex = o.indexOf(" desc");
            if (descIndex >= 0 && descIndex === o.length - 5)
                order = o.substr(0, descIndex);
            if (order === 'id' || order === 'idpk' || order === 'uptime' || order === 'upby')
                continue;
            if (order !== 'id' && order !== 'idpk' && !cols.includes(order)) {
                return false;
            }
        }
        return isin;
    }
    ;
    clone() {
        const clonedUpInfo = new _a(null);
        clonedUpInfo.sid = this.sid;
        clonedUpInfo.uname = this.uname;
        clonedUpInfo.bcid = this.bcid;
        return clonedUpInfo;
    }
}
_a = UpInfo;
UpInfo._masterInstance = _a.getGuest();
exports.default = UpInfo;
//# sourceMappingURL=UpInfo.js.map