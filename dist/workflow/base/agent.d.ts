import { AgentDB } from './agent_db';
export declare class Agent extends AgentDB {
    private handlers;
    get name(): string;
    set name(value: string);
    constructor(json_data?: Record<string, any>);
    isActive(): boolean;
    registerHandler(handler: any): void;
    addHandler(handler: any): void;
    getHandler(type: string, capability: string): any | null;
    getAllHandlers(): Map<string, Map<string, any>>;
    getHandlersByType(type: string): Map<string, any> | null;
    executeHandler(type: string, capability: string, params: Record<string, any>): Promise<Record<string, any>>;
}
