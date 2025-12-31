"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskDB = void 0;
// TaskDB类 - 用于映射workflow_task表的字段
class TaskDB {
    constructor(json_data) {
        // 基本信息字段（数据库中必须的字段）
        this.cid = "";
        this.uid = "";
        this.idworkflowinstance = "";
        this.idworkflowdefinition = "";
        this.idtaskdefinition = "";
        this.taskname = "";
        this.handler = "";
        this.idagent = "";
        this.state = "pending"; // pending待处理, running运行中, completed已完成, failed失败, cancelled已取消
        this.priority = 99; // 优先级，数字越小优先级越高
        // 时间信息
        this.starttime = new Date().toISOString(); // 开始时间
        this.endtime = "1900-01-01T00:00:00Z"; // 结束时间
        this.lastruntime = "1900-01-01T00:00:00Z"; // 最后运行时间
        this.lasterrortime = "1900-01-01T00:00:00Z"; // 最后错误时间
        this.lastoktime = "1900-01-01T00:00:00Z"; // 最后成功时间
        this.timeout = "1900-01-01T00:00:00Z"; // 超时时间
        // 数据
        this.inputdata = JSON.stringify({}); // 输入数据，JSON格式
        this.outputdata = JSON.stringify({}); // 输出数据，JSON格式
        // 执行信息
        this.runningstatus = "idle"; // 运行状态
        this.maxcopy = 1; // 最大并发数
        this.currentcopy = 0; // 当前并发数
        this.progress = 0; // 任务进度（百分比）
        this.retrytimes = 0; // 重试次数
        this.retrylimit = 3; // 最大重试次数
        this.retryinterval = 60; // 重试间隔时间（秒）
        this.maxruntime = 3600; // 最大运行时间（秒）
        // 依赖关系
        this.dependencies = JSON.stringify({}); // 依赖关系，JSON格式
        this.prevtask = ""; // 上一个任务ID
        this.nexttask = ""; // 下一个任务ID
        // 错误信息
        this.lasterrinfo = ""; // 错误信息
        this.lastokinfo = ""; // 成功信息
        this.errsec = 0; // 错误秒数
        // 统计
        this.successcount = 0; // 成功次数
        this.errorcount = 0; // 错误次数
        this.runcount = 0; // 运行次数
        // 财务
        this.actualcost = 0.0; // 实际成本
        this.actualrevenue = 0.0; // 实际收入
        this.actualprofit = 0.0; // 实际利润
        this.executiontime = 0.0; // 执行时间（秒）
        // 资源需求
        this.resourcereq = JSON.stringify({}); // 资源需求，JSON格式
        // 系统字段
        this.upby = "";
        this.uptime = new Date().toISOString(); // 更新时间
        this.idpk = null; // 自增主键
        this.id = ""; // 全局唯一ID
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
    update_statistics(success, execution_time = 0.0, cost = 0.0, revenue = 0.0) {
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
        }
        else {
            // 更新失败统计
            this.errorcount += 1;
            this.lasterrortime = current_time;
            this.lasterrinfo = `执行失败，耗时: ${execution_time.toFixed(2)}秒`;
        }
    }
}
exports.TaskDB = TaskDB;
//# sourceMappingURL=task_db.js.map