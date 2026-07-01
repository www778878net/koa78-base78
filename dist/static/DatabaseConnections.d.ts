import MemCache78 from 'memcache78';
import Redis78 from 'redis78';
import Sqlite78 from '../dll78/Sqlite78';
import Postgres78 from '../dll78/Postgres78';
export interface PostgreSQLConfig {
    host?: string;
    port?: number;
    max?: number;
    user?: string;
    password: string;
    database: string;
    isLog?: boolean;
    isCount?: boolean;
}
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
    private postgresConnections;
    private sqliteConnections;
    memcache?: MemCache78;
    redis?: Redis78;
    constructor(postgress: Record<string, PostgreSQLConfig>, memcachedConfig: MemcachedConfig, redisConfig: RedisConfig, sqlites?: Record<string, SQLiteConfig>);
    static getInstance(postgress: Record<string, PostgreSQLConfig>, memcachedConfig: MemcachedConfig, redisConfig: RedisConfig, sqlites?: Record<string, SQLiteConfig>): DatabaseConnections;
    getPostgreSQLConnection(name?: string): Postgres78 | undefined;
    getSQLiteConnection(name?: string): Sqlite78 | undefined;
    getAllPostgreSQLConnections(): Map<string, Postgres78>;
    getAllSQLiteConnections(): Map<string, Sqlite78>;
    get postgres1(): Postgres78 | undefined;
}
