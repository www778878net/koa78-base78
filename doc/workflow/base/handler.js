"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Handler = void 0;
const tslib_1 = require("tslib");
// Handler类，映射workflow_handler表的字段
class Handler {
    constructor(handlerData) {
        // 基本信息字段
        this.cid = "";
        this.apisys = "";
        this.apimicro = "";
        this.apiobj = "";
        // 关联字段
        this.idagent = ""; // 关联到workflow_agent表的id
        this.idworkflow = ""; // 工作流ID，关联工作流表
        this.handler = ""; // 处理器函数名
        this.name = ""; // 处理器名称
        this.type = ""; // 处理器类型
        this.capability = ""; // 能力名称，如"文件保存"
        this.description = ""; // 功能描述
        this.state = "active"; // 状态：active(启用), inactive(禁用)
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
        this.costdescription = ""; // 成本描述，如"每万条日志1元"
        this.pricedescription = ""; // 价格描述
        // 系统字段
        this.upby = "";
        this.uptime = null; // 这个由数据库自动更新
        this.idpk = null; // 由数据库自动生成
        this.id = null; // 唯一标识符
        // 备注字段
        this.remark = "";
        this.remark2 = "";
        this.remark3 = "";
        this.remark4 = "";
        this.remark5 = "";
        this.remark6 = "";
        if (handlerData) {
            this.setFromJson(handlerData);
        }
    }
    // 从JSON数据设置属性
    setFromJson(json_data) {
        for (const key in json_data) {
            if (this.hasOwnProperty(key) && json_data.hasOwnProperty(key)) {
                this[key] = json_data[key];
            }
        }
    }
    // 将对象转换为JSON格式
    toJson() {
        return Object.assign({}, this);
    }
    // 检查Handler是否处于活动状态
    isActive() {
        return this.state === "active";
    }
    // 设置回调函数
    setCallback(callback) {
        this.callback = callback;
    }
    // 执行回调函数
    executeCallback(result, ...args) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (this.callback) {
                return yield this.callback(result, ...args);
            }
            return result;
        });
    }
    // 执行处理器
    execute(params) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // 调用回调函数执行处理器逻辑
            return yield this.executeCallback(params);
        });
    }
}
exports.Handler = Handler;
//# sourceMappingURL=handler.js.map