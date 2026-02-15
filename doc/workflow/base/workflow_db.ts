// WorkflowDB类 - 用于映射workflow表的字段
export class WorkflowDB {
    // 基本信息字段（数据库中必须的字段）
    public cid: string = "";
    public uid: string = "";
    public idworkflow: string = "";
    public wfname: string = "";
    public description: string = "";
    public version: string = "1.0.0";
    public state: string = "active";  // active, inactive, draft, archived, error
    public apisys: string = "";
    public apimicro: string = "";
    public apiobj: string = "";

    // 数据字段
    public inputdata: string = JSON.stringify({});  // 输入数据，JSON格式
    public outputdata: string = JSON.stringify({});  // 输出数据，JSON格式
    public flowschema: string = JSON.stringify({});  // 工作流结构定义，JSON格式
    public starttask: string = "";

    // 时间信息
    public starttime: string = new Date().toISOString();  // 开始时间
    public endtime: string = "1900-01-01T00:00:00Z";  // 结束时间
    public lastoktime: string = "1900-01-01T00:00:00Z";  // 最后成功时间
    public errsec: string = "";

    // 执行信息
    public progress: number = 0;  // 工作流进度（百分比）
    public lasterrinfo: string = "";
    public lastokinfo: string = "";

    // 资源和并发
    public max_concurrency: number = 1;  // 最大并发任务数
    public current_concurrency: number = 0;  // 当前并发任务数

    // 重试和错误处理
    public retry_count: number = 0;  // 重试次数
    public max_retries: number = 0;  // 最大重试次数

    // 统计信息
    public total_tasks: number = 0;  // 总任务数
    public completed_tasks: number = 0;  // 已完成任务数
    public failed_tasks: number = 0;  // 失败任务数
    public totalcost: number = 0;
    public totalrevenue: number = 0;
    public totalprofit: number = 0;
    public roi: number = 0;
    public runcount: number = 0;
    public successcount: number = 0;
    public errorcount: number = 0;
    public successrate: number = 0;
    public executiontime: number = 0;

    // 系统字段
    public upby: string = "";
    public uptime: string = new Date().toISOString();  // 更新时间
    public idpk: number | null = null;  // 自增主键
    public id: string = "";
    public remark: string = "";
    public remark2: string = "";
    public remark3: string = "";
    public remark4: string = "";
    public remark5: string = "";
    public remark6: string = "";

    constructor(json_data?: Record<string, any>) {
        if (json_data) {
            this.set_from_json(json_data);
        }
    }

    public set_from_json(json_data: Record<string, any>): this {
        for (const key in json_data) {
            if (Object.prototype.hasOwnProperty.call(json_data, key)) {
                (this as any)[key] = json_data[key];
            }
        }
        return this;
    }

    public get_from_json(): Record<string, any> {
        const result: Record<string, any> = {};

        for (const key in this) {
            if (Object.prototype.hasOwnProperty.call(this, key)) {
                result[key] = (this as any)[key];
            }
        }

        return result;
    }

    public update_progress(completed: number, total: number): void {
        this.total_tasks = total;
        this.completed_tasks = completed;
        this.progress = total > 0 ? Math.round((completed / total) * 100) : 0;
        this.uptime = new Date().toISOString();
    }
}