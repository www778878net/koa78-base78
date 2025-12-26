// 任务类，提供数据字典和基础功能
import { Agent } from './agent';
import { TaskDB } from './task_db';

export class Task extends TaskDB {
    // 运行时状态（非数据库字段）
    public status: string = "created"; // created, running, completed, failed
    public result: any = null;
    public error: string | null = null;

    // 任务执行函数
    public taskFunction?: (inputData: any) => Promise<any>;

    // 支持条件流转的属性
    private _transitions: Record<string, { condition: string | null; task_id: string }> = {};

    // 获取状态转换映射
    public get transitions(): Record<string, { condition: string | null; task_id: string }> {
        return this._transitions;
    }

    // 设置状态转换映射
    public set transitions(value: Record<string, { condition: string | null; task_id: string }>) {
        this._transitions = value || {};
    }

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

    constructor(taskData?: Partial<Record<string, any>>) {
        super(taskData);
    }

    // 检查任务是否处于活动状态（pending, running, paused）
    public isActive(): boolean {
        const activeStates = [Task.STATE.PENDING, Task.STATE.RUNNING, Task.STATE.PAUSED];
        return activeStates.includes(this.state as typeof activeStates[number]);
    }

    // 获取任务名称
    public getName(): string | undefined {
        return this.taskname;
    }

    // 获取任务输入数据
    public getInput(): any {
        return this.inputdata ? JSON.parse(this.inputdata) : {};
    }

    // 设置任务输入数据
    public setInput(input: any): void {
        this.inputdata = typeof input === 'string' ? input : JSON.stringify(input);
    }

    // 获取任务输出数据
    public getOutput(): any {
        return this.outputdata ? JSON.parse(this.outputdata) : this.result;
    }

    // 设置任务输出数据
    public setOutput(output: any): void {
        this.outputdata = typeof output === 'string' ? output : JSON.stringify(output);
    }

    // 获取下一个可能执行的任务ID列表（向后兼容）
    public get nextTasks(): string[] {
        return Object.values(this._transitions).map(transition => transition.task_id);
    }

    // 设置下一个可能执行的任务ID列表，并更新状态转换映射（向后兼容）
    public set nextTasks(value: string[]) {
        const existingConditions: Record<string, string | null> = {};

        // 保存现有条件
        for (const transition of Object.values(this._transitions)) {
            if (transition.condition) {
                existingConditions[transition.task_id] = transition.condition;
            }
        }

        // 重建transitions
        const newTransitions: Record<string, { condition: string | null; task_id: string }> = {};
        for (const taskId of value) {
            newTransitions[taskId] = {
                condition: existingConditions[taskId] || null,
                task_id: taskId
            };
        }

        this._transitions = newTransitions;
    }

    // 获取条件表达式字典（向后兼容）
    public get conditions(): Record<string, string> {
        const conditions: Record<string, string> = {};

        for (const [key, transition] of Object.entries(this._transitions)) {
            if (transition.condition) {
                conditions[key] = transition.condition;
            }
        }

        return conditions;
    }

    // 设置条件表达式字典，并更新状态转换映射（向后兼容）
    public set conditions(value: Record<string, string>) {
        for (const [taskId, condition] of Object.entries(value)) {
            if (taskId in this._transitions) {
                this._transitions[taskId].condition = condition;
            } else {
                // 如果任务ID不在transitions中，添加它
                this._transitions[taskId] = {
                    condition,
                    task_id: taskId
                };
            }
        }
    }

    // 执行任务
    public async execute(agent?: Agent): Promise<any> {
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
                // 解析handler字符串，格式为"type:capability"
                const [type, capability] = this.handler.split(":");
                this.result = await agent.executeHandler(type, capability, inputData);
            } else if (this.taskFunction) {
                console.log(`直接执行任务函数`);
                this.result = await this.taskFunction(inputData);
            } else {
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

        } catch (e) {
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
    }

    // 评估条件，确定下一个要执行的任务ID列表
    public evaluateConditions(workflowData?: any): string[] {
        if (Object.keys(this._transitions).length === 0) {
            return []; // 没有下一个任务
        }

        // 评估条件表达式
        const result: string[] = [];

        for (const transitionInfo of Object.values(this._transitions)) {
            const nextTaskId = transitionInfo.task_id;
            const condition = transitionInfo.condition;

            try {
                // 使用工作流数据作为上下文评估条件表达式
                if (condition) {
                    if (workflowData) {
                        // 实现真正的条件评估，使用安全的表达式求值
                        const isConditionMet = this.evaluateCondition(condition, workflowData);
                        if (isConditionMet) {
                            result.push(nextTaskId);
                            console.log(`条件满足: ${condition}, 添加任务 ${nextTaskId}`);
                        } else {
                            console.log(`条件不满足: ${condition}, 跳过任务 ${nextTaskId}`);
                        }
                    } else {
                        // 如果没有工作流数据，默认不执行条件表达式
                        result.push(nextTaskId);
                    }
                } else {
                    // 条件为空，默认执行
                    result.push(nextTaskId);
                }
            } catch (e) {
                // 条件表达式评估失败，默认不执行该任务
                console.log(`条件表达式评估失败: ${condition}, 错误: ${e}`);
                continue;
            }
        }

        return result;
    }

    // 使用安全方式评估条件表达式
    private evaluateCondition(condition: string, context: any): boolean {
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
            let matchedOperator: string | null = null;
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
                } else {
                    // 如果不是task_result开头，可能是一个更复杂的表达式，目前不支持
                    console.warn(`不支持的条件表达式左侧: ${leftSide}`);
                    return false;
                }

                // 解析右侧值
                let expectedValue;
                if (rightSide === 'true') {
                    expectedValue = true;
                } else if (rightSide === 'false') {
                    expectedValue = false;
                } else if (rightSide === 'null') {
                    expectedValue = null;
                } else if (rightSide === 'undefined') {
                    expectedValue = undefined;
                } else if (!isNaN(Number(rightSide))) {
                    expectedValue = Number(rightSide);
                } else {
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
        } catch (e) {
            console.error(`评估条件时出错: ${e}`);
            return false;
        }
    }

    // 辅助方法：获取嵌套属性
    private getNestedProperty(obj: any, path: string): any {
        return path.split('.').reduce((current, prop) => {
            return current && current[prop] !== undefined ? current[prop] : undefined;
        }, obj);
    }

    // 获取任务状态信息
    public getStatus(): Record<string, any> {
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