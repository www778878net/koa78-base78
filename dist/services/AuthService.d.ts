import UpInfo from '../UpInfo';
import { DatabaseService } from './DatabaseService';
import { CacheService } from './CacheService';
export declare class AuthService {
    private log;
    private static _CID_MY;
    static readonly CID_GUEST: string;
    private dbService;
    private cacheService;
    private static instance;
    constructor();
    init(dbService: DatabaseService, cacheService: CacheService): void;
    static get CID_MY(): string;
    private static getCidMyFromConfig;
    static getInstance(): AuthService;
    upcheck(up: UpInfo, cols: string[], dbname: string): Promise<string>;
    preventReplayAttack(up: UpInfo): Promise<void>;
}
