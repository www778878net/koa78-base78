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

export class DatabaseConnections {
    private static instance: DatabaseConnections;
    private postgresConnections: Map<string, Postgres78> = new Map();
    private sqliteConnections: Map<string, Sqlite78> = new Map();
    public memcache?: MemCache78;
    public redis?: Redis78;

    public constructor(
        postgress: Record<string, PostgreSQLConfig>,
        memcachedConfig: MemcachedConfig,
        redisConfig: RedisConfig,
        sqlites?: Record<string, SQLiteConfig>
    ) {
        console.log('DatabaseConnections constructor called with postgress:', JSON.stringify(postgress, null, 2));

        const postgresEntries = postgress ? Object.entries(postgress) : [];
        for (const [name, pgConfig] of postgresEntries) {
            console.warn(`Creating PostgreSQL connection [${name}] with host:${pgConfig.host} db:${pgConfig.database} user:${pgConfig.user}`);
            this.postgresConnections.set(name, new Postgres78(pgConfig));
        }

        if (sqlites) {
            const sqliteEntries = Object.entries(sqlites);
            for (const [name, sqliteConfig] of sqliteEntries) {
                console.warn(`SQLite ${name} ${sqliteConfig.filename}`);
                const sqliteInstance = new Sqlite78(sqliteConfig);
                sqliteInstance.initialize().catch(err => {
                    console.error(`Failed to initialize SQLite connection ${name}:`, err);
                });
                this.sqliteConnections.set(name, sqliteInstance);
            }
        }

        if (memcachedConfig && typeof memcachedConfig === 'object') {
            this.memcache = new MemCache78(memcachedConfig);
        }

        if (redisConfig && typeof redisConfig === 'object') {
            this.redis = new Redis78(redisConfig);
        }

        console.warn(`redis ${redisConfig?.host} ${redisConfig?.port} ${redisConfig?.pwd} ${redisConfig?.max} ${redisConfig?.local}`);
    }

    public static getInstance(
        postgress: Record<string, PostgreSQLConfig>,
        memcachedConfig: MemcachedConfig,
        redisConfig: RedisConfig,
        sqlites?: Record<string, SQLiteConfig>
    ): DatabaseConnections {
        if (!DatabaseConnections.instance) {
            DatabaseConnections.instance = new DatabaseConnections(postgress, memcachedConfig, redisConfig, sqlites);
        }
        return DatabaseConnections.instance;
    }

    public getPostgreSQLConnection(name: string = "default"): Postgres78 | undefined {
        return this.postgresConnections.get(name);
    }

    public getSQLiteConnection(name: string = "default"): Sqlite78 | undefined {
        return this.sqliteConnections.get(name);
    }

    public getAllPostgreSQLConnections(): Map<string, Postgres78> {
        return this.postgresConnections;
    }

    public getAllSQLiteConnections(): Map<string, Sqlite78> {
        return this.sqliteConnections;
    }

    get postgres1(): Postgres78 | undefined {
        return this.getPostgreSQLConnection("default");
    }
}
