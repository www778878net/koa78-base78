// WorkflowEngine.ts - 工作流引擎核心实现

import { WorkflowDefinition, WorkflowInstance, WorkflowTask, WorkflowStep } from './models/WorkflowModels';
import { HandlerRegistry } from './handlers/StepHandler';
import globalHandlerRegistry from './handlers/HandlerRegistryImpl';

/**
 * 工作流引擎类
 */
export class WorkflowEngine {
    private handlerRegistry: HandlerRegistry;

    /**
     * 构造函数
     * @param handlerRegistry 处理器注册器（可选，默认使用全局注册器）
     */
    constructor(handlerRegistry?: HandlerRegistry) {
        this.handlerRegistry = handlerRegistry || globalHandlerRegistry;
    }

    /**
     * 加载工作流定义
     * @param definition 工作流定义
     * @returns 工作流定义对象
     */
    loadWorkflowDefinition(definition: any): WorkflowDefinition {
        // 此处应该实现工作流定义的验证和解析逻辑
        // 目前简单返回定义对象
        return definition as WorkflowDefinition;
    }

    /**
     * 创建工作流实例
     * @param definition 工作流定义
     * @param inputData 输入数据
     * @returns 工作流实例
     */
    createWorkflowInstance(definition: WorkflowDefinition, inputData: any): WorkflowInstance {
        const instance: WorkflowInstance = {
            id: this.generateId(),
            idpk: 0,
            upby: 'system',
            uptime: new Date(),
            cid: definition.cid,
            uid: '',
            apiv: definition.apiv,
            apisys: definition.apisys,
            apiobj: definition.apiobj,
            idworkflow: definition.id,
            state: 'created',
            priority: 0,
            flowschema: definition.flowschema,
            starttime: new Date(),
            endtime: new Date(0),
            lastruntime: new Date(),
            lasterrortime: new Date(0),
            lastoktime: new Date(),
            inputdata: inputData,
            outputdata: {},
            currenttask: definition.starttask,
            currenttaskindex: 0,
            runningstatus: 'idle',
            maxcopy: 1,
            currentcopy: 1,
            lasterrinfo: '',
            lastokinfo: '',
            errsec: 0,
            successcount: 0,
            runcount: 0,
            successrate: 0,
            errorcount: 0,
            actualcost: 0,
            actualrevenue: 0,
            actualprofit: 0,
            executiontime: 0
        };

        return instance;
    }

    /**
     * 启动工作流实例
     * @param instance 工作流实例
     * @returns 工作流实例
     */
    async startWorkflow(instance: WorkflowInstance): Promise<WorkflowInstance> {
        instance.state = 'running';
        instance.runningstatus = 'active';
        instance.starttime = new Date();
        instance.lastruntime = new Date();

        try {
            // 执行工作流
            const result = await this.executeWorkflow(instance);
            instance.outputdata = result;
            instance.state = 'completed';
            instance.runningstatus = 'done';
            instance.endtime = new Date();
            instance.lastoktime = new Date();
            instance.successcount++;
        } catch (error) {
            instance.state = 'failed';
            instance.runningstatus = 'error';
            instance.endtime = new Date();
            instance.lasterrortime = new Date();
            instance.lasterrinfo = error instanceof Error ? error.message : 'Unknown error';
            instance.errorcount++;
        }

        instance.runcount++;
        instance.executiontime = instance.endtime.getTime() - instance.starttime.getTime();

        return instance;
    }

    /**
     * 执行工作流
     * @param instance 工作流实例
     * @returns 工作流执行结果
     */
    private async executeWorkflow(instance: WorkflowInstance): Promise<any> {
        const context = {
            input: instance.inputdata,
            output: {},
            variables: {},
            instance: instance
        };

        // 获取工作流定义
        const definition = instance.flowschema;

        // 从起始任务开始执行
        let currentTaskId = instance.starttask;

        while (currentTaskId) {
            const step = definition.steps[currentTaskId];

            if (!step) {
                throw new Error(`Task ${currentTaskId} not found in workflow definition`);
            }

            // 执行步骤
            const result = await this.executeStep(step, context);

            // 更新上下文
            Object.assign(context.output, result);

            // 获取下一个任务ID
            currentTaskId = this.getNextTaskId(step, result, context);
        }

        return context.output;
    }

    /**
     * 执行单个步骤
     * @param step 步骤定义
     * @param context 执行上下文
     * @returns 步骤执行结果
     */
    private async executeStep(step: WorkflowStep, context: any): Promise<any> {
        // 获取处理器
        const handler = this.handlerRegistry.getHandler(step.type);

        if (!handler) {
            throw new Error(`Handler for step type '${step.type}' not found`);
        }

        // 执行步骤
        return await handler.execute(step, context);
    }

    /**
     * 获取下一个任务ID
     * @param step 当前步骤
     * @param result 当前步骤执行结果
     * @param context 执行上下文
     * @returns 下一个任务ID
     */
    private getNextTaskId(step: WorkflowStep, result: any, context: any): string | null {
        // 简单实现：如果步骤有next属性，则返回next，否则返回null
        // 更复杂的实现可以包含条件分支逻辑
        return step.next || null;
    }

    /**
     * 生成唯一ID
     * @returns 唯一ID字符串
     */
    private generateId(): string {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
}

// 创建全局工作流引擎实例
const globalWorkflowEngine = new WorkflowEngine();

export default globalWorkflowEngine;