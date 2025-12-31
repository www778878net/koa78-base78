"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentDB = void 0;
// AgentDB类 - 用于映射workflow_agent表的字段
class AgentDB {
    constructor(json_data) {
        // 基本信息字段（数据库中必须的字段）
        this.cid = "";
        this.apiv = "";
        this.apisys = "";
        this.apiobj = "";
        this.agentname = "";
        this.description = "";
        this.maxcopy = 1; // 最大并发数
        this.version = "1.0.0";
        this.errsec = 86400; // 多少秒没成功才算失败
        // 状态和时间字段
        this.state = "active"; // 状态：active(启用), inactive(禁用)
        this.lastheartbeat = null; // 最后心跳时间，用于监控代理存活状态
        this.currentcopy = 0; // 当前并发数
        // 时间和统计字段
        this.lastoktime = null; // 最后成功时间
        this.lastokinfo = ""; // 成功信息
        this.starttime = null;
        this.endtime = null;
        this.lasterrinfo = ""; // 错误信息
        // 价格成本相关字段
        this.pricebase = 1.0; // 基础价格
        this.price = 1.0; // 当前价格
        this.costunit = 0.0; // 单位成本
        this.profittarget = 0.2; // 目标利润率
        this.profittotal = 0.0; // 总利润
        this.costtotal = 0.0; // 总成本
        this.revenuetotal = 0.0; // 总收入
        this.roi = 0.0; // 投资回报率
        // 执行统计相关字段
        this.successcount = 0; // 成功执行次数
        this.runcount = 0; // 总执行次数
        this.successrate = 0.0; // 成功率
        this.errorcount = 0; // 错误次数
        // 描述信息
        this.costdescription = ""; // 成本描述
        this.pricedescription = ""; // 价格描述
        // 系统字段
        this.upby = "";
        this.uptime = null; // 由数据库自动更新
        this.idpk = null; // 由数据库自动生成
        this.id = null; // 唯一标识符
        // 备注字段
        this.remark = "";
        this.remark2 = "";
        this.remark3 = "";
        this.remark4 = "";
        this.remark5 = "";
        this.remark6 = "";
        // 动态字段
        this.jsobj = {};
        this.inputdata = {};
        this.outputdata = {};
        if (json_data) {
            this.set_from_json(json_data);
        }
    }
    set_from_json(json_data) {
        for (const key in json_data) {
            if (Object.prototype.hasOwnProperty.call(json_data, key)) {
                // 处理日期类型字段
                if (key.includes('time') || key.includes('date')) {
                    if (json_data[key]) {
                        this[key] = new Date(json_data[key]);
                    }
                }
                else {
                    this[key] = json_data[key];
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
    get_from_json() {
        const result = {};
        for (const key in this) {
            if (Object.prototype.hasOwnProperty.call(this, key)) {
                // 跳过一些动态计算的属性
                if (key !== 'inputdata' && key !== 'outputdata') {
                    const value = this[key];
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
exports.AgentDB = AgentDB;
//# sourceMappingURL=agent_db.js.map