import { DatabaseConnections } from '../static/DatabaseConnections';
export declare class CacheService {
    static instance: CacheService;
    private memcache?;
    private redis?;
    constructor();
    setMemcache(dbConnections: DatabaseConnections): void;
    get(key: string): Promise<any>;
    incr(key: string): Promise<any>;
    del(key: string): Promise<any>;
    set(key: string, value: any, expiration?: number): Promise<boolean>;
    add(key: string, value: any, expiration?: number): Promise<boolean>;
    tbget(key: string, debug: boolean): Promise<any>;
    tbset(key: string, value: any): Promise<boolean>;
    redisGet(key: string): Promise<any>;
    redisSet(key: string, value: any, expiration?: number): Promise<string>;
    lpop(key: string): Promise<string | null>;
    llen(listname: string): Promise<number>;
    rpush(listname: string, key: any): Promise<number>;
    lpush(listname: string, key: string): Promise<number>;
}
