// src/workflow/workflow-engine.ts
import { Context } from 'koa';
import { StepHandler } from './handlers/step-handler-interface';

// 工作流定义接口
export interface WorkflowDefinition {
    name: string;
    steps: WorkflowStep[];
    output?: Record<string, string>;
}

// 工作流步骤接口
export interface WorkflowStep {
    id: string;
    type: string;
    config: any;
    next?: string;
    condition?: string;
}

// 工作流引擎类
export class WorkflowEngine {
    private stepHandlers: Record<string, StepHandler> = {};

    constructor() {
        this.registerDefaultHandlers();
    }

    // 注册默认处理器
    private registerDefaultHandlers(): void {
        // 延迟导入以避免循环依赖
        import('./handlers/param-validator').then(module => {
            this.registerHandler('param-validator', new module.ParamValidatorHandler());
        });

        import('./handlers/db-query').then(module => {
            this.registerHandler('db-query', new module.DatabaseQueryHandler());
        });

        import('./handlers/result-formatter').then(module => {
            this.registerHandler('result-formatter', new module.ResultFormatterHandler());
        });
    }

    // 注册自定义处理器
    public registerHandler(type: string, handler: StepHandler): void {
        this.stepHandlers[type] = handler;
    }

    // 执行工作流
    public async execute(workflow: WorkflowDefinition, ctx: Context): Promise<any> {
        const context = {
            request: ctx.request.body || {},
            params: ctx.params,
            ctx: ctx,
            result: {}
        };

        // 执行每个步骤
        for (const step of workflow.steps) {
            const handler = this.stepHandlers[step.type];
            if (!handler) {
                throw new Error(`No handler found for step type: ${step.type}`);
            }

            // 执行步骤
            const stepResult = await handler.execute(step, context);
            context.result[step.id] = stepResult;

            // 处理条件分支
            if (step.condition && step.next) {
                if (this.evaluateCondition(step.condition, context)) {
                    // 跳转到指定步骤
                    const nextStepIndex = workflow.steps.findIndex(s => s.id === step.next);
                    if (nextStepIndex !== -1) {
                        workflow.steps = workflow.steps.slice(nextStepIndex);
                    }
                }
            }
        }

        // 构建输出结果
        if (workflow.output) {
            return this.buildOutput(workflow.output, context.result);
        }

        return context.result;
    }

    // 评估条件表达式
    private evaluateCondition(condition: string, context: any): boolean {
        // 简单实现，实际项目中可使用更复杂的表达式解析器
        try {
            // 使用Function构造函数安全地评估条件
            const func = new Function('context', `return ${condition};`);
            return func(context);
        } catch (error) {
            throw new Error(`Invalid condition expression: ${condition}`);
        }
    }

    // 构建输出结果
    private buildOutput(outputMap: Record<string, string>, result: any): any {
        const output: any = {};

        for (const [key, path] of Object.entries(outputMap)) {
            output[key] = this.resolvePath(path, result);
        }

        return output;
    }

    // 解析路径
    private resolvePath(path: string, result: any): any {
        const parts = path.split('.');
        let value = result;

        for (const part of parts) {
            if (value === undefined || value === null) return undefined;

            if (part.includes('[')) {
                // 处理数组索引，如 result[0]
                const [arrayKey, index] = part.replace(']', '').split('[');
                value = value[arrayKey][parseInt(index)];
            } else {
                value = value[part];
            }
        }

        return value;
    }
}