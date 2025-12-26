// src/workflow/handlers/db-query.ts
import { StepHandler } from './step-handler-interface';
import { WorkflowStep } from '../workflow-engine';
import { DatabaseService } from '../../services/DatabaseService';

export class DatabaseQueryHandler implements StepHandler {
    private dbService: DatabaseService;

    constructor() {
        this.dbService = DatabaseService.instance;
    }

    async execute(step: WorkflowStep, context: any): Promise<any> {
        const { request, params, ctx } = context;
        const { connection, driver, query, params: queryParams } = step.config;

        // 从所有可能的来源获取参数值
        const getParamValue = (paramKey: string) => {
            // 检查验证结果
            if (context.result['validate-params']?.params?.[paramKey] !== undefined) {
                return context.result['validate-params'].params[paramKey];
            }
            // 检查请求体
            if (request[paramKey] !== undefined) {
                return request[paramKey];
            }
            // 检查URL参数
            if (params[paramKey] !== undefined) {
                return params[paramKey];
            }
            // 检查上下文
            if (context[paramKey] !== undefined) {
                return context[paramKey];
            }
            return undefined;
        };

        // 解析参数值
        const resolvedParams = queryParams.map((paramKey: string) => getParamValue(paramKey));

        let result;
        if (driver === 'sqlite') {
            result = await this.dbService.sqliteGet(query, resolvedParams, ctx.up, connection);
        } else {
            result = await this.dbService.get(query, resolvedParams, ctx.up, connection);
        }

        return { result };
    }
}