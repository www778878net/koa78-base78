// 工作流定义基类，提供数据字典和基础功能

export class WorkflowBase {
    // 数据字典 - 集成BaseSchema和workflow_definition的字段
    public static readonly COLUMNS = [
        // BaseSchema基础字段
        'id', 'idpk', 'upby', 'uptime',
        'remark', 'remark2', 'remark3', 'remark4', 'remark5', 'remark6',
        // CidSchema字段
        'cid',
        // workflow_definition特定字段
        // API 版本    API 系统    API 对象
        'apiv', 'apisys', 'apiobj',
        // 工作流名称    描述    版本    状态
        'wfname', 'description', 'version', 'state',
        // 工作流结构
        'starttask', 'flowschema',
        // 健康监控
        'lastoktime', 'lasterrinfo', 'lastokinfo', 'errsec',
        // 财务统计
        'totalcost', 'totalrevenue', 'totalprofit', 'roi',
        // 执行统计
        'runcount', 'successcount', 'errorcount', 'successrate', 'executiontime'
    ] as const;

    // 工作流状态枚举
    public static readonly STATE = {
        ACTIVE: 'active',
        INACTIVE: 'inactive',
        DRAFT: 'draft',
        ARCHIVED: 'archived',
        ERROR: 'error'
    } as const;

    // 基础属性
    protected workflowData: Record<string, any> = {};

    constructor(workflowData?: Partial<Record<typeof WorkflowBase.COLUMNS[number], any>>) {
        if (workflowData) {
            this.workflowData = workflowData;
        }
    }

    // 获取指定字段的值
    public get<T = any>(field: typeof WorkflowBase.COLUMNS[number]): T | undefined {
        return this.workflowData[field] as T;
    }

    // 设置指定字段的值
    public set(field: typeof WorkflowBase.COLUMNS[number], value: any): void {
        this.workflowData[field] = value;
    }

    // 获取所有数据
    public getAllData(): Record<string, any> {
        return { ...this.workflowData };
    }

    // 检查工作流是否处于活动状态
    public isActive(): boolean {
        return this.get('state') === WorkflowBase.STATE.ACTIVE;
    }

    // 获取工作流名称
    public getName(): string | undefined {
        return this.get('wfname');
    }

    // 获取工作流版本
    public getVersion(): string | undefined {
        return this.get('version');
    }

    // 获取CID
    public getCid(): string | undefined {
        return this.get('cid');
    }

    // 设置CID
    public setCid(cid: string): void {
        this.set('cid', cid);
    }

    // 获取工作流结构
    public getFlowSchema(): any {
        const flowschema = this.get('flowschema');
        return typeof flowschema === 'string' ? JSON.parse(flowschema) : flowschema;
    }

    // 设置工作流结构
    public setFlowSchema(schema: any): void {
        this.set('flowschema', typeof schema === 'string' ? schema : JSON.stringify(schema));
    }
}