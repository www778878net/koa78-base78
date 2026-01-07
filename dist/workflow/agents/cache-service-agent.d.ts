import { Agent } from '../base/agent';
export declare class CacheServiceAgent extends Agent {
    private cacheStore;
    private config;
    constructor(config?: any);
    get(key: string): Promise<any>;
    set(key: string, value: any, ttl?: number): Promise<void>;
    delete(key: string): Promise<boolean>;
    exists(key: string): Promise<boolean>;
    clear(): Promise<void>;
    tbget(key: string, debug?: boolean): Promise<any>;
    tbset(key: string, value: any, ttl?: number): Promise<void>;
    executeGetTask(params: {
        key: string;
        debug?: boolean;
    }): Promise<any>;
    executeSetTask(params: {
        key: string;
        value: any;
        ttl?: number;
    }): Promise<void>;
}
