import UpInfo from 'koa78-upinfo';
import { DatabaseConnections } from '../static/DatabaseConnections';
export declare class DatabaseService {
    static instance: DatabaseService;
    dbConnections?: DatabaseConnections;
    private log;
    constructor();
    setDatabaseConnections(dbConnections: DatabaseConnections): void;
    get(sql: string, values: any[], up: UpInfo, dbName?: string): Promise<any>;
    m(sql: string, values: any[], up: UpInfo, dbName?: string): Promise<any>;
    doT(cmds: string[], values: string[][], errtexts: string[], logtext: string, logvalue: string[], up: UpInfo, dbName?: string): Promise<string>;
    mAdd(sql: string, values: any[], up: UpInfo, dbName?: string): Promise<number>;
}
