import { Agent } from './agent';
import { TaskDB } from './task_db';
export declare class Task extends TaskDB {
    result: any;
    taskFunction?: (inputData: any) => Promise<any>;
    private _nextTaskId;
    private _nextTaskCondition;
    get nextTaskId(): string | null;
    set nextTaskId(value: string | null);
    get nextTaskCondition(): string | null;
    set nextTaskCondition(value: string | null);
    static readonly STATE: {
        readonly PENDING: "pending";
        readonly RUNNING: "running";
        readonly COMPLETED: "completed";
        readonly FAILED: "failed";
        readonly CANCELLED: "cancelled";
        readonly PAUSED: "paused";
        readonly SKIPPED: "skipped";
    };
    constructor(json_data?: Record<string, any>);
    isActive(): boolean;
    getName(): string | undefined;
    getInput(): any;
    setInput(input: any): void;
    getOutput(): any;
    setOutput(output: any): void;
    execute(agent?: Agent): Promise<any>;
    evaluateConditions(workflowData?: any): string | null;
    private evaluateCondition;
    private getNestedProperty;
    getStatus(): Record<string, any>;
}
