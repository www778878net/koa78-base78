// src/workflow/handlers/result-formatter.ts
import { StepHandler } from './step-handler-interface';
import { WorkflowStep } from '../workflow-engine';

export class ResultFormatterHandler implements StepHandler {
    async execute(step: WorkflowStep, context: any): Promise<any> {
        const { exclude, include, transform } = step.config;
        let data = context.result['query-user']?.result || context.result['db-query']?.result;

        // 如果数据是数组，处理每个元素
        if (Array.isArray(data)) {
            return {
                result: data.map(item => this.formatItem(item, exclude, include, transform))
            };
        }

        // 否则处理单个对象
        return {
            result: this.formatItem(data, exclude, include, transform)
        };
    }

    private formatItem(item: any, exclude?: string[], include?: string[], transform?: Record<string, (value: any) => any>): any {
        let formattedItem: any = {};

        // 如果指定了include，则只包含指定的字段
        if (include) {
            for (const field of include) {
                if (item[field] !== undefined) {
                    formattedItem[field] = this.applyTransform(field, item[field], transform);
                }
            }
        } else {
            // 否则包含所有字段，排除exclude中的字段
            for (const [field, value] of Object.entries(item)) {
                if (!exclude || !exclude.includes(field)) {
                    formattedItem[field] = this.applyTransform(field, value, transform);
                }
            }
        }

        return formattedItem;
    }

    private applyTransform(field: string, value: any, transform?: Record<string, (value: any) => any>): any {
        if (transform && transform[field]) {
            try {
                return transform[field](value);
            } catch (error) {
                console.error(`Error applying transform to field ${field}:`, error);
                return value; // 转换失败时返回原始值
            }
        }
        return value;
    }
}