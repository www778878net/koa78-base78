// Agent基类，提供数据字典和基础功能

export class AgentBase {
    // 数据字典 - 集成BaseSchema/CidSchema和workflow_agent的字段
    public static readonly COLUMNS = [
        // BaseSchema基础字段
        'id', 'idpk', 'upby', 'uptime',
        'remark', 'remark2', 'remark3', 'remark4', 'remark5', 'remark6',
        // CidSchema字段
        'cid',
        // API 版本    API 系统    API 对象
        'apiv', 'apisys', 'apiobj',
        // 代理名称    描述
        'agentname', 'description',
        // 最大并发数
        'maxcopy',
        // 价格成本相关字段
        'pricebase', 'price', 'costunit', 'profittarget',
        'profittotal', 'costtotal', 'revenuetotal', 'roi',
        // 执行统计相关字段
        'successcount', 'runcount', 'successrate', 'errorcount',
        // 状态和配置
        'state', 'version', 'errsec',
        // 生命周期
        'starttime', 'endtime',
        // 描述信息
        'costdescription', 'pricedescription'
    ] as const;

    // Agent状态枚举
    public static readonly STATE = {
        ACTIVE: 'active',
        INACTIVE: 'inactive',
        MAINTENANCE: 'maintenance',
        ERROR: 'error'
    } as const;

    // 基础属性
    protected agentData: Record<string, any> = {};

    constructor(agentData?: Partial<Record<typeof AgentBase.COLUMNS[number], any>>) {
        if (agentData) {
            this.agentData = agentData;
        }
    }

    // 获取指定字段的值
    public get<T = any>(field: typeof AgentBase.COLUMNS[number]): T | undefined {
        return this.agentData[field] as T;
    }

    // 设置指定字段的值
    public set(field: typeof AgentBase.COLUMNS[number], value: any): void {
        this.agentData[field] = value;
    }

    // 获取所有数据
    public getAllData(): Record<string, any> {
        return { ...this.agentData };
    }

    // 检查Agent是否处于活动状态
    public isActive(): boolean {
        return this.get('state') === AgentBase.STATE.ACTIVE;
    }

    // 获取代理名称
    public getName(): string | undefined {
        return this.get('agentname');
    }

    // 获取最大并发数
    public getMaxCopy(): number | undefined {
        return this.get('maxcopy');
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