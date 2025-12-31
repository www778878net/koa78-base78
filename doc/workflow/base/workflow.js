"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Workflow = void 0;
const tslib_1 = require("tslib");
// 工作流定义类，提供数据字典和基础功能
const task_1 = require("./task");
const workflow_db_1 = require("./workflow_db");
class Workflow extends workflow_db_1.WorkflowDB {
    constructor(workflowData) {
        super(workflowData);
        // 运行时状态（非数据库字段）
        this.status = "created"; // created, running, completed, failed, cancelled
        this.tasks = []; // 任务列表
        this.current_task = null; // 当前执行的任务实例
        this.task_results = {}; // 任务执行结果
        this.errors = []; // 执行错误列表 
        // 如果提供了flowschema，自动加载任务
        const flowschema = this.getFlowSchema();
        if (flowschema) {
            this.load_tasks_from_flowschema();
        }
    }
    // 检查工作流是否处于活动状态
    isActive() {
        return this.state === Workflow.STATE.ACTIVE;
    }
    // 获取工作流名称
    getName() {
        return this.wfname;
    }
    // 获取工作流版本
    getVersion() {
        return this.version;
    }
    // 获取工作流结构
    getFlowSchema() {
        return typeof this.flowschema === 'string' ? JSON.parse(this.flowschema) : this.flowschema;
    }
    // 设置工作流结构
    setFlowSchema(schema) {
        this.flowschema = typeof schema === 'string' ? schema : JSON.stringify(schema);
        // 重新加载任务
        this.load_tasks_from_flowschema();
    }
    // 添加任务到工作流
    add_task(task) {
        this.tasks.push(task);
        // 设置任务的工作流实例ID
        task.idworkflowinstance = this.id;
    }
    // 执行工作流，支持条件任务流转
    execute(agent) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            console.log(`执行工作流: ${this.wfname} (ID: ${this.id})`);
            this.status = "running";
            try {
                // 更新状态到数据库
                this.state = 'running';
                // 创建任务ID到任务对象的映射
                const task_map = {};
                this.tasks.forEach(task => {
                    const taskId = task.id;
                    if (taskId) {
                        task_map[taskId] = task;
                    }
                });
                // 创建已执行任务集合
                const executed_tasks = new Set();
                // 创建任务队列，初始包含所有没有前置任务的任务
                const task_queue = [];
                // 简单实现：假设第一个任务是初始任务
                // 更复杂的实现需要检测任务的依赖关系
                if (this.tasks.length > 0) {
                    task_queue.push(this.tasks[0]);
                }
                // 执行任务直到队列为空
                while (task_queue.length > 0) {
                    // 获取当前任务
                    const task = task_queue.shift();
                    const taskId = task.id;
                    // 如果任务已经执行过，跳过
                    if (taskId && executed_tasks.has(taskId)) {
                        continue;
                    }
                    console.log(`\n执行任务: ${task.getName()} (ID: ${taskId})`);
                    // 更新当前任务信息
                    this.current_task = task;
                    // 执行任务
                    // 设置输入数据
                    let inputData = {};
                    if (Object.keys(this.task_results).length === 0) {
                        // 第一个任务，合并工作流输入数据和任务输入数据
                        try {
                            // 获取工作流输入数据
                            const workflowInputData = this.inputdata ? JSON.parse(this.inputdata) : {};
                            // 获取任务输入数据
                            const taskInputData = task.getInput();
                            // 合并两个输入数据，任务输入数据优先级更高
                            inputData = Object.assign(Object.assign({}, workflowInputData), taskInputData);
                            console.log(`   为第一个任务设置合并的输入数据: ${JSON.stringify(inputData)}`);
                        }
                        catch (error) {
                            console.error('解析任务或工作流输入数据失败:', error);
                            // 出错时使用空对象
                            inputData = {};
                        }
                    }
                    else {
                        // 不是第一个任务，将当前任务的直接前驱任务结果作为输入数据
                        // 查找当前任务的直接前驱任务
                        let prevTaskId = null;
                        // 遍历所有已执行的任务，找到直接流转到当前任务的任务
                        for (const t of this.tasks) {
                            if (executed_tasks.has(t.id) && t.nextTaskId === task.id) {
                                prevTaskId = t.id;
                                break;
                            }
                        }
                        if (prevTaskId && this.task_results[prevTaskId]) {
                            // 使用直接前驱任务的执行结果
                            inputData = this.task_results[prevTaskId];
                            console.log(`   为任务 ${task.id} 设置前驱任务 ${prevTaskId} 的结果作为输入: ${JSON.stringify(inputData)}`);
                        }
                        else {
                            // 如果没有找到直接前驱任务，使用最后一个执行的任务结果
                            const taskResultValues = Object.values(this.task_results);
                            if (taskResultValues.length > 0) {
                                const lastResult = taskResultValues[taskResultValues.length - 1];
                                inputData = lastResult;
                                console.log(`   为任务 ${task.id} 设置最后执行任务的结果作为输入: ${JSON.stringify(inputData)}`);
                            }
                            else {
                                console.log(`   为任务 ${task.id} 设置空输入数据`);
                            }
                        }
                    }
                    task.setInput(inputData);
                    const result = yield task.execute(agent);
                    // 保存任务结果
                    if (taskId) {
                        this.task_results[taskId] = result;
                    }
                    // 标记任务为已执行
                    if (taskId) {
                        executed_tasks.add(taskId);
                    }
                    // 检查任务执行状态
                    if (task.state === task_1.Task.STATE.FAILED) {
                        this.status = "failed";
                        const errorMsg = `任务 ${task.getName()} 执行失败: ${task.lasterrinfo}`;
                        this.errors.push(errorMsg);
                        // 更新状态到数据库
                        this.state = 'failed';
                        this.lasterrinfo = errorMsg;
                        // 构建包含错误信息的上下文数据
                        const errorContextData = {
                            'task_result': { error: task.lasterrinfo, failed: true },
                            'task_results': this.task_results,
                            'workflow': this
                        };
                        // 尝试执行错误处理任务（如果有条件匹配）
                        const next_task_id = task.evaluateConditions(errorContextData);
                        if (next_task_id && next_task_id in task_map && !executed_tasks.has(next_task_id)) {
                            const errorTask = task_map[next_task_id];
                            console.log(`\n执行任务: ${errorTask.getName()} (ID: ${next_task_id})`);
                            // 设置错误任务的输入数据
                            errorTask.setInput({ error: task.lasterrinfo, failedTask: task.getName() });
                            // 执行错误处理任务
                            const errorResult = yield errorTask.execute(agent);
                            // 保存错误处理任务结果
                            this.task_results[next_task_id] = errorResult;
                            // 标记错误处理任务为已执行
                            executed_tasks.add(next_task_id);
                        }
                        // 执行完错误处理任务后，清空任务队列并终止循环
                        task_queue.length = 0;
                        break;
                    }
                    // 根据条件表达式确定下一个要执行的任务
                    // 构建上下文数据
                    const context_data = {
                        'task_result': result,
                        'task_results': this.task_results,
                        // 只传递关键的workflow信息，而不是整个实例
                        'workflow_context': {
                            id: this.id,
                            wfname: this.wfname,
                            state: this.state,
                            inputdata: this.inputdata,
                            outputdata: this.outputdata,
                            status: this.status,
                            tasks: this.tasks.map(t => ({
                                id: t.id,
                                taskname: t.taskname,
                                state: t.state
                            }))
                        }
                    };
                    const next_task_id = task.evaluateConditions(context_data);
                    // 将符合条件的下一个任务添加到队列
                    if (next_task_id && next_task_id in task_map && !executed_tasks.has(next_task_id)) {
                        const next_task = task_map[next_task_id];
                        task_queue.push(next_task);
                        console.log(`任务 ${task.getName()} 完成，根据条件流转到任务 ${next_task.getName()}`);
                    }
                }
                // 如果所有任务都成功完成
                if (this.status === "running") {
                    this.status = "completed";
                    // 更新输出数据
                    this.outputdata = JSON.stringify(this.task_results);
                    // 更新状态到数据库
                    this.state = 'completed';
                    this.lastokinfo = '所有任务执行完成';
                }
                console.log(`\n工作流 ${this.wfname} (ID: ${this.id}) 执行${this.status}`);
            }
            catch (e) {
                this.status = "failed";
                const error_msg = e instanceof Error ? e.message : String(e);
                this.errors.push(error_msg);
                // 更新状态到数据库
                this.state = 'failed';
                this.lasterrinfo = error_msg;
                console.log(`\n工作流 ${this.wfname} (ID: ${this.id}) 执行失败: ${error_msg}`);
            }
            return this.status;
        });
    }
    // 取消工作流
    cancel() {
        this.status = "cancelled";
        // 更新状态到数据库
        this.state = 'cancelled';
        console.log(`工作流 ${this.wfname} (ID: ${this.id}) 已取消`);
    }
    // 获取工作流状态信息
    get_status() {
        var _a;
        return {
            "id": this.id,
            "workflow_id": this.idworkflow,
            "state": this.state,
            "status": this.status,
            "current_task": (_a = this.current_task) === null || _a === void 0 ? void 0 : _a.getName(),
            "current_task_index": this.current_task ? this.tasks.indexOf(this.current_task) : -1,
            "tasks_count": this.tasks.length,
            "start_time": this.uptime,
            "end_time": this.status === "completed" || this.status === "failed" ? new Date().toISOString() : null,
            "errors": this.errors
        };
    }
    // 获取所有任务的执行结果
    get_task_results() {
        return this.task_results;
    }
    // 从flowschema字段加载工作流任务
    load_tasks_from_flowschema() {
        try {
            // 解析flowschema
            const schema = this.getFlowSchema();
            const tasks_data = (schema === null || schema === void 0 ? void 0 : schema.tasks) || [];
            // 清空现有任务列表
            this.tasks = [];
            // 创建每个任务
            for (const task_data of tasks_data) {
                // 构建任务参数
                const task_params = {
                    'id': task_data.id,
                    'taskname': task_data.name,
                    'handler': task_data.handler,
                    'inputdata': JSON.stringify(task_data.input_data || {})
                };
                // 创建Task实例
                const task = new task_1.Task(task_params);
                // 添加条件流转信息
                // 支持旧格式的transitions配置（向后兼容）
                if (task_data.transitions) {
                    const transitions = task_data.transitions;
                    const firstTransition = Object.values(transitions)[0];
                    if (firstTransition) {
                        task.nextTaskId = firstTransition.task_id;
                        task.nextTaskCondition = firstTransition.condition;
                    }
                }
                else if (task_data.next_tasks) {
                    // 支持旧格式的next_tasks（向后兼容）
                    task.nextTaskId = task_data.next_tasks[0] || null;
                }
                // 添加到工作流
                this.add_task(task);
            }
            console.log(`从flowschema加载了 ${this.tasks.length} 个任务`);
            return this.tasks.length;
        }
        catch (e) {
            console.log(`从flowschema加载任务失败: ${e}`);
            return 0;
        }
    }
}
exports.Workflow = Workflow;
// 工作流状态枚举
Workflow.STATE = {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    DRAFT: 'draft',
    ARCHIVED: 'archived',
    ERROR: 'error'
};
//# sourceMappingURL=workflow.js.map