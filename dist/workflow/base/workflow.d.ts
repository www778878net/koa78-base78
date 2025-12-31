import { Task } from './task';
import { Agent } from './agent';
import { WorkflowDB } from './workflow_db';
export declare class Workflow extends WorkflowDB {
    static readonly STATE: {
        readonly ACTIVE: "active";
        readonly INACTIVE: "inactive";
        readonly DRAFT: "draft";
        readonly ARCHIVED: "archived";
        readonly ERROR: "error";
    };
    status: string;
    tasks: Task[];
    current_task: Task | null;
    task_results: Record<string, any>;
    errors: string[];
    constructor(workflowData?: Partial<Record<string, any>>);
    isActive(): boolean;
    getName(): string | undefined;
    getVersion(): string | undefined;
    getFlowSchema(): any;
    setFlowSchema(schema: any): void;
    add_task(task: Task): void;
    execute(agent?: Agent): Promise<string>;
    cancel(): void;
    get_status(): Record<string, any>;
    get_task_results(): Record<string, any>;
    load_tasks_from_flowschema(): number;
}
