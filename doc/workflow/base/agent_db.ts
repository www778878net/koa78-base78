import { Handler } from './handler';

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

    // 处理器映射（内存中缓存，用于快速访问）
    private handlersByType: Map<string, Map<string, any>> = new Map(); // 按类型和能力分类: type -> capability -> handler
    private handlersByName: Map<string, any> = new Map(); // 按处理器名称分类: handler_name -> handler

    constructor(json_data?: Record<string, any>) {
        if (json_data) {
            this.setFromJson(json_data);
        }
    }

    public setFromJson(json_data: Record<string, any>): this {
        for (const key in json_data) {
            if (Object.prototype.hasOwnProperty.call(json_data, key)) {
                // 特殊处理 handlers 字段，将其转换为处理器映射
                if (key === 'handlers' && Array.isArray(json_data[key])) {
                    this.loadHandlersFromJsonData(json_data[key]);
                } else {
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
        }

        // 如果jsobj被更新，也更新inputdata和outputdata
        if (json_data.jsobj && typeof json_data.jsobj === 'object') {
            this.jsobj = json_data.jsobj;
            this.inputdata = this.jsobj.inputdata || {};
            this.outputdata = this.jsobj.outputdata || {};
        }

        return this;
    }

    public toJson(): Record<string, any> {
        const result: Record<string, any> = {};

        for (const key in this) {
            if (Object.prototype.hasOwnProperty.call(this, key)) {
                // 跳过一些动态计算或不应被序列化的属性
                if (key !== 'inputdata' && key !== 'outputdata' && key !== 'handlersByType' && key !== 'handlersByName') {
                    const value = (this as any)[key];
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
    private loadHandlersFromJsonData(handlersJson: any[]): void {
        // 清空现有的处理器
        this.handlersByType.clear();
        this.handlersByName.clear();

        // 遍历JSON数组，将每个handler转换为Handler实例
        for (const handlerData of handlersJson) {
            const handler = new Handler();
            handler.setFromJson(handlerData);  // 使用Handler类的setFromJson方法

            // 使用handler的type和capability作为映射的键
            const type = handler.apisys || 'default';
            const capability = handler.capability;
            const handlerName = handler.handler;

            // 添加到按类型和能力分类的映射中
            if (!this.handlersByType.has(type)) {
                this.handlersByType.set(type, new Map());
            }
            this.handlersByType.get(type)?.set(capability, handler);

            // 添加到按处理器名称分类的映射中
            if (handlerName) {
                this.handlersByName.set(handlerName, handler);
            }
        }
    }

    // 将handlers转换为JSON数组格式，用于保存到数据库
    private convertHandlersToJsonArray(): any[] {
        const result: any[] = [];

        // 从handlersByType映射中收集所有处理器
        for (const [, capabilities] of this.handlersByType) {
            for (const [, handler] of capabilities) {
                // 使用Handler类的toJson方法
                result.push((handler as Handler).toJson());
            }
        }

        // 确保handlersByName中的处理器也包含在结果中（避免重复）
        for (const [, handler] of this.handlersByName) {
            const handlerJson = (handler as Handler).toJson();
            // 检查是否已存在于结果中（通过id或handler名称）
            const exists = result.some(h =>
                h.id === handlerJson.id || h.handler === handlerJson.handler
            );
            if (!exists) {
                result.push(handlerJson);
            }
        }

        return result;
    }

    // 检查代理是否处于活动状态
    public isActive(): boolean {
        return this.state === "active";
    }

    // 添加处理器到内存映射
    public addHandler(handler: any): void {
        const { type, capability, handler: handlerName } = handler;

        // 添加到按类型和能力分类的映射中
        if (!this.handlersByType.has(type)) {
            this.handlersByType.set(type, new Map());
        }
        this.handlersByType.get(type)?.set(capability, handler);

        // 添加到按处理器名称分类的映射中
        if (handlerName) {
            this.handlersByName.set(handlerName, handler);
        }
    }

    // 获取处理器
    // 按类型和能力获取处理器
    public getHandlerByCapability(type: string, capability: string): any | null {
        return this.handlersByType.get(type)?.get(capability) || null;
    }

    // 按处理器名称获取处理器
    public getHandlerByName(handlerName: string): any | null {
        return this.handlersByName.get(handlerName) || null;
    }

    // 获取所有处理器（按类型和能力）
    public getAllHandlersByType(): Map<string, Map<string, any>> {
        return this.handlersByType;
    }

    // 获取所有处理器（按名称）
    public getAllHandlersByName(): Map<string, any> {
        return this.handlersByName;
    }

    // 获取指定类型的所有处理器
    public getHandlersByType(type: string): Map<string, any> | null {
        return this.handlersByType.get(type) || null;
    }


    // 执行处理器（按处理器名称）
    public async executeHandler(handlerName: string, params: Record<string, any>): Promise<Record<string, any>> {
        const handler = this.getHandlerByName(handlerName);
        if (!handler) {
            throw new Error(`Handler not found for name: ${handlerName}`);
        }

        // 执行处理器 - 所有处理器都应该是Handler实例
        return await handler.execute(params);
    }


}