import Mysql78 from 'mysql78';
import MemCache78 from 'memcache78';
import  Redis78  from 'redis78';

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

export class DatabaseConnections {
  private static instance: DatabaseConnections;
  private mysqlConnections: Map<string, Mysql78> = new Map();
  public memcache: MemCache78;
  public redis: Redis78;

  public constructor(mysqls: Record<string, MySQLConfig>, memcachedConfig: MemcachedConfig, redisConfig: RedisConfig) {
    for (const [name, mysqlConfig] of Object.entries(mysqls)) {
      console.warn(`${name} ${mysqlConfig.host} ${mysqlConfig.database}`);
      this.mysqlConnections.set(name, new Mysql78(mysqlConfig));
    }
    this.memcache = new MemCache78(memcachedConfig);
    this.redis = new Redis78(redisConfig);
    console.warn(`redis ${redisConfig.host} ${redisConfig.port} ${redisConfig.pwd} ${redisConfig.max} ${redisConfig.local}`);
  }

  public static getInstance(mysqls: Record<string, MySQLConfig>, memcachedConfig: MemcachedConfig, redisConfig: RedisConfig): DatabaseConnections {
    if (!DatabaseConnections.instance) {
      DatabaseConnections.instance = new DatabaseConnections(mysqls, memcachedConfig, redisConfig);
    }
    return DatabaseConnections.instance;
  }

  public getMySQLConnection(name: string = "default"): Mysql78 | undefined {
    return this.mysqlConnections.get(name);
  }

  public getAllMySQLConnections(): Map<string, Mysql78> {
    return this.mysqlConnections;
  }

  get mysql1(): Mysql78 | undefined {
    return this.getMySQLConnection("default");
  }
}