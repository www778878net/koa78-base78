// src/workflow/handlers/param-validator.ts
import { StepHandler } from './step-handler-interface';
import { WorkflowStep } from '../workflow-engine';

export class ParamValidatorHandler implements StepHandler {
    async execute(step: WorkflowStep, context: any): Promise<any> {
        const { request, params } = context;
        const { required, types, rules } = step.config;

        // 合并请求体和URL参数
        const allParams = { ...request, ...params };

        // 验证必填字段
        if (required) {
            for (const field of required) {
                if (allParams[field] === undefined || allParams[field] === null) {
                    throw new Error(`Missing required parameter: ${field}`);
                }
            }
        }

        // 验证数据类型
        if (types) {
            for (const [field, type] of Object.entries(types)) {
                if (allParams[field] !== undefined && typeof allParams[field] !== type) {
                    throw new Error(`Parameter ${field} must be ${type}`);
                }
            }
        }

        // 验证自定义规则
        if (rules) {
            for (const [field, fieldRules] of Object.entries(rules)) {
                if (allParams[field] !== undefined) {
                    if (fieldRules.min !== undefined && allParams[field] < fieldRules.min) {
                        throw new Error(`Parameter ${field} must be at least ${fieldRules.min}`);
                    }
                    if (fieldRules.max !== undefined && allParams[field] > fieldRules.max) {
                        throw new Error(`Parameter ${field} must be at most ${fieldRules.max}`);
                    }
                    // 可添加更多规则验证
                }
            }
        }

        return { valid: true, params: allParams };
    }
}