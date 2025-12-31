"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Agent = void 0;
const tslib_1 = require("tslib");
// Agent类，定义了Agent的基本行为和属性
const agent_db_1 = require("./agent_db");
class Agent extends agent_db_1.AgentDB {
    // 为了兼容示例代码，添加name属性的getter和setter，实际操作agentname
    get name() {
        return this.agentname;
    }
    set name(value) {
        this.agentname = value;
    }
    constructor(json_data) {
        super(json_data);
        // 存储处理器的映射
        this.handlers = new Map();
    }
    // 检查代理是否处于活动状态
    isActive() {
        return this.state === "active";
    }
    // 注册处理器
    registerHandler(handler) {
        var _a;
        const { type, capability } = handler;
        if (!this.handlers.has(type)) {
            this.handlers.set(type, new Map());
        }
        (_a = this.handlers.get(type)) === null || _a === void 0 ? void 0 : _a.set(capability, handler);
    }
    // 注册处理器的别名方法，保持与示例代码的兼容性
    addHandler(handler) {
        this.registerHandler(handler);
    }
    // 获取处理器
    getHandler(type, capability) {
        var _a;
        return ((_a = this.handlers.get(type)) === null || _a === void 0 ? void 0 : _a.get(capability)) || null;
    }
    // 获取所有处理器
    getAllHandlers() {
        return this.handlers;
    }
    // 获取指定类型的所有处理器
    getHandlersByType(type) {
        return this.handlers.get(type) || null;
    }
    // 执行处理器
    executeHandler(type, capability, params) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const handler = this.getHandler(type, capability);
            if (!handler) {
                throw new Error(`Handler not found for type: ${type}, capability: ${capability}`);
            }
            // 检查当前并发数是否超过最大并发数
            if (this.currentcopy >= this.maxcopy) {
                throw new Error(`Maximum concurrent copies reached (${this.maxcopy})`);
            }
            try {
                // 增加当前并发数
                this.currentcopy += 1;
                // 更新最后心跳时间
                this.lastheartbeat = new Date();
                // 执行处理器
                const result = yield handler.execute(params);
                // 更新成功统计
                this.lastoktime = new Date();
                this.lastokinfo = `Handler ${type}:${capability} executed successfully`;
                this.successcount += 1;
                this.runcount += 1;
                return result;
            }
            catch (error) {
                // 更新错误信息
                this.lasterrinfo = `Handler execution error: ${error instanceof Error ? error.message : String(error)}`;
                this.errorcount += 1;
                this.runcount += 1;
                throw error;
            }
            finally {
                // 减少当前并发数
                this.currentcopy -= 1;
            }
        });
    }
}
exports.Agent = Agent;
//# sourceMappingURL=agent.js.map