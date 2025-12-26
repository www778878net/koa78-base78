// 工作流定义类，提供数据字典和基础功能
import { Task } from './task';
import { Agent } from './agent';
import { WorkflowDB } from './workflow_db';

export class Workflow extends WorkflowDB {
    // 工作流状态枚举
    public static readonly STATE = {
        ACTIVE: 'active',
        INACTIVE: 'inactive',
        DRAFT: 'draft',
        ARCHIVED: 'archived',
        ERROR: 'error'
    } as const;

    // 运行时状态（非数据库字段）
    public status: string = "created"; // created, running, completed, failed, cancelled
    public tasks: Task[] = [];  // 任务列表
    public current_task: Task | null = null;  // 当前执行的任务实例
    public task_results: Record<string, any> = {};  // 任务执行结果
    public errors: string[] = [];  // 执行错误列表

    constructor(workflowData?: Partial<Record<string, any>>) {
        super(workflowData);

        // 如果提供了flowschema，自动加载任务
        const flowschema = this.getFlowSchema();
        if (flowschema) {
            this.load_tasks_from_flowschema();
        }
    }

    // 检查工作流是否处于活动状态
    public isActive(): boolean {
        return this.state === Workflow.STATE.ACTIVE;
    }

    // 获取工作流名称
    public getName(): string | undefined {
        return this.wfname;
    }

    // 获取工作流版本
    public getVersion(): string | undefined {
        return this.version;
    }

    // 获取工作流结构
    public getFlowSchema(): any {
        return typeof this.flowschema === 'string' ? JSON.parse(this.flowschema) : this.flowschema;
    }

    // 设置工作流结构
    public setFlowSchema(schema: any): void {
        this.flowschema = typeof schema === 'string' ? schema : JSON.stringify(schema);
        // 重新加载任务
        this.load_tasks_from_flowschema();
    }

    // 添加任务到工作流
    public add_task(task: Task): void {
        this.tasks.push(task);
        // 设置任务的工作流实例ID
        task.idworkflowinstance = this.id;
    }

    // 执行工作流，支持条件任务流转
    public async execute(agent?: Agent): Promise<string> {
        console.log(`执行工作流: ${this.wfname} (ID: ${this.id})`);
        this.status = "running";

        try {
            // 更新状态到数据库
            this.state = 'running';

            // 创建任务ID到任务对象的映射
            const task_map: Record<string, Task> = {};
            this.tasks.forEach(task => {
                const taskId = task.id;
                if (taskId) {
                    task_map[taskId] = task;
                }
            });

            // 创建已执行任务集合
            const executed_tasks = new Set<string>();

            // 创建任务队列，初始包含所有没有前置任务的任务
            const task_queue: Task[] = [];

            // 简单实现：假设第一个任务是初始任务
            // 更复杂的实现需要检测任务的依赖关系
            if (this.tasks.length > 0) {
                task_queue.push(this.tasks[0]);
            }

            // 执行任务直到队列为空
            while (task_queue.length > 0) {
                // 获取当前任务
                const task = task_queue.shift() as Task;
                const taskId = task.id;

                // 如果任务已经执行过，跳过
                if (taskId && executed_tasks.has(taskId)) {
                    continue;
                }

                console.log(`\n执行任务: ${task.getName()} (ID: ${taskId})`);

                // 更新当前任务信息
                this.current_task = task;

                // 执行任务
                const result = await task.execute(agent);

                // 保存任务结果
                if (taskId) {
                    this.task_results[taskId] = result;
                }

                // 标记任务为已执行
                if (taskId) {
                    executed_tasks.add(taskId);
                }

                // 检查任务执行状态
                if (task.status === "failed") {
                    this.status = "failed";
                    const errorMsg = `任务 ${task.getName()} 执行失败: ${task.error}`;
                    this.errors.push(errorMsg);
                    // 更新状态到数据库
                    this.state = 'failed';
                    this.lasterrinfo = errorMsg;
                    break;
                }

                // 根据条件表达式确定下一个要执行的任务
                // 构建上下文数据
                const context_data = {
                    'task_result': result,
                    'task_results': this.task_results,
                    'workflow': this
                };
                const next_task_ids = task.evaluateConditions(context_data);

                // 将符合条件的下一个任务添加到队列
                for (const next_task_id of next_task_ids) {
                    if (next_task_id in task_map && !executed_tasks.has(next_task_id)) {
                        const next_task = task_map[next_task_id];
                        task_queue.push(next_task);
                        console.log(`任务 ${task.getName()} 完成，根据条件流转到任务 ${next_task.getName()}`);
                    }
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

        } catch (e) {
            this.status = "failed";
            const error_msg = e instanceof Error ? e.message : String(e);
            this.errors.push(error_msg);
            // 更新状态到数据库
            this.state = 'failed';
            this.lasterrinfo = error_msg;
            console.log(`\n工作流 ${this.wfname} (ID: ${this.id}) 执行失败: ${error_msg}`);
        }

        return this.status;
    }

    // 取消工作流
    public cancel(): void {
        this.status = "cancelled";
        // 更新状态到数据库
        this.state = 'cancelled';
        console.log(`工作流 ${this.wfname} (ID: ${this.id}) 已取消`);
    }

    // 获取工作流状态信息
    public get_status(): Record<string, any> {
        return {
            "id": this.id,
            "workflow_id": this.idworkflow,
            "state": this.state,
            "status": this.status,
            "current_task": this.current_task?.getName(),
            "current_task_index": this.current_task ? this.tasks.indexOf(this.current_task) : -1,
            "tasks_count": this.tasks.length,
            "start_time": this.uptime,
            "end_time": this.status === "completed" || this.status === "failed" ? new Date().toISOString() : null,
            "errors": this.errors
        };
    }

    // 获取所有任务的执行结果
    public get_task_results(): Record<string, any> {
        return this.task_results;
    }

    // 从flowschema字段加载工作流任务
    public load_tasks_from_flowschema(): number {
        try {
            // 解析flowschema
            const schema = this.getFlowSchema();
            const tasks_data = schema?.tasks || [];

            // 清空现有任务列表
            this.tasks = [];

            // 创建每个任务
            for (const task_data of tasks_data) {
                // 构建任务参数
                const task_params: Partial<Record<string, any>> = {
                    'id': task_data.id,
                    'name': task_data.name,
                    'handler': task_data.handler,
                    'inputdata': JSON.stringify(task_data.input_data || {})
                };

                // 创建Task实例
                const task = new Task(task_params);

                // 添加条件流转信息
                if (task_data.next_tasks) {
                    task.nextTasks = task_data.next_tasks;
                }
                if (task_data.conditions) {
                    task.conditions = task_data.conditions;
                }
                // 支持直接加载transitions配置
                if (task_data.transitions) {
                    task.transitions = task_data.transitions;
                }

                // 添加到工作流
                this.add_task(task);
            }

            console.log(`从flowschema加载了 ${this.tasks.length} 个任务`);
            return this.tasks.length;

        } catch (e) {
            console.log(`从flowschema加载任务失败: ${e}`);
            return 0;
        }
    }
}