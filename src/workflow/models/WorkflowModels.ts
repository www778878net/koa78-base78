import { WorkflowInstance } from '../../apiwf/basic/workflow_instance';
import { WorkflowTask } from '../../apiwf/basic/workflow_task';

// 工作流步骤定义接口
export interface WorkflowStep {
    id: string;
    name: string;
    type: string;
    nextStepId?: string;
    config: any;
}

// 工作流定义接口
export interface WorkflowDefinition {
    id: string;
    name: string;
    description: string;
    steps: WorkflowStep[];
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}

// 工作流实例接口（扩展自数据库模型）
export interface WorkflowInstanceModel extends Partial<WorkflowInstance> {
    workflowId: string;
    status: 'pending' | 'running' | 'completed' | 'failed' | 'paused';
    variables: Record<string, any>;
    currentStepId?: string;
    createdAt: Date;
    updatedAt: Date;
}

// 工作流任务接口（扩展自数据库模型）
export interface WorkflowTaskModel extends Partial<WorkflowTask> {
    instanceId: string;
    stepId: string;
    status: 'pending' | 'running' | 'completed' | 'failed' | 'retried';
    result: any;
    error?: string;
    retries: number;
    createdAt: Date;
    updatedAt: Date;
}

// 工作流上下文接口
export interface WorkflowContext {
    instance: WorkflowInstanceModel;
    task: WorkflowTaskModel;
    variables: Record<string, any>;
    getVariable: <T>(key: string) => T;
    setVariable: (key: string, value: any) => void;
}