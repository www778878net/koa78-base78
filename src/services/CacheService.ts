import { injectable } from 'inversify';
import { DatabaseConnections } from '../static/DatabaseConnections';
import Redis78 from 'redis78';
import MemCache78 from 'memcache78';

@injectable()
export class CacheService {
    public static instance: CacheService;
    private memcache?: MemCache78;
    private redis?: Redis78;

    constructor() {
        if (!CacheService.instance) {
            CacheService.instance = this;
        }
        return CacheService.instance;
    }

    setMemcache(dbConnections: DatabaseConnections) {
        this.memcache = dbConnections.memcache;
        this.redis = dbConnections.redis;
    }

    async get(key: string): Promise<any> {
        if (!this.memcache) return null;
        return await this.memcache.get(key);
    }

    async incr(key: string): Promise<any> {
        if (!this.memcache) return null;
        return await this.memcache.incr(key);
    }

    async del(key: string): Promise<any> {
        if (!this.memcache) return null;
        return await this.memcache.del(key);
    }

    async set(key: string, value: any, expiration: number = 86400): Promise<boolean> {
        if (!this.memcache) return false;
        return await this.memcache.set(key, String(value), expiration);
    }

    async add(key: string, value: any, expiration: number = 86400): Promise<boolean> {
        if (!this.memcache) return false;
        return this.memcache.add(key, String(value), expiration);
    }


    async tbget(key: string, debug: boolean): Promise<any> {
        if (!this.memcache) return null;
        return this.memcache.tbget(key, debug);
    }

    async tbset(key: string, value: any): Promise<boolean> {
        if (!this.memcache) return false;
        return this.memcache.tbset(key, value);
    }

    async redisGet(key: string): Promise<any> {
        if (!this.redis) {
            return null;
        }
        return this.redis.get(key);
    }

    async redisSet(key: string, value: any, expiration?: number): Promise<string> {
        if (!this.redis) {
            return '';
        }
        return this.redis.set(key, value, expiration);
    }

    async lpop(key: string): Promise<string | null> {
        if (!this.redis) {
            return null;
        }
        return this.redis.lpop(key);
    }

    async llen(listname: string): Promise<number> {
        if (!this.redis) {
            return 0;
        }
        return this.redis.llen(listname);
    }

    async rpush(listname: string, key: any): Promise<number> {
        if (!this.redis) {
            return 0;
        }
        return this.redis.rpush(listname, key);
    }

    async lpush(listname: string, key: string): Promise<number> {
        if (!this.redis) {
            return 0;
        }
        return this.redis.lpush(listname, key);
    }
}