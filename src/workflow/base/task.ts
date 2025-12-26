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
                        // 创建安全的求值环境
                        const context = {
                            ...workflowData,
                            // 提供一些常用的工具函数
                            get: (path: string, defaultValue?: any) => {
                                // 支持点号分隔的路径访问，如 "user.profile.age"
                                const keys = path.split('.');
                                let value = workflowData;
                                for (const key of keys) {
                                    if (value && typeof value === 'object' && key in value) {
                                        value = value[key];
                                    } else {
                                        return defaultValue;
                                    }
                                }
                                return value;
                            },
                            // 常用的比较函数
                            equals: (a: any, b: any) => a === b,
                            notEquals: (a: any, b: any) => a !== b,
                            greaterThan: (a: any, b: any) => a > b,
                            lessThan: (a: any, b: any) => a < b,
                            contains: (arr: any[], item: any) => arr?.includes?.(item),
                            hasProperty: (obj: any, prop: string) => obj && typeof obj === 'object' && prop in obj
                        };

                        // 安全地求值条件表达式
                        // 注意：在生产环境中应该使用专门的表达式求值库，如expr-eval
                        const safeEval = (expr: string, ctx: Record<string, any>): boolean => {
                            try {
                                // 将上下文对象的属性转换为可以直接使用的变量
                                // 这里使用Function构造函数创建一个函数，它接受上下文属性作为参数
                                // 这比直接使用eval更安全，因为它不会在当前作用域中执行
                                const vars = Object.keys(ctx);
                                const values = Object.values(ctx);
                                
                                // 创建一个返回表达式结果的函数
                                // eslint-disable-next-line no-new-func
                                const func = new Function(...vars, `return (${expr});`);
                                return Boolean(func(...values));
                            } catch (e) {
                                console.log(`条件表达式语法错误: ${expr}, 错误: ${e}`);
                                return false; // 语法错误时默认不满足条件
                            }
                        };

                        console.log(`条件: ${condition}, 上下文: ${JSON.stringify(workflowData)}`);
                        
                        // 求值条件表达式
                        const conditionResult = safeEval(condition, context);
                        
                        if (conditionResult) {
                            result.push(nextTaskId);
                        }
                    } else {
                        // 如果没有工作流数据，只有当条件为空时才执行
                        // 有具体条件但无数据时，认为条件不满足
                        console.log(`无法评估条件 ${condition}：缺少工作流数据`);
                        continue;
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