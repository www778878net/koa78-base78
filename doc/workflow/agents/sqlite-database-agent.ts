import { Agent } from '../base/agent';
import { TsLog78 } from 'tslog78';
import Sqlite78 from '../../dll78/Sqlite78';
import UpInfo from 'koa78-upinfo';

const log = TsLog78.Instance;

export class SqliteDatabaseAgent extends Agent {
  private sqliteConnections: Map<string, Sqlite78> = new Map();
  private config: any;

  constructor(config?: any) {
    super();
    this.config = config || {};
    this.agentname = 'SqliteDatabaseAgent';
  }

  async initializeConnection(dbName: string, options?: any): Promise<void> {
    // 创建SQLite连接
    const sqliteConfig = {
      filename: options?.filename || `./data/${dbName}.db`,
      isLog: options?.isLog ?? true,
      isCount: options?.isCount ?? true
    };
    
    const sqlite = new Sqlite78(sqliteConfig);
    await sqlite.initialize();
    this.sqliteConnections.set(dbName, sqlite);
    
    console.log(`SQLite connection initialized for database: ${dbName}`);
  }

  async connect(dbName: string, options?: any): Promise<void> {
    await this.initializeConnection(dbName, options);
  }

  async disconnect(dbName: string): Promise<void> {
    const connection = this.sqliteConnections.get(dbName);
    if (connection) {
      await connection.close();
      this.sqliteConnections.delete(dbName);
    }
  }

  async query(sql: string, values?: any[], up?: UpInfo, dbName: string = 'default'): Promise<any[]> {
    const connection = this.sqliteConnections.get(dbName);
    if (!connection) {
      throw new Error(`SQLite connection not found for database: ${dbName}`);
    }

    console.log(`Executing query on ${dbName}: ${sql}`);
    console.log(`Parameters:`, values);

    try {
      // 使用Sqlite78的doGet方法
      const result = await connection.doGet(sql, values || [], up || this.createDefaultUpInfo());
      return result;
    } catch (error) {
      console.error(`Error executing query: ${error}`);
      throw error;
    }
  }

  async execute(sql: string, values?: any[], up?: UpInfo, dbName: string = 'default'): Promise<any> {
    const connection = this.sqliteConnections.get(dbName);
    if (!connection) {
      throw new Error(`SQLite connection not found for database: ${dbName}`);
    }

    console.log(`Executing SQL on ${dbName}: ${sql}`);
    console.log(`Parameters:`, values);

    try {
      // 使用Sqlite78的doM方法
      const result = await connection.doM(sql, values || [], up || this.createDefaultUpInfo());
      return result;
    } catch (error) {
      console.error(`Error executing SQL: ${error}`);
      throw error;
    }
  }

  async executeTransaction(cmds: string[], values: string[][], errtexts: string[], logtext: string, logvalue: string[], up?: UpInfo, dbName: string = 'default'): Promise<string> {
    const connection = this.sqliteConnections.get(dbName);
    if (!connection) {
      throw new Error(`SQLite connection not found for database: ${dbName}`);
    }

    console.log(`Executing transaction on ${dbName}:`, cmds);
    
    try {
      // 使用Sqlite78的doT方法
      const result = await connection.doT(cmds, values, errtexts, logtext, logvalue, up || this.createDefaultUpInfo());
      return result;
    } catch (error) {
      console.error(`Error executing transaction: ${error}`);
      throw error;
    }
  }

  async executeInsert(sql: string, values?: any[], up?: UpInfo, dbName: string = 'default'): Promise<number> {
    const connection = this.sqliteConnections.get(dbName);
    if (!connection) {
      throw new Error(`SQLite connection not found for database: ${dbName}`);
    }

    console.log(`Executing insert on ${dbName}: ${sql}`);
    console.log(`Parameters:`, values);

    try {
      // 使用Sqlite78的doMAdd方法
      const result = await connection.doMAdd(sql, values || [], up || this.createDefaultUpInfo());
      return result;
    } catch (error) {
      console.error(`Error executing insert: ${error}`);
      throw error;
    }
  }

  isConnected(dbName: string): boolean {
    return this.sqliteConnections.has(dbName);
  }

  private createDefaultUpInfo(): UpInfo {
    // 创建一个默认的UpInfo实例
    const up = new UpInfo(null);
    up.uname = 'system';
    up.apisys = 'system';
    up.apiobj = 'system';
    up.uptime = new Date();
    return up;
  }

  // Agent处理器：数据库查询任务
  async executeQueryTask(params: { sql: string, values?: any[], up?: UpInfo, dbName?: string }): Promise<any[]> {
    const { sql, values, up, dbName = 'default' } = params;
    return await this.query(sql, values, up, dbName);
  }

  // Agent处理器：数据库执行任务
  async executeTask(params: { sql: string, values?: any[], up?: UpInfo, dbName?: string }): Promise<any> {
    const { sql, values, up, dbName = 'default' } = params;
    return await this.execute(sql, values, up, dbName);
  }

  // Agent处理器：数据库插入任务
  async executeInsertTask(params: { sql: string, values?: any[], up?: UpInfo, dbName?: string }): Promise<number> {
    const { sql, values, up, dbName = 'default' } = params;
    return await this.executeInsert(sql, values, up, dbName);
  }
}