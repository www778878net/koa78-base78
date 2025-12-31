"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpInfoAgent = void 0;
const tslib_1 = require("tslib");
const dayjs_1 = tslib_1.__importDefault(require("dayjs"));
const agent_1 = require("../base/agent");
const tslog78_1 = require("tslog78");
const log = tslog78_1.TsLog78.Instance;
class UpInfoAgent extends agent_1.Agent {
    constructor(ctx) {
        var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12, _13, _14, _15, _16, _17, _18, _19, _20, _21, _22, _23, _24, _25, _26;
        super(); // 调用父类的构造函数
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
        this.v = 24;
        this.cache = "";
        // 自动获取或服务器生成
        this.ip = "";
        this.ctx = null;
        this.method = "";
        this.apisys = "";
        this.apiobj = "";
        this.apifun = "";
        this.apiver = "";
        this.uptime = new Date();
        this.utime = (0, dayjs_1.default)().format('YYYY-MM-DD HH:mm:ss');
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
            this.apiver = ctx.params.apiver;
            this.apisys = ctx.params.apisys;
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
            const [apiver, apisys, apiobj, apifun] = this.method.split("/");
            this.apiver = apiver;
            this.apisys = apisys;
            this.apiobj = apiobj;
            this.apifun = apifun;
        }
        if (!pars)
            return;
        this.type = (_c = pars.type) !== null && _c !== void 0 ? _c : 0;
        this.bcid = (_d = pars.bcid) !== null && _d !== void 0 ? _d : "d4856531-e9d3-20f3-4c22-fe3c65fb009c";
        this.v = +((_g = (_f = (_e = req.header) === null || _e === void 0 ? void 0 : _e.v) !== null && _f !== void 0 ? _f : pars.v) !== null && _g !== void 0 ? _g : 24);
        this.getstart = +((_h = pars.getstart) !== null && _h !== void 0 ? _h : 0);
        this.parsn = (_k = (_j = pars["pars[]"]) !== null && _j !== void 0 ? _j : pars.pars) !== null && _k !== void 0 ? _k : "";
        this.source = (_o = (_m = (_l = req.header) === null || _l === void 0 ? void 0 : _l.source) !== null && _m !== void 0 ? _m : pars.source) !== null && _o !== void 0 ? _o : 'no';
        this.uname = (_r = (_q = (_p = req.header) === null || _p === void 0 ? void 0 : _p.uname) !== null && _q !== void 0 ? _q : pars.uname) !== null && _r !== void 0 ? _r : 'guest';
        this.pwd = (_u = (_t = (_s = req.header) === null || _s === void 0 ? void 0 : _s.pwd) !== null && _t !== void 0 ? _t : pars.pwd) !== null && _u !== void 0 ? _u : '';
        this.sid = (_x = (_w = (_v = req.header) === null || _v === void 0 ? void 0 : _v.sid) !== null && _w !== void 0 ? _w : pars.sid) !== null && _x !== void 0 ? _x : '';
        (_y = this.sid) !== null && _y !== void 0 ? _y : (this.sid = "");
        this.mid = (_z = pars.mid) !== null && _z !== void 0 ? _z : UpInfoAgent.getNewid();
        this.midpk = (_0 = pars.midpk) !== null && _0 !== void 0 ? _0 : -1;
        this.getnumber = +((_1 = pars.getnumber) !== null && _1 !== void 0 ? _1 : 15);
        this.pcid = (_4 = (_3 = (_2 = req.header) === null || _2 === void 0 ? void 0 : _2.pcid) !== null && _3 !== void 0 ? _3 : pars.pcid) !== null && _4 !== void 0 ? _4 : '';
        this.pcname = (_7 = (_6 = (_5 = req.header) === null || _5 === void 0 ? void 0 : _5.pcname) !== null && _6 !== void 0 ? _6 : pars.pcname) !== null && _7 !== void 0 ? _7 : '';
        this.ip = (_9 = (_8 = req.header) === null || _8 === void 0 ? void 0 : _8['x-forwarded-for']) !== null && _9 !== void 0 ? _9 : "";
        this.ip = this.ip.includes("ffff") ? this.ip.substring(this.ip.indexOf("ffff") + 5) : this.ip;
        this.colsn = (_11 = (_10 = pars["cols[]"]) !== null && _10 !== void 0 ? _10 : pars.cols) !== null && _11 !== void 0 ? _11 : ["all"];
        this.order = (_12 = pars.order) !== null && _12 !== void 0 ? _12 : 'idpk desc';
        this.jsonp = (_13 = pars.jsonp) !== null && _13 !== void 0 ? _13 : false;
        this.backtype = (_14 = pars.backtype) !== null && _14 !== void 0 ? _14 : "json";
        this.upid = (_15 = pars.upid) !== null && _15 !== void 0 ? _15 : UpInfoAgent.getNewid();
        this.cache = (_18 = (_17 = (_16 = req.header) === null || _16 === void 0 ? void 0 : _16.cache) !== null && _17 !== void 0 ? _17 : pars.cache) !== null && _18 !== void 0 ? _18 : this.mid;
        this.cols = typeof this.colsn === 'string' ? JSON.parse(this.colsn) : this.colsn;
        this.base64 = (_19 = pars.base64) !== null && _19 !== void 0 ? _19 : false;
        if (this.v >= 24) {
            this.json = (_20 = pars.json) !== null && _20 !== void 0 ? _20 : true;
            this.jsonbase64 = (_21 = pars.jsonbase64) !== null && _21 !== void 0 ? _21 : false;
        }
        else if (this.v >= 17.01) {
            this.json = (_22 = pars.json) !== null && _22 !== void 0 ? _22 : false;
            this.jsonbase64 = (_23 = pars.jsonbase64) !== null && _23 !== void 0 ? _23 : true;
            this.uname = this._decodeBase64((_24 = this.uname) !== null && _24 !== void 0 ? _24 : '');
            if (this.pcname !== "") {
                this.pcname = this._decodeBase64(this.pcname);
            }
        }
        else if (this.v === 17) {
            this.jsonbase64 = (_25 = pars.jsonbase64) !== null && _25 !== void 0 ? _25 : false;
            this.cidn = (_26 = pars.cid) !== null && _26 !== void 0 ? _26 : "";
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
        log.info(`UpInfoAgent created for ${this.method}`);
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
        const up2 = new UpInfoAgent(null);
        up2.sid = 'GUEST888-8888-8888-8888-GUEST88GUEST';
        up2.cid = 'GUEST000-8888-8888-8888-GUEST00GUEST';
        up2.bcid = 'd4856531-e9d3-20f3-4c22-fe3c65fb009c';
        up2.mid = this.getNewid();
        up2.uname = 'guest';
        up2.pars = [];
        up2.getstart = 0;
        up2.ip = "127.0.0.1";
        return up2;
    }
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
        const clonedUpInfo = new UpInfoAgent(null);
        clonedUpInfo.sid = this.sid;
        clonedUpInfo.uname = this.uname;
        clonedUpInfo.bcid = this.bcid;
        clonedUpInfo.ctx = this.ctx;
        clonedUpInfo.method = this.method;
        // 可以根据需要复制更多属性
        return clonedUpInfo;
    }
}
exports.UpInfoAgent = UpInfoAgent;
_a = UpInfoAgent;
UpInfoAgent._masterInstance = _a.getGuest();
//# sourceMappingURL=upinfo-agent.js.map