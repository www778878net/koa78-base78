import { Agent } from './agent';
import { TaskDB } from './task_db';
export declare class Task extends TaskDB {
    status: string;
    result: any;
    error: string | null;
    taskFunction?: (inputData: any) => Promise<any>;
    private _transitions;
    get transitions(): Record<string, {
        condition: string | null;
        task_id: string;
    }>;
    set transitions(value: Record<string, {
        condition: string | null;
        task_id: string;
    }>);
    static readonly STATE: {
        readonly PENDING: "pending";
        readonly RUNNING: "running";
        readonly COMPLETED: "completed";
        readonly FAILED: "failed";
        readonly CANCELLED: "cancelled";
        readonly PAUSED: "paused";
        readonly SKIPPED: "skipped";
    };
    constructor(taskData?: Partial<Record<string, any>>);
    isActive(): boolean;
    getName(): string | undefined;
    getInput(): any;
    setInput(input: any): void;
    getOutput(): any;
    setOutput(output: any): void;
    get nextTasks(): string[];
    set nextTasks(value: string[]);
    get conditions(): Record<string, string>;
    set conditions(value: Record<string, string>);
    execute(agent?: Agent): Promise<any>;
    evaluateConditions(workflowData?: any): string[];
    getStatus(): Record<string, any>;
}
