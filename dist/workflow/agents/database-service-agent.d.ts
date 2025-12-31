import { Agent } from '../base/agent';
export declare class DatabaseServiceAgent extends Agent {
    private dbConnections;
    private config;
    constructor(config?: any);
    connect(dbName: string, options?: any): Promise<void>;
    disconnect(dbName: string): Promise<void>;
    query(sql: string, params?: any[], dbName?: string): Promise<any[]>;
    get(sql: string, params?: any[], up?: any, dbName?: string): Promise<any[]>;
    execute(sql: string, params?: any[], dbName?: string): Promise<any>;
    isConnected(dbName: string): boolean;
    executeQueryTask(params: {
        sql: string;
        params?: any[];
        dbName?: string;
    }): Promise<any[]>;
    executeGetTask(params: {
        sql: string;
        params?: any[];
        up?: any;
        dbName?: string;
    }): Promise<any[]>;
}
