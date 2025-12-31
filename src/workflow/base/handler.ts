// Handler类，映射workflow_handler表的字段
export class Handler {
    // 基本信息字段
    public cid: string = "";
    public apiv: string = "";
    public apisys: string = "";
    public apiobj: string = "";

    // 关联字段
    public idagent: string = "";  // 关联到workflow_agent表的id
    public idworkflow: string = "";  // 工作流ID，关联工作流表
    public handler: string = "";  // 处理器函数名
    public name: string = "";  // 处理器名称
    public type: string = "";  // 处理器类型
    public capability: string = "";  // 能力名称，如"文件保存"
    public description: string = "";  // 功能描述
    public state: string = "active";  // 状态：active(启用), inactive(禁用)

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
    public costdescription: string = "";  // 成本描述，如"每万条日志1元"
    public pricedescription: string = "";  // 价格描述

    // 系统字段
    public upby: string = "";
    public uptime: string | null = null;  // 这个由数据库自动更新
    public idpk: number | null = null;  // 由数据库自动生成
    public id: string | null = null;  // 唯一标识符

    // 备注字段
    public remark: string = "";
    public remark2: string = "";
    public remark3: string = "";
    public remark4: string = "";
    public remark5: string = "";
    public remark6: string = "";

    // 回调函数（非数据库字段）
    public callback?: (result: any, ...args: any[]) => Promise<any>;  // 可选的回调函数

    constructor(handlerData?: Partial<Handler>) {
        if (handlerData) {
            this.setFromJson(handlerData);
        }
    }

    // 从JSON数据设置属性
    public setFromJson(json_data: Partial<Handler>): void {
        for (const key in json_data) {
            if (this.hasOwnProperty(key) && json_data.hasOwnProperty(key)) {
                (this as any)[key] = json_data[key as keyof Handler];
            }
        }
    }

    // 将对象转换为JSON格式
    public toJson(): Record<string, any> {
        return { ...this };
    }

    // 检查Handler是否处于活动状态
    public isActive(): boolean {
        return this.state === "active";
    }

    // 设置回调函数
    public setCallback(callback: (result: any, ...args: any[]) => Promise<any>): void {
        this.callback = callback;
    }

    // 执行回调函数
    public async executeCallback(result: any, ...args: any[]): Promise<any> {
        if (this.callback) {
            return await this.callback(result, ...args);
        }
        return result;
    }

    // 执行处理器
    public async execute(params: any): Promise<any> {
        // 调用回调函数执行处理器逻辑
        return await this.executeCallback(params);
    }
}