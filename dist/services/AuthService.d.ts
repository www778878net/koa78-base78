import UpInfo from '../UpInfo';
import { DatabaseService } from './DatabaseService';
import { CacheService } from './CacheService';
export declare class AuthService {
    private log;
    private static _CID_MY;
    private static _CID_GUEST;
    private dbService;
    private cacheService;
    private static instance;
    static get CID_GUEST(): string;
    constructor();
    init(dbService: DatabaseService, cacheService: CacheService): void;
    static get CID_MY(): string;
    private static getCidMyFromConfig;
    static getInstance(): AuthService;
    upcheck(up: UpInfo, cols: string[], dbname: string): Promise<string>;
    preventReplayAttack(up: UpInfo): Promise<void>;
}
