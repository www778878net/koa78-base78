// 任务基类，提供数据字典和基础功能

export class TaskBase {
    // 数据字典 - 集成BaseSchema和workflow_task的字段
    public static readonly COLUMNS = [
        // BaseSchema基础字段
        'id', 'idpk', 'upby', 'uptime',
        'remark', 'remark2', 'remark3', 'remark4', 'remark5', 'remark6',
        // CidSchema字段
        'cid',
        // workflow_task特定字段
        'idworkflowinstance', 'idworkflowdefinition', 'idtaskdefinition',
        'taskname', 'handler', 'idagent',
        'state', 'priority', 'executionorder',
        'input', 'output', 'errinfo',
        'starttime', 'endtime', 'duration',
        'retrycount', 'maxretry', 'timeout',
        'resourceusage', 'cpuusage', 'memoryusage', 'diskusage',
        'networkusage', 'progress', 'percentcomplete',
        'dependencytaskids', 'dependenttaskids',
        'parenttaskid', 'childtaskids',
        'tasktype', 'tasksubtype',
        'targetsystem', 'targetendpoint',
        'createdby', 'createdtime',
        'lastmodifiedby', 'lastmodifiedtime',
        'assignee', 'approver',
        'approvalstatus', 'approvalcomments'
    ] as const;

    // 任务状态枚举
    public static readonly STATE = {
        PENDING: 'pending',
        RUNNING: 'running',
        COMPLETED: 'completed',
        FAILED: 'failed',
        CANCELLED: 'cancelled',
        PAUSED: 'paused',
        SKIPPED: 'skipped'
    } as const;

    // 基础属性
    protected taskData: Record<string, any> = {};

    constructor(taskData?: Partial<Record<typeof TaskBase.COLUMNS[number], any>>) {
        if (taskData) {
            this.taskData = taskData;
        }
    }

    // 获取指定字段的值
    public get<T = any>(field: typeof TaskBase.COLUMNS[number]): T | undefined {
        return this.taskData[field] as T;
    }

    // 设置指定字段的值
    public set(field: typeof TaskBase.COLUMNS[number], value: any): void {
        this.taskData[field] = value;
    }

    // 获取所有数据
    public getAllData(): Record<string, any> {
        return { ...this.taskData };
    }

    // 检查任务是否处于活动状态（pending, running, paused）
    public isActive(): boolean {
        const state = this.get('state') as string;
        const activeStates = [TaskBase.STATE.PENDING, TaskBase.STATE.RUNNING, TaskBase.STATE.PAUSED];
        return activeStates.includes(state as typeof activeStates[number]);
    }

    // 获取任务名称
    public getName(): string | undefined {
        return this.get('taskname');
    }

    // 获取任务状态
    public getState(): string | undefined {
        return this.get('state');
    }

    // 设置任务状态
    public setState(state: typeof TaskBase.STATE[keyof typeof TaskBase.STATE]): void {
        this.set('state', state);
    }

    // 获取任务输入数据
    public getInput(): any {
        const input = this.get('input');
        return typeof input === 'string' ? JSON.parse(input) : input;
    }

    // 设置任务输入数据
    public setInput(input: any): void {
        this.set('input', typeof input === 'string' ? input : JSON.stringify(input));
    }

    // 获取任务输出数据
    public getOutput(): any {
        const output = this.get('output');
        return typeof output === 'string' ? JSON.parse(output) : output;
    }

    // 设置任务输出数据
    public setOutput(output: any): void {
        this.set('output', typeof output === 'string' ? output : JSON.stringify(output));
    }

    // 获取错误信息
    public getErrorInfo(): string | undefined {
        return this.get('errinfo');
    }

    // 设置错误信息
    public setErrorInfo(errinfo: string): void {
        this.set('errinfo', errinfo);
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