import Mysql78 from 'mysql78';
import MemCache78 from 'memcache78';
import Redis78 from 'redis78';
import Sqlite78 from '../dll78/Sqlite78';
export interface MySQLConfig {
    host?: string;
    port?: number;
    max?: number;
    user?: string;
    password: string;
    database: string;
    isLog?: boolean;
    isCount?: boolean;
}
export interface SQLiteConfig {
    filename: string;
    isLog?: boolean;
    isCount?: boolean;
}
export interface MemcachedConfig {
    host: string;
    port: number;
    max: number;
    local: string;
}
export interface RedisConfig {
    host: string;
    port: number;
    pwd: string;
    max: number;
    local: string;
}
export declare class DatabaseConnections {
    private static instance;
    private mysqlConnections;
    private sqliteConnections;
    memcache?: MemCache78;
    redis?: Redis78;
    constructor(mysqls: Record<string, MySQLConfig>, memcachedConfig: MemcachedConfig, redisConfig: RedisConfig, sqlites?: Record<string, SQLiteConfig>);
    static getInstance(mysqls: Record<string, MySQLConfig>, memcachedConfig: MemcachedConfig, redisConfig: RedisConfig, sqlites?: Record<string, SQLiteConfig>): DatabaseConnections;
    getMySQLConnection(name?: string): Mysql78 | undefined;
    getSQLiteConnection(name?: string): Sqlite78 | undefined;
    getAllMySQLConnections(): Map<string, Mysql78>;
    getAllSQLiteConnections(): Map<string, Sqlite78>;
    get mysql1(): Mysql78 | undefined;
}
