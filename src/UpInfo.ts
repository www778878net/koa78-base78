import dayjs from 'dayjs';

export default class UpInfo {
    // 数据获取非必填字段
    getstart: number = 0;
    getnumber: number = 15;
    order: string = "idpk";
    bcid: string = "";
    mid: string = "";
    pars: string[] = [];
    cols: string[] = [];

    midpk: number = 0;
    upid: number = 0;
    type: number = 0;

    // 调试监控用
    debug: boolean = false;
    pcid: string = "";
    pcname: string = "";
    source: string = "";
    v: number = 24; // api版本号不同于apisys是后端逻辑不要弄进数据库
    cache: string = "";

    // 自动获取或服务器生成
      ip: string = "";
      ctx: any = null;
      method: string = "";
    
      apiobj: string = "";   // 类或能力或微服务中的步骤
      apifun: string = "";   // 类中的函数
      apimicro: string = ""; // 微服务
      apisys: string = "";   // 多个微服务组合的系统
      uptime: Date = new Date();    utime: string = dayjs().format('YYYY-MM-DD HH:mm:ss');
    upby: string = "";
    errmessage: string = "";

    // 上传临时存 验证后再用
    cidn: string = "";
    parsn: string | string[] = "";
    colsn: string | string[] = "";

    // 需数据库读取验证
    sid: string = "";
    cid: string = "";
    uid: string = "";
    coname: string = '测试帐套';
    uname: string | undefined;

    pwd: string = "";
    weixin: string = "";
    idceo: string = "";
    truename: string = "";
    mobile: string = "";
    idpk: number = 0;

    // 返回用
    res: number = 0;
    errmsg: string = "";
    backtype: string = "json";

    jsonp: boolean = false;
    base64: boolean = false;
    json: boolean = true;

    // 弃用下版删除
    jsonbase64: boolean = false;

    constructor(ctx: any) {
        if (!ctx) return;

        this.ctx = ctx;
        const { request: req } = ctx;
        this.method = req.path;

        if (ctx.params) {
            this.apisys = ctx.params.apisys;
            this.apimicro = ctx.params.apimicro;
            this.apiobj = ctx.params.apiobj;
            this.apifun = ctx.params.apifun;
        }

        let pars: any = null;

        if (req.method === "GET") {
            pars = req.query;
        } else if (req.method === "POST") {
            pars = req.fields ?? req.body;
        } else if (req.method === "SOCK") {
            pars = req.header;
            this.method = req.header["method"];
            const [apisys, apimicro, apiobj, apifun] = this.method.split("/");
            this.apisys = apisys;
            this.apimicro = apimicro;
            this.apiobj = apiobj;
            this.apifun = apifun;
        }

        if (!pars) return;

        this.type = pars.type ?? 0;

        this.bcid = pars.bcid ?? "d4856531-e9d3-20f3-4c22-fe3c65fb009c";
        this.v = +(req.header['v'] ?? pars.v ?? 24);
        this.getstart = +(pars.getstart ?? 0);
        this.parsn = pars["pars[]"] ?? pars.pars ?? "";
        this.source = req.header['source'] ?? pars.source ?? 'no';
        this.uname = req.header['uname'] ?? pars.uname ?? 'guest';
        this.pwd = req.header['pwd'] ?? pars.pwd ?? '';
        this.sid = req.header['sid'] ?? pars.sid ?? '';
        this.sid ??= "";

        this.mid = pars.mid ?? UpInfo.getNewid();
        this.midpk = +(pars.midpk ?? -1);
        this.getnumber = +(pars.getnumber ?? 15);
        this.pcid = req.header['pcid'] ?? pars.pcid ?? '';
        this.pcname = req.header['pcname'] ?? pars.pcname ?? '';
        this.ip = req.header['x-forwarded-for'] ?? "";
        this.ip = this.ip.includes("ffff") ? this.ip.substring(this.ip.indexOf("ffff") + 5) : this.ip;
        this.colsn = pars["cols[]"] ?? pars.cols ?? ["all"];

        this.order = pars.order ?? 'idpk desc';

        this.jsonp = pars.jsonp ?? false;
        this.backtype = pars.backtype ?? "json";
        this.upid = pars.upid ?? UpInfo.getNewid();
        this.cache = req.header['cache'] ?? pars.cache ?? this.mid;

        this.cols = typeof this.colsn === 'string' ? JSON.parse(this.colsn) : this.colsn;

        this.base64 = pars.base64 ?? false;

        if (this.v >= 24) {
            this.json = pars.json ?? true;
            this.jsonbase64 = pars.jsonbase64 ?? false;
        } else if (this.v >= 17.01) {
            this.json = pars.json ?? false;
            this.jsonbase64 = pars.jsonbase64 ?? true;
            this.uname = this._decodeBase64(this.uname ?? '');
            if (this.pcname !== "") {
                this.pcname = this._decodeBase64(this.pcname);
            }
        } else if (this.v === 17) {
            this.jsonbase64 = pars.jsonbase64 ?? false;
            this.cidn = pars.cid ?? "";
        }

        if (this.parsn === "") {
            this.pars = [];
            return;
        }

        if (this.json) {
            try {
                this.pars = typeof this.parsn === 'string' ? JSON.parse(this.parsn) : this.parsn;
            } catch (e) {
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
                } else {
                    this.pars = typeof this.pars === 'string' && this.pars !== "null" ? JSON.parse(this.pars) : [];
                }
            } catch (e) {
                console.log(`jsonbase eval err: ${JSON.stringify(e)}`);
                console.log(`${this.method} ${JSON.stringify(this.colsn)} jsonbase eval err: ${JSON.stringify(this.parsn)}`);
            }
        }
        if (this.base64) {
            if (typeof this.parsn === 'string') {
                this.pars = [this._decodeBase64(this.parsn)];
            } else if (Array.isArray(this.parsn)) {
                this.pars = this.parsn.map(p => this._decodeBase64(p));
            } else {
                console.log('error parsn kind');
                this.pars = [];
            }
        }

    }

    private _decodeBase64(encodestr: string): string {
        return Buffer.from(encodestr.replace(/\*/g, "+").replace(/-/g, "/").replace(/\./g, "="), 'base64').toString();
    }

    private static _masterInstance: UpInfo = this.getGuest();

    static setMaster(up: UpInfo): void {
        this._masterInstance = up;
    }

    static getMaster(): UpInfo {
        this._masterInstance.pars = [];
        return this._masterInstance;
    };

    static getGuest(): UpInfo {
        const up2 = new UpInfo(null);
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
    };

    static getNewid(): string {
        const s4 = (): string => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
        return `${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`;
    }

    inArray(o: string, cols: string[]): boolean {
        return cols.includes(o);
    }

    checkCols(cols: string[]): string {
        if (this.cols.length === 1 && (this.cols[0] === 'all' || this.cols[0] === 'idpk')) {
            return "checkcolsallok";
        }
        let isback = "checkcolsallok";
        try {
            this.cols.forEach(item => {
                if (!cols.includes(item))
                    isback = item;
            });
        } catch (e) {
            console.log(`checkCols err: ${e}`);
            return isback;
        }

        return isback;
    };

    inOrder(cols: string[]): boolean {
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
    };

    clone(): UpInfo {
        const clonedUpInfo = new UpInfo(null);
        clonedUpInfo.sid = this.sid;
        clonedUpInfo.uname = this.uname;
        clonedUpInfo.bcid = this.bcid;
        return clonedUpInfo;
    }
}