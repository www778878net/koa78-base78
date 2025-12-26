import { WorkflowContext } from '../models/WorkflowModels';

// 步骤处理器接口
export interface StepHandler {
    // 处理器类型
    type: string;

    // 执行步骤
    execute(context: WorkflowContext): Promise<boolean>;

    // 回滚步骤（可选）
    rollback?(context: WorkflowContext): Promise<boolean>;

    // 重试步骤（可选）
    retry?(context: WorkflowContext): Promise<boolean>;
}

// 处理器注册中心接口
export interface HandlerRegistry {
    // 注册处理器
    registerHandler(type: string, handler: StepHandler): void;

    // 获取处理器
    getHandler(type: string): StepHandler | undefined;

    // 检查处理器是否存在
    hasHandler(type: string): boolean;

    // 获取所有注册的处理器类型
    getRegisteredTypes(): string[];
}