// Agent类，定义了Agent的基本行为和属性
import { AgentDB } from './agent_db';

export class Agent extends AgentDB {
    // 存储处理器的映射
    private handlers: Map<string, Map<string, any>> = new Map();

    // 为了兼容示例代码，添加name属性的getter和setter，实际操作agentname
    get name(): string {
        return this.agentname;
    }

    set name(value: string) {
        this.agentname = value;
    }

    constructor(json_data?: Record<string, any>) {
        super(json_data);
    }

    // 检查代理是否处于活动状态
    public isActive(): boolean {
        return this.state === "active";
    }

    // 注册处理器
    public registerHandler(handler: any): void {
        const { type, capability } = handler;
        if (!this.handlers.has(type)) {
            this.handlers.set(type, new Map());
        }
        this.handlers.get(type)?.set(capability, handler);
    }

    // 注册处理器的别名方法，保持与示例代码的兼容性
    public addHandler(handler: any): void {
        this.registerHandler(handler);
    }

    // 获取处理器
    public getHandler(type: string, capability: string): any | null {
        return this.handlers.get(type)?.get(capability) || null;
    }

    // 获取所有处理器
    public getAllHandlers(): Map<string, Map<string, any>> {
        return this.handlers;
    }

    // 获取指定类型的所有处理器
    public getHandlersByType(type: string): Map<string, any> | null {
        return this.handlers.get(type) || null;
    }

    // 执行处理器
    public async executeHandler(type: string, capability: string, params: Record<string, any>): Promise<Record<string, any>> {
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
            const result = await handler.execute(params);

            // 更新成功统计
            this.lastoktime = new Date();
            this.lastokinfo = `Handler ${type}:${capability} executed successfully`;
            this.successcount += 1;
            this.runcount += 1;

            return result;
        } catch (error) {
            // 更新错误信息
            this.lasterrinfo = `Handler execution error: ${error instanceof Error ? error.message : String(error)}`;
            this.errorcount += 1;
            this.runcount += 1;
            throw error;
        } finally {
            // 减少当前并发数
            this.currentcopy -= 1;
        }
    }
}