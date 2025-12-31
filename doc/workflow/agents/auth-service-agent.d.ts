import UpInfo from 'koa78-upinfo';
import { Agent } from '../base/agent';
import { MysqlDatabaseAgent } from './mysql-database-agent';
import { CacheServiceAgent } from './cache-service-agent';
export declare class AuthServiceAgent extends Agent {
    private static _CID_MY;
    static readonly CID_GUEST: string;
    private databaseAgent;
    private cacheServiceAgent;
    constructor();
    init(databaseAgent: MysqlDatabaseAgent, cacheServiceAgent: CacheServiceAgent): void;
    static get CID_MY(): string;
    private static getCidMyFromConfig;
    upcheck(up: UpInfo | any, cols: string[], dbname: string): Promise<string>;
    preventReplayAttack(up: UpInfo): Promise<void>;
}
