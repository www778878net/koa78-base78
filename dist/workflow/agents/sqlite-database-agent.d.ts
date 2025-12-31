import { Agent } from '../base/agent';
import UpInfo from 'koa78-upinfo';
export declare class SqliteDatabaseAgent extends Agent {
    private sqliteConnections;
    private config;
    constructor(config?: any);
    initializeConnection(dbName: string, options?: any): Promise<void>;
    connect(dbName: string, options?: any): Promise<void>;
    disconnect(dbName: string): Promise<void>;
    query(sql: string, values?: any[], up?: UpInfo, dbName?: string): Promise<any[]>;
    execute(sql: string, values?: any[], up?: UpInfo, dbName?: string): Promise<any>;
    executeTransaction(cmds: string[], values: string[][], errtexts: string[], logtext: string, logvalue: string[], up?: UpInfo, dbName?: string): Promise<string>;
    executeInsert(sql: string, values?: any[], up?: UpInfo, dbName?: string): Promise<number>;
    isConnected(dbName: string): boolean;
    private createDefaultUpInfo;
    executeQueryTask(params: {
        sql: string;
        values?: any[];
        up?: UpInfo;
        dbName?: string;
    }): Promise<any[]>;
    executeTask(params: {
        sql: string;
        values?: any[];
        up?: UpInfo;
        dbName?: string;
    }): Promise<any>;
    executeInsertTask(params: {
        sql: string;
        values?: any[];
        up?: UpInfo;
        dbName?: string;
    }): Promise<number>;
}
