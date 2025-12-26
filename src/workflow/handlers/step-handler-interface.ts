// src/workflow/handlers/step-handler-interface.ts
import { WorkflowStep } from '../workflow-engine';

// 步骤处理器接口
export interface StepHandler {
    execute(step: WorkflowStep, context: any): Promise<any>;
}