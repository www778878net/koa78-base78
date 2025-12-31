// TaskDB类 - 用于映射workflow_task表的字段
export class TaskDB {
    // 基本信息字段（数据库中必须的字段）
    public cid: string = "";
    public uid: string = "";
    public idworkflowinstance: string = "";
    public idworkflowdefinition: string = "";
    public idtaskdefinition: string = "";
    public taskname: string = "";
    public handler: string = "";
    public idagent: string = "";
    public state: string = "pending";  // pending待处理, running运行中, completed已完成, failed失败, cancelled已取消
    public priority: number = 99;  // 优先级，数字越小优先级越高

    // 时间信息
    public starttime: string = new Date().toISOString();  // 开始时间
    public endtime: string = "1900-01-01T00:00:00Z";  // 结束时间
    public lastruntime: string = "1900-01-01T00:00:00Z";  // 最后运行时间
    public lasterrortime: string = "1900-01-01T00:00:00Z";  // 最后错误时间
    public lastoktime: string = "1900-01-01T00:00:00Z";  // 最后成功时间
    public timeout: string = "1900-01-01T00:00:00Z";  // 超时时间

    // 数据
    public inputdata: string = JSON.stringify({});  // 输入数据，JSON格式
    public outputdata: string = JSON.stringify({});  // 输出数据，JSON格式

    // 执行信息
    public runningstatus: string = "idle";  // 运行状态
    public maxcopy: number = 1;  // 最大并发数
    public currentcopy: number = 0;  // 当前并发数
    public progress: number = 0;  // 任务进度（百分比）
    public retrytimes: number = 0;  // 重试次数
    public retrylimit: number = 3;  // 最大重试次数
    public retryinterval: number = 60;  // 重试间隔时间（秒）
    public maxruntime: number = 3600;  // 最大运行时间（秒）

    // 依赖关系
    public dependencies: string = JSON.stringify({});  // 依赖关系，JSON格式
    public prevtask: string = "";  // 上一个任务ID
    public nexttask: string = "";  // 下一个任务ID

    // 错误信息
    public lasterrinfo: string = "";  // 错误信息
    public lastokinfo: string = "";  // 成功信息
    public errsec: number = 0;  // 错误秒数

    // 统计
    public successcount: number = 0;  // 成功次数
    public errorcount: number = 0;  // 错误次数
    public runcount: number = 0;  // 运行次数

    // 财务
    public actualcost: number = 0.0;  // 实际成本
    public actualrevenue: number = 0.0;  // 实际收入
    public actualprofit: number = 0.0;  // 实际利润
    public executiontime: number = 0.0;  // 执行时间（秒）

    // 资源需求
    public resourcereq: string = JSON.stringify({});  // 资源需求，JSON格式

    // 系统字段
    public upby: string = "";
    public uptime: string = new Date().toISOString();  // 更新时间
    public idpk: number | null = null;  // 自增主键
    public id: string = "";  // 全局唯一ID
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

    public update_statistics(success: boolean, execution_time: number = 0.0, cost: number = 0.0, revenue: number = 0.0): void {
        // 更新执行计数
        this.runcount += 1;
        this.executiontime += execution_time;

        // 更新财务统计
        this.actualcost += cost;
        this.actualrevenue += revenue;
        this.actualprofit = this.actualrevenue - this.actualcost;

        // 更新时间信息
        const current_time = new Date().toISOString();
        this.lastruntime = current_time;

        if (success) {
            // 更新成功统计
            this.successcount += 1;
            this.lastoktime = current_time;
            this.lastokinfo = `执行成功，耗时: ${execution_time.toFixed(2)}秒`;
        } else {
            // 更新失败统计
            this.errorcount += 1;
            this.lasterrortime = current_time;
            this.lasterrinfo = `执行失败，耗时: ${execution_time.toFixed(2)}秒`;
        }
    }
}