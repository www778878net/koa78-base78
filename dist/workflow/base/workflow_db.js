"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowDB = void 0;
// WorkflowDB类 - 用于映射workflow表的字段
class WorkflowDB {
    constructor(json_data) {
        // 基本信息字段（数据库中必须的字段）
        this.cid = "";
        this.uid = "";
        this.idworkflow = "";
        this.wfname = "";
        this.description = "";
        this.version = "1.0.0";
        this.state = "active"; // active, inactive, draft, archived, error
        this.apiv = "";
        this.apisys = "";
        this.apiobj = "";
        // 数据字段
        this.inputdata = JSON.stringify({}); // 输入数据，JSON格式
        this.outputdata = JSON.stringify({}); // 输出数据，JSON格式
        this.flowschema = JSON.stringify({}); // 工作流结构定义，JSON格式
        this.starttask = "";
        // 时间信息
        this.starttime = new Date().toISOString(); // 开始时间
        this.endtime = "1900-01-01T00:00:00Z"; // 结束时间
        this.lastoktime = "1900-01-01T00:00:00Z"; // 最后成功时间
        this.errsec = "";
        // 执行信息
        this.progress = 0; // 工作流进度（百分比）
        this.lasterrinfo = "";
        this.lastokinfo = "";
        // 资源和并发
        this.max_concurrency = 1; // 最大并发任务数
        this.current_concurrency = 0; // 当前并发任务数
        // 重试和错误处理
        this.retry_count = 0; // 重试次数
        this.max_retries = 0; // 最大重试次数
        // 统计信息
        this.total_tasks = 0; // 总任务数
        this.completed_tasks = 0; // 已完成任务数
        this.failed_tasks = 0; // 失败任务数
        this.totalcost = 0;
        this.totalrevenue = 0;
        this.totalprofit = 0;
        this.roi = 0;
        this.runcount = 0;
        this.successcount = 0;
        this.errorcount = 0;
        this.successrate = 0;
        this.executiontime = 0;
        // 系统字段
        this.upby = "";
        this.uptime = new Date().toISOString(); // 更新时间
        this.idpk = null; // 自增主键
        this.id = "";
        this.remark = "";
        this.remark2 = "";
        this.remark3 = "";
        this.remark4 = "";
        this.remark5 = "";
        this.remark6 = "";
        if (json_data) {
            this.set_from_json(json_data);
        }
    }
    set_from_json(json_data) {
        for (const key in json_data) {
            if (Object.prototype.hasOwnProperty.call(json_data, key)) {
                this[key] = json_data[key];
            }
        }
        return this;
    }
    get_from_json() {
        const result = {};
        for (const key in this) {
            if (Object.prototype.hasOwnProperty.call(this, key)) {
                result[key] = this[key];
            }
        }
        return result;
    }
    update_progress(completed, total) {
        this.total_tasks = total;
        this.completed_tasks = completed;
        this.progress = total > 0 ? Math.round((completed / total) * 100) : 0;
        this.uptime = new Date().toISOString();
    }
}
exports.WorkflowDB = WorkflowDB;
//# sourceMappingURL=workflow_db.js.map