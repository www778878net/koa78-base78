import UpInfo from 'koa78-upinfo';
import { DatabaseService } from './DatabaseService';
import { CacheService } from './CacheService';
export declare class AuthService {
    private log;
    static readonly CID_VPS: string;
    static readonly CID_MY: string;
    static readonly CID_GUEST: string;
    private dbService;
    private cacheService;
    private static instance;
    constructor(dbService: DatabaseService, cacheService: CacheService);
    static getInstance(): AuthService;
    upcheck(up: UpInfo, cols: string[], dbname: string): Promise<string>;
    preventReplayAttack(up: UpInfo): Promise<void>;
}
