"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentDB = void 0;
const tslib_1 = require("tslib");
const handler_1 = require("./handler");
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
        // 处理器映射（内存中缓存，用于快速访问）
        this.handlersByType = new Map(); // 按类型和能力分类: type -> capability -> handler
        this.handlersByName = new Map(); // 按处理器名称分类: handler_name -> handler
        if (json_data) {
            this.setFromJson(json_data);
        }
    }
    setFromJson(json_data) {
        for (const key in json_data) {
            if (Object.prototype.hasOwnProperty.call(json_data, key)) {
                // 特殊处理 handlers 字段，将其转换为处理器映射
                if (key === 'handlers' && Array.isArray(json_data[key])) {
                    this.loadHandlersFromJsonData(json_data[key]);
                }
                else {
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
        }
        // 如果jsobj被更新，也更新inputdata和outputdata
        if (json_data.jsobj && typeof json_data.jsobj === 'object') {
            this.jsobj = json_data.jsobj;
            this.inputdata = this.jsobj.inputdata || {};
            this.outputdata = this.jsobj.outputdata || {};
        }
        return this;
    }
    toJson() {
        const result = {};
        for (const key in this) {
            if (Object.prototype.hasOwnProperty.call(this, key)) {
                // 跳过一些动态计算或不应被序列化的属性
                if (key !== 'inputdata' && key !== 'outputdata' && key !== 'handlersByType' && key !== 'handlersByName') {
                    const value = this[key];
                    // 处理日期类型字段
                    result[key] = value instanceof Date ? value.toISOString() : value;
                }
            }
        }
        // 将处理器转换为JSON数组格式以便保存到数据库
        result.handlers = this.convertHandlersToJsonArray();
        // 将inputdata和outputdata合并到jsobj中
        this.jsobj.inputdata = this.inputdata;
        this.jsobj.outputdata = this.outputdata;
        result.jsobj = this.jsobj;
        return result;
    }
    // 从JSON数据加载handlers到内存映射
    loadHandlersFromJsonData(handlersJson) {
        var _a;
        // 清空现有的处理器
        this.handlersByType.clear();
        this.handlersByName.clear();
        // 遍历JSON数组，将每个handler转换为Handler实例
        for (const handlerData of handlersJson) {
            const handler = new handler_1.Handler();
            handler.setFromJson(handlerData); // 使用Handler类的setFromJson方法
            // 使用handler的type和capability作为映射的键
            const type = handler.apisys || 'default';
            const capability = handler.capability;
            const handlerName = handler.handler;
            // 添加到按类型和能力分类的映射中
            if (!this.handlersByType.has(type)) {
                this.handlersByType.set(type, new Map());
            }
            (_a = this.handlersByType.get(type)) === null || _a === void 0 ? void 0 : _a.set(capability, handler);
            // 添加到按处理器名称分类的映射中
            if (handlerName) {
                this.handlersByName.set(handlerName, handler);
            }
        }
    }
    // 将handlers转换为JSON数组格式，用于保存到数据库
    convertHandlersToJsonArray() {
        const result = [];
        // 从handlersByType映射中收集所有处理器
        for (const [, capabilities] of this.handlersByType) {
            for (const [, handler] of capabilities) {
                // 使用Handler类的toJson方法
                result.push(handler.toJson());
            }
        }
        // 确保handlersByName中的处理器也包含在结果中（避免重复）
        for (const [, handler] of this.handlersByName) {
            const handlerJson = handler.toJson();
            // 检查是否已存在于结果中（通过id或handler名称）
            const exists = result.some(h => h.id === handlerJson.id || h.handler === handlerJson.handler);
            if (!exists) {
                result.push(handlerJson);
            }
        }
        return result;
    }
    // 检查代理是否处于活动状态
    isActive() {
        return this.state === "active";
    }
    // 添加处理器到内存映射
    addHandler(handler) {
        var _a;
        const { type, capability, handler: handlerName } = handler;
        // 添加到按类型和能力分类的映射中
        if (!this.handlersByType.has(type)) {
            this.handlersByType.set(type, new Map());
        }
        (_a = this.handlersByType.get(type)) === null || _a === void 0 ? void 0 : _a.set(capability, handler);
        // 添加到按处理器名称分类的映射中
        if (handlerName) {
            this.handlersByName.set(handlerName, handler);
        }
    }
    // 获取处理器
    // 按类型和能力获取处理器
    getHandlerByCapability(type, capability) {
        var _a;
        return ((_a = this.handlersByType.get(type)) === null || _a === void 0 ? void 0 : _a.get(capability)) || null;
    }
    // 按处理器名称获取处理器
    getHandlerByName(handlerName) {
        return this.handlersByName.get(handlerName) || null;
    }
    // 获取所有处理器（按类型和能力）
    getAllHandlersByType() {
        return this.handlersByType;
    }
    // 获取所有处理器（按名称）
    getAllHandlersByName() {
        return this.handlersByName;
    }
    // 获取指定类型的所有处理器
    getHandlersByType(type) {
        return this.handlersByType.get(type) || null;
    }
    // 执行处理器（按处理器名称）
    executeHandler(handlerName, params) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const handler = this.getHandlerByName(handlerName);
            if (!handler) {
                throw new Error(`Handler not found for name: ${handlerName}`);
            }
            // 执行处理器 - 所有处理器都应该是Handler实例
            return yield handler.execute(params);
        });
    }
}
exports.AgentDB = AgentDB;
//# sourceMappingURL=agent_db.js.map