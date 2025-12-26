// AgentDB类 - 用于映射workflow_agent表的字段
export class AgentDB {
    // 基本信息字段（数据库中必须的字段）
    public cid: string = "";
    public apiv: string = "";
    public apisys: string = "";
    public apiobj: string = "";
    public agentname: string = "";
    public description: string = "";
    public maxcopy: number = 1;      // 最大并发数
    public version: string = "1.0.0";
    public errsec: number = 86400;   // 多少秒没成功才算失败

    // 状态和时间字段
    public state: string = "active";  // 状态：active(启用), inactive(禁用)
    public lastheartbeat: Date | null = null;  // 最后心跳时间，用于监控代理存活状态
    public currentcopy: number = 0;      // 当前并发数

    // 时间和统计字段
    public lastoktime: Date | null = null;      // 最后成功时间
    public lastokinfo: string = "";      // 成功信息
    public starttime: Date | null = null;
    public endtime: Date | null = null;
    public lasterrinfo: string = "";    // 错误信息

    // 价格成本相关字段
    public pricebase: number = 1.0;  // 基础价格
    public price: number = 1.0;  // 当前价格
    public costunit: number = 0.0;  // 单位成本
    public profittarget: number = 0.2;  // 目标利润率
    public profittotal: number = 0.0;  // 总利润
    public costtotal: number = 0.0;  // 总成本
    public revenuetotal: number = 0.0;  // 总收入
    public roi: number = 0.0;  // 投资回报率

    // 执行统计相关字段
    public successcount: number = 0;  // 成功执行次数
    public runcount: number = 0;  // 总执行次数
    public successrate: number = 0.0;  // 成功率
    public errorcount: number = 0;  // 错误次数

    // 描述信息
    public costdescription: string = "";  // 成本描述
    public pricedescription: string = "";  // 价格描述

    // 系统字段
    public upby: string = "";
    public uptime: Date | null = null;  // 由数据库自动更新
    public idpk: number | null = null;  // 由数据库自动生成
    public id: string | null = null;  // 唯一标识符

    // 备注字段
    public remark: string = "";
    public remark2: string = "";
    public remark3: string = "";
    public remark4: string = "";
    public remark5: string = "";
    public remark6: string = "";

    // 动态字段
    public jsobj: Record<string, any> = {};
    public inputdata: Record<string, any> = {};
    public outputdata: Record<string, any> = {};

    constructor(json_data?: Record<string, any>) {
        if (json_data) {
            this.set_from_json(json_data);
        }
    }

    public set_from_json(json_data: Record<string, any>): this {
        for (const key in json_data) {
            if (Object.prototype.hasOwnProperty.call(json_data, key)) {
                // 处理日期类型字段
                if (key.includes('time') || key.includes('date')) {
                    if (json_data[key]) {
                        (this as any)[key] = new Date(json_data[key]);
                    }
                } else {
                    (this as any)[key] = json_data[key];
                }
            }
        }

        // 如果jsobj被更新，也更新inputdata和outputdata
        if (json_data.jsobj && typeof json_data.jsobj === 'object') {
            this.jsobj = json_data.jsobj;
            this.inputdata = this.jsobj.inputdata || {};
            this.outputdata = this.jsobj.outputdata || {};
        }

        return this;
    }

    public get_from_json(): Record<string, any> {
        const result: Record<string, any> = {};

        for (const key in this) {
            if (Object.prototype.hasOwnProperty.call(this, key)) {
                // 跳过一些动态计算的属性
                if (key !== 'inputdata' && key !== 'outputdata') {
                    const value = (this as any)[key];
                    // 处理日期类型字段
                    result[key] = value instanceof Date ? value.toISOString() : value;
                }
            }
        }

        // 将inputdata和outputdata合并到jsobj中
        this.jsobj.inputdata = this.inputdata;
        this.jsobj.outputdata = this.outputdata;
        result.jsobj = this.jsobj;

        return result;
    }
}