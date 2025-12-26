"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Task = void 0;
const tslib_1 = require("tslib");
const task_db_1 = require("./task_db");
class Task extends task_db_1.TaskDB {
    // 获取状态转换映射
    get transitions() {
        return this._transitions;
    }
    // 设置状态转换映射
    set transitions(value) {
        this._transitions = value || {};
    }
    constructor(taskData) {
        super(taskData);
        // 运行时状态（非数据库字段）
        this.status = "created"; // created, running, completed, failed
        this.result = null;
        this.error = null;
        // 支持条件流转的属性
        this._transitions = {};
    }
    // 检查任务是否处于活动状态（pending, running, paused）
    isActive() {
        const activeStates = [Task.STATE.PENDING, Task.STATE.RUNNING, Task.STATE.PAUSED];
        return activeStates.includes(this.state);
    }
    // 获取任务名称
    getName() {
        return this.taskname;
    }
    // 获取任务输入数据
    getInput() {
        return this.inputdata ? JSON.parse(this.inputdata) : {};
    }
    // 设置任务输入数据
    setInput(input) {
        this.inputdata = typeof input === 'string' ? input : JSON.stringify(input);
    }
    // 获取任务输出数据
    getOutput() {
        return this.outputdata ? JSON.parse(this.outputdata) : this.result;
    }
    // 设置任务输出数据
    setOutput(output) {
        this.outputdata = typeof output === 'string' ? output : JSON.stringify(output);
    }
    // 获取下一个可能执行的任务ID列表（向后兼容）
    get nextTasks() {
        return Object.values(this._transitions).map(transition => transition.task_id);
    }
    // 设置下一个可能执行的任务ID列表，并更新状态转换映射（向后兼容）
    set nextTasks(value) {
        const existingConditions = {};
        // 保存现有条件
        for (const transition of Object.values(this._transitions)) {
            if (transition.condition) {
                existingConditions[transition.task_id] = transition.condition;
            }
        }
        // 重建transitions
        const newTransitions = {};
        for (const taskId of value) {
            newTransitions[taskId] = {
                condition: existingConditions[taskId] || null,
                task_id: taskId
            };
        }
        this._transitions = newTransitions;
    }
    // 获取条件表达式字典（向后兼容）
    get conditions() {
        const conditions = {};
        for (const [key, transition] of Object.entries(this._transitions)) {
            if (transition.condition) {
                conditions[key] = transition.condition;
            }
        }
        return conditions;
    }
    // 设置条件表达式字典，并更新状态转换映射（向后兼容）
    set conditions(value) {
        for (const [taskId, condition] of Object.entries(value)) {
            if (taskId in this._transitions) {
                this._transitions[taskId].condition = condition;
            }
            else {
                // 如果任务ID不在transitions中，添加它
                this._transitions[taskId] = {
                    condition,
                    task_id: taskId
                };
            }
        }
    }
    // 执行任务
    execute(agent) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            console.log(`执行任务: ${this.getName()} (ID: ${this.id})`);
            this.status = "running";
            this.state = Task.STATE.RUNNING;
            this.runningstatus = 'running';
            this.starttime = new Date().toISOString();
            this.lastruntime = new Date().toISOString();
            try {
                // 获取输入数据
                const inputData = this.getInput();
                // 支持两种执行方式：通过Agent执行Handler或直接执行函数
                if (agent && this.handler) {
                    console.log(`通过Agent执行Handler ${this.handler}`);
                    this.result = yield agent.executeHandler(this.handler, inputData);
                }
                else if (this.taskFunction) {
                    console.log(`直接执行任务函数`);
                    this.result = yield this.taskFunction(inputData);
                }
                else {
                    console.log(`任务 ${this.getName()} 没有执行逻辑，标记为完成`);
                    this.result = null;
                }
                this.status = "completed";
                this.state = Task.STATE.COMPLETED;
                this.runningstatus = 'completed';
                this.endtime = new Date().toISOString();
                this.lastoktime = new Date().toISOString();
                this.progress = 100;
                this.setOutput(this.result);
                this.update_statistics(true);
                console.log(`任务 ${this.getName()} 执行完成`);
            }
            catch (e) {
                this.status = "failed";
                this.error = e instanceof Error ? e.message : String(e);
                this.state = Task.STATE.FAILED;
                this.runningstatus = 'failed';
                this.endtime = new Date().toISOString();
                this.lasterrortime = new Date().toISOString();
                this.lasterrinfo = this.error;
                this.update_statistics(false);
                console.log(`任务 ${this.getName()} 执行失败: ${this.error}`);
                this.result = null;
            }
            return this.result;
        });
    }
    // 评估条件，确定下一个要执行的任务ID列表
    evaluateConditions(workflowData) {
        if (Object.keys(this._transitions).length === 0) {
            return []; // 没有下一个任务
        }
        // 评估条件表达式
        const result = [];
        for (const transitionInfo of Object.values(this._transitions)) {
            const nextTaskId = transitionInfo.task_id;
            const condition = transitionInfo.condition;
            try {
                // 使用工作流数据作为上下文评估条件表达式
                if (condition) {
                    if (workflowData) {
                        // 在TypeScript中直接执行条件表达式有安全风险，这里简化处理
                        // 实际应用中应该使用更安全的表达式求值库
                        console.log(`条件: ${condition}, 上下文: ${JSON.stringify(workflowData)}`);
                        // 这里只是简单模拟，实际应该实现表达式求值
                        result.push(nextTaskId);
                    }
                    else {
                        // 如果没有工作流数据，默认不执行条件表达式
                        result.push(nextTaskId);
                    }
                }
                else {
                    // 条件为空，默认执行
                    result.push(nextTaskId);
                }
            }
            catch (e) {
                // 条件表达式评估失败，默认不执行该任务
                console.log(`条件表达式评估失败: ${condition}, 错误: ${e}`);
                continue;
            }
        }
        return result;
    }
    // 获取任务状态信息
    getStatus() {
        return {
            "task_id": this.id,
            "task_name": this.getName(),
            "status": this.status,
            "db_state": this.state,
            "progress": this.progress,
            "result": this.result,
            "error": this.error
        };
    }
}
exports.Task = Task;
// 任务状态枚举
Task.STATE = {
    PENDING: 'pending',
    RUNNING: 'running',
    COMPLETED: 'completed',
    FAILED: 'failed',
    CANCELLED: 'cancelled',
    PAUSED: 'paused',
    SKIPPED: 'skipped'
};
//# sourceMappingURL=task.js.map