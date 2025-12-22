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

export class DatabaseConnections {
    private static instance: DatabaseConnections;
    private mysqlConnections: Map<string, Mysql78> = new Map();
    private sqliteConnections: Map<string, Sqlite78> = new Map(); // 注释掉Sqlite78相关代码
    public memcache?: MemCache78;
    public redis?: Redis78;

    public constructor(
        mysqls: Record<string, MySQLConfig>,
        memcachedConfig: MemcachedConfig,
        redisConfig: RedisConfig,
        sqlites?: Record<string, SQLiteConfig>  // 注释掉Sqlite78相关参数
    ) {
        console.log('DatabaseConnections constructor called with mysqls:', JSON.stringify(mysqls, null, 2));

        // 允许空的mysql配置
        const mysqlEntries = mysqls ? Object.entries(mysqls) : [];

        for (const [name, mysqlConfig] of mysqlEntries) {
            console.warn(`Creating MySQL connection [${name}] with host:${mysqlConfig.host} db:${mysqlConfig.database} user:${mysqlConfig.user} password:${mysqlConfig.password}`);
            this.mysqlConnections.set(name, new Mysql78(mysqlConfig));
        }

        // 初始化SQLite连接 - 注释掉这部分代码

        if (sqlites) {
            const sqliteEntries = Object.entries(sqlites);
            for (const [name, sqliteConfig] of sqliteEntries) {
                console.warn(`SQLite ${name} ${sqliteConfig.filename}`);
                const sqliteInstance = new Sqlite78(sqliteConfig);
                // 初始化连接
                sqliteInstance.initialize().catch(err => {
                    console.error(`Failed to initialize SQLite connection ${name}:`, err);
                });
                this.sqliteConnections.set(name, sqliteInstance);
            }
        }


        // 只有当配置存在且为对象时才创建memcache和redis实例
        if (memcachedConfig && typeof memcachedConfig === 'object') {
            this.memcache = new MemCache78(memcachedConfig);
        }

        if (redisConfig && typeof redisConfig === 'object') {
            this.redis = new Redis78(redisConfig);
        }

        console.warn(`redis ${redisConfig?.host} ${redisConfig?.port} ${redisConfig?.pwd} ${redisConfig?.max} ${redisConfig?.local}`);
    }

    public static getInstance(
        mysqls: Record<string, MySQLConfig>,
        memcachedConfig: MemcachedConfig,
        redisConfig: RedisConfig,
        sqlites?: Record<string, SQLiteConfig> // 注释掉Sqlite78相关参数
    ): DatabaseConnections {
        if (!DatabaseConnections.instance) {
            // DatabaseConnections.instance = new DatabaseConnections(mysqls, memcachedConfig, redisConfig, sqlites);
            DatabaseConnections.instance = new DatabaseConnections(mysqls, memcachedConfig, redisConfig, sqlites); // 移除sqlites参数
        }
        return DatabaseConnections.instance;
    }

    public getMySQLConnection(name: string = "default"): Mysql78 | undefined {
        return this.mysqlConnections.get(name);
    }

    public getSQLiteConnection(name: string = "default"): Sqlite78 | undefined { // 注释掉Sqlite78相关方法
        return this.sqliteConnections.get(name);
    }

    public getAllMySQLConnections(): Map<string, Mysql78> {
        return this.mysqlConnections;
    }

    public getAllSQLiteConnections(): Map<string, Sqlite78> { // 注释掉Sqlite78相关方法
        return this.sqliteConnections;
    }

    get mysql1(): Mysql78 | undefined {
        return this.getMySQLConnection("default");
    }
}