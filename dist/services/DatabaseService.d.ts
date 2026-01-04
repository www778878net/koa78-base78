import UpInfo from 'koa78-upinfo';
import { DatabaseConnections } from '../static/DatabaseConnections';
export declare class DatabaseService {
    static instance: DatabaseService;
    dbConnections?: DatabaseConnections;
    private log;
    constructor();
    setDatabaseConnections(dbConnections: DatabaseConnections): void;
    get(sql: string, values: any[], up: UpInfo, dbName?: string): Promise<any>;
    m(sql: string, values: any[], up: UpInfo, dbName?: string): Promise<{
        affectedRows: number;
        error?: string;
    }>;
    doT(cmds: string[], values: string[][], errtexts: string[], logtext: string, logvalue: string[], up: UpInfo, dbName?: string): Promise<string>;
    mAdd(sql: string, values: any[], up: UpInfo, dbName?: string): Promise<{
        insertId: number;
        error?: string;
    }>;
    sqliteGet(sql: string, values: any[], up: UpInfo, dbName?: string): Promise<any>;
    sqliteM(sql: string, values: any[], up: UpInfo, dbName?: string): Promise<{
        affectedRows: number;
        error?: string;
    }>;
    sqliteDoT(cmds: string[], values: string[][], errtexts: string[], logtext: string, logvalue: string[], up: UpInfo, dbName?: string): Promise<string>;
    sqliteMAdd(sql: string, values: any[], up: UpInfo, dbName?: string): Promise<{
        insertId: number;
        error?: string;
    }>;
}
