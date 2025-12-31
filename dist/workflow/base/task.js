"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Task = void 0;
const tslib_1 = require("tslib");
const task_db_1 = require("./task_db");
class Task extends task_db_1.TaskDB {
    // 获取下一个任务ID
    get nextTaskId() {
        return this._nextTaskId;
    }
    // 设置下一个任务ID
    set nextTaskId(value) {
        this._nextTaskId = value;
    }
    // 获取下一个任务的条件
    get nextTaskCondition() {
        return this._nextTaskCondition;
    }
    // 设置下一个任务的条件
    set nextTaskCondition(value) {
        this._nextTaskCondition = value;
    }
    constructor(json_data) {
        super(json_data);
        // 运行时状态（非数据库字段）
        this.result = null;
        // 支持条件流转的属性 - 只支持一个下级任务
        this._nextTaskId = null;
        this._nextTaskCondition = null;
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
    // 执行任务
    execute(agent) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            console.log(`执行任务: ${this.getName()} (ID: ${this.id})`);
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
                    // 直接使用handler名称调用
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
                this.state = Task.STATE.FAILED;
                this.runningstatus = 'failed';
                this.endtime = new Date().toISOString();
                this.lasterrortime = new Date().toISOString();
                this.lasterrinfo = e instanceof Error ? e.message : String(e);
                this.update_statistics(false);
                console.log(`任务 ${this.getName()} 执行失败: ${this.lasterrinfo}`);
                this.result = null;
            }
            return this.result;
        });
    }
    // 评估条件，确定下一个要执行的任务ID
    evaluateConditions(workflowData) {
        if (!this._nextTaskId) {
            return null; // 没有下一个任务
        }
        // 评估条件表达式
        const condition = this._nextTaskCondition;
        try {
            // 使用工作流数据作为上下文评估条件表达式
            if (condition) {
                if (workflowData) {
                    // 实现真正的条件评估，使用安全的表达式求值
                    const isConditionMet = this.evaluateCondition(condition, workflowData);
                    if (isConditionMet) {
                        console.log(`条件满足: ${condition}, 执行任务 ${this._nextTaskId}`);
                        return this._nextTaskId;
                    }
                    else {
                        console.log(`条件不满足: ${condition}, 跳过任务 ${this._nextTaskId}`);
                        return null;
                    }
                }
                else {
                    // 如果没有工作流数据，默认执行
                    return this._nextTaskId;
                }
            }
            else {
                // 条件为空，默认执行
                return this._nextTaskId;
            }
        }
        catch (e) {
            // 条件表达式评估失败，默认不执行该任务
            console.log(`条件表达式评估失败: ${condition}, 错误: ${e}`);
            return null;
        }
    }
    // 使用安全方式评估条件表达式
    evaluateCondition(condition, context) {
        // 简单的安全条件评估实现
        // 这里我们只支持一些基本的比较操作
        try {
            // 支持的条件模式:
            // 1. task_result.property === value
            // 2. task_result.property !== value
            // 3. task_result.property == value
            // 4. task_result.property != value
            // 5. task_result.property (直接检查值的真假)
            // 6. task_result.property && other_condition
            // 7. task_result.property || other_condition
            // 简单的条件解析
            condition = condition.trim();
            // 检查是否为简单的属性存在性检查
            if (!condition.includes(' ') && condition.startsWith('task_result.')) {
                const property = condition.replace('task_result.', '');
                const value = this.getNestedProperty(context.task_result, property);
                return !!value; // 转换为布尔值
            }
            // 处理复杂的条件表达式
            // 支持的操作符: ===, ==, !==, !=, >, <, >=, <=
            const operators = ['===', '==', '!==', '!=', '>=', '<=', '>', '<'];
            let matchedOperator = null;
            let operatorIndex = -1;
            for (const op of operators) {
                const index = condition.indexOf(op);
                if (index !== -1) {
                    matchedOperator = op;
                    operatorIndex = index;
                    break;
                }
            }
            if (matchedOperator && operatorIndex !== -1) {
                // 分割条件表达式
                const leftSide = condition.substring(0, operatorIndex).trim();
                const rightSide = condition.substring(operatorIndex + matchedOperator.length).trim();
                // 解析左侧（通常是task_result的属性）
                let actualValue;
                if (leftSide.startsWith('task_result.')) {
                    const property = leftSide.replace('task_result.', '');
                    actualValue = this.getNestedProperty(context.task_result, property);
                }
                else {
                    // 如果不是task_result开头，可能是一个更复杂的表达式，目前不支持
                    console.warn(`不支持的条件表达式左侧: ${leftSide}`);
                    return false;
                }
                // 解析右侧值
                let expectedValue;
                if (rightSide === 'true') {
                    expectedValue = true;
                }
                else if (rightSide === 'false') {
                    expectedValue = false;
                }
                else if (rightSide === 'null') {
                    expectedValue = null;
                }
                else if (rightSide === 'undefined') {
                    expectedValue = undefined;
                }
                else if (!isNaN(Number(rightSide))) {
                    expectedValue = Number(rightSide);
                }
                else {
                    // 假设是字符串，去除引号
                    expectedValue = rightSide.replace(/^["']|["']$/g, '');
                }
                // 根据操作符比较值
                switch (matchedOperator) {
                    case '===':
                        return actualValue === expectedValue;
                    case '==':
                        return actualValue == expectedValue;
                    case '!==':
                        return actualValue !== expectedValue;
                    case '!=':
                        return actualValue != expectedValue;
                    case '>':
                        return actualValue > expectedValue;
                    case '<':
                        return actualValue < expectedValue;
                    case '>=':
                        return actualValue >= expectedValue;
                    case '<=':
                        return actualValue <= expectedValue;
                    default:
                        return false;
                }
            }
            // 如果不匹配任何已知模式，返回false
            return false;
        }
        catch (e) {
            console.error(`评估条件时出错: ${e}`);
            return false;
        }
    }
    // 辅助方法：获取嵌套属性
    getNestedProperty(obj, path) {
        return path.split('.').reduce((current, prop) => {
            return current && current[prop] !== undefined ? current[prop] : undefined;
        }, obj);
    }
    // 获取任务状态信息
    getStatus() {
        return {
            "task_id": this.id,
            "task_name": this.getName(),
            "status": this.state,
            "progress": this.progress,
            "result": this.result,
            "error": this.lasterrinfo
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