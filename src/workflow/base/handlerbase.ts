// Handler基类，提供数据字典和基础功能

export class HandlerBase {
    // 数据字典 - 集成BaseSchema和workflow_handler的字段
    public static readonly COLUMNS = [
        // BaseSchema基础字段
        'id', 'idpk', 'upby', 'uptime',
        'remark', 'remark2', 'remark3', 'remark4', 'remark5', 'remark6',
        // CidSchema字段
        'cid',
        // workflow_handler特定字段
        // 前5个字段必须按索引顺序排列
        'idagent', 'capability', 'apiv', 'apisys', 'apiobj',
        // 其他必要字段
        'idworkflow', 'handler', 'description', 'state',
        // 价格成本相关字段
        'pricebase', 'price', 'costunit', 'profittarget', 'profittotal', 'costtotal', 'revenuetotal', 'roi',
        // 执行统计相关字段
        'successcount', 'runcount', 'successrate',
        // 描述信息
        'costdescription', 'pricedescription'
    ] as const;

    // Handler状态枚举
    public static readonly STATE = {
        ACTIVE: 'active',
        INACTIVE: 'inactive',
        MAINTENANCE: 'maintenance',
        ERROR: 'error'
    } as const;

    // 基础属性
    protected handlerData: Record<string, any> = {};

    constructor(handlerData?: Partial<Record<typeof HandlerBase.COLUMNS[number], any>>) {
        if (handlerData) {
            this.handlerData = handlerData;
        }
    }

    // 获取指定字段的值
    public get<T = any>(field: typeof HandlerBase.COLUMNS[number]): T | undefined {
        return this.handlerData[field] as T;
    }

    // 设置指定字段的值
    public set(field: typeof HandlerBase.COLUMNS[number], value: any): void {
        this.handlerData[field] = value;
    }

    // 获取所有数据
    public getAllData(): Record<string, any> {
        return { ...this.handlerData };
    }

    // 检查Handler是否处于活动状态
    public isActive(): boolean {
        return this.get('state') === HandlerBase.STATE.ACTIVE;
    }

    // 获取Handler名称
    public getName(): string | undefined {
        return this.get('handler');
    }

    // 获取关联的Agent ID
    public getAgentId(): string | undefined {
        return this.get('idagent');
    }

    // 获取CID
    public getCid(): string | undefined {
        return this.get('cid');
    }

    // 设置CID
    public setCid(cid: string): void {
        this.set('cid', cid);
    }
}