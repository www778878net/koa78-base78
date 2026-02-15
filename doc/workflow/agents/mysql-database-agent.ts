import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { Agent } from '../base/agent';
import { TsLog78 } from 'tslog78';
import UpInfo from '../../UpInfo';
import { ConfigAgent } from './config-agent';

// 扩展 dayjs 以支持 UTC
dayjs.extend(utc);

const log = TsLog78.Instance;

export class MysqlDatabaseAgent extends Agent {
  private mysqlConnections: Map<string, any> = new Map();
  private configAgent: ConfigAgent | null = null;

  constructor(configAgent?: ConfigAgent) {
    super();
    this.configAgent = configAgent || null;
    this.agentname = 'MysqlDatabaseAgent';
  }

  async initializeConnection(dbName: string, options?: any): Promise<void> {
    // 从ConfigAgent获取数据库配置，如果options未提供的话
    let dbConfig = options;
    if (!dbConfig && this.configAgent) {
      const config = this.configAgent.getAll();
      if (config.mysqls && config.mysqls[dbName]) {
        dbConfig = config.mysqls[dbName];
      } else {
        // 使用默认配置
        dbConfig = config.mysqls?.default;
      }
    }

    console.log(`Connecting to MySQL database: ${dbName}`, dbConfig);

    // 模拟MySQL连接，实际实现中应该使用真实的MySQL连接
    const connection = {
      doGet: async (sql: string, values: any[], up: UpInfo) => {
        console.log(`Executing query: ${sql} with values:`, values);
        
        // 模拟查询结果 - 根据SQL文件中的数据
        if (sql.includes('lovers l')) {
          // 模拟返回用户数据，根据SQL文件中lovers表的数据
          if (values && values[0] === 'GUEST888-8888-8888-8888-GUEST88GUEST') {
            return [{
              id: 'GUEST888-8888-8888-8888-GUEST88GUEST',
              uname: 'guest',
              idcodef: 'GUEST000-8888-8888-8888-GUEST00GUEST',
              email: '',
              referrer: 'GUEST000-8888-8888-8888-GUEST00GUEST',
              mobile: '',
              openweixin: '',
              truename: '',
              upby: '',
              uptime: '1900-01-01 00:00:00',
              idpk: 1,
              remark: '',
              remark2: '',
              remark3: '',
              remark4: '',
              remark5: '',
              remark6: '',
              // cid: '',  // 这个字段已经在下面定义了，删除重复项
              sid_web_date: '2018-06-01 18:02:43',
              sid: 'GUEST888-8888-8888-8888-GUEST88GUEST',
              sid_web: '8573faf2-24b2-b586-adac-d9d8da9772d0',
              coname: '测试帐套',
              idceo: 'CD86605E-7A42-481A-9786-85010E67128A',
              cid: 'GUEST000-8888-8888-8888-GUEST00GUEST'  // 保留这一个cid定义
            }];
          } else if (values && values[0] === '9776b64d-70b2-9d61-4b24-60325ea1345e') {
            return [{
              id: 'CD86605E-7A42-481A-9786-85010E67128A',
              uname: 'sysadmin',
              idcodef: 'd4856531-e9d3-20f3-4c22-fe3c65fb009c',
              email: '',
              referrer: 'd4856531-e9d3-20f3-4c22-fe3c65fb009c',
              mobile: '',
              openweixin: '',
              truename: '',
              upby: '',
              uptime: '1900-01-01 00:00:00',
              idpk: 2,
              remark: '',
              remark2: '',
              remark3: '',
              remark4: '',
              remark5: '',
              remark6: '',
              // cid: '',  // 这个字段已经在下面定义了，删除重复项
              sid_web_date: '2022-10-24 22:06:26',
              sid: '9776b64d-70b2-9d61-4b24-60325ea1345e',
              sid_web: 'a46f3ec9-b40d-6850-838e-6b897a73c72f',
              coname: 'net78',
              idceo: 'CD86605E-7A42-481A-9786-85010E67128A',
              cid: 'd4856531-e9d3-20f3-4c22-fe3c65fb009c'  // 保留这一个cid定义
            }];
          }
        }
        
        // 默认返回空数组
        return [];
      },
      doM: async (sql: string, values: any[], up: UpInfo) => {
        console.log(`Executing update: ${sql} with values:`, values);
        // 模拟返回受影响行数
        return { affectedRows: 1 };
      },
      doT: async (cmds: string[], values: string[][], errtexts: string[], logtext: string, logvalue: string[], up: UpInfo) => {
        console.log(`Executing transaction:`, cmds);
        // 模拟返回事务结果
        return "ok";
      },
      doMAdd: async (sql: string, values: any[], up: UpInfo) => {
        console.log(`Executing insert: ${sql} with values:`, values);
        // 模拟返回插入ID
        return 1;
      }
    };
    
    this.mysqlConnections.set(dbName, connection);
  }

  async connect(dbName: string, options?: any): Promise<void> {
    await this.initializeConnection(dbName, options);
  }

  async disconnect(dbName: string): Promise<void> {
    const connection = this.mysqlConnections.get(dbName);
    if (connection) {
      // 在实际实现中，这里会关闭真实的MySQL连接
      this.mysqlConnections.delete(dbName);
    }
  }

  async query(sql: string, values?: any[], up?: UpInfo, dbName: string = 'default'): Promise<any[]> {
    const connection = this.mysqlConnections.get(dbName);
    if (!connection) {
      throw new Error(`MySQL connection not found for database: ${dbName}`);
    }

    console.log(`Executing query on ${dbName}: ${sql}`);
    console.log(`Parameters:`, values);

    try {
      // 使用模拟的doGet方法
      const result = await connection.doGet(sql, values || [], up || this.createDefaultUpInfo());
      return result;
    } catch (error) {
      console.error(`Error executing query: ${error}`);
      throw error;
    }
  }

  async execute(sql: string, values?: any[], up?: UpInfo, dbName: string = 'default'): Promise<any> {
    const connection = this.mysqlConnections.get(dbName);
    if (!connection) {
      throw new Error(`MySQL connection not found for database: ${dbName}`);
    }

    console.log(`Executing SQL on ${dbName}: ${sql}`);
    console.log(`Parameters:`, values);

    try {
      // 使用模拟的doM方法
      const result = await connection.doM(sql, values || [], up || this.createDefaultUpInfo());
      return result;
    } catch (error) {
      console.error(`Error executing SQL: ${error}`);
      throw error;
    }
  }

  async executeTransaction(cmds: string[], values: string[][], errtexts: string[], logtext: string, logvalue: string[], up?: UpInfo, dbName: string = 'default'): Promise<string> {
    const connection = this.mysqlConnections.get(dbName);
    if (!connection) {
      throw new Error(`MySQL connection not found for database: ${dbName}`);
    }

    console.log(`Executing transaction on ${dbName}:`, cmds);
    
    try {
      // 使用模拟的doT方法
      const result = await connection.doT(cmds, values, errtexts, logtext, logvalue, up || this.createDefaultUpInfo());
      return result;
    } catch (error) {
      console.error(`Error executing transaction: ${error}`);
      throw error;
    }
  }

  async executeInsert(sql: string, values?: any[], up?: UpInfo, dbName: string = 'default'): Promise<number> {
    const connection = this.mysqlConnections.get(dbName);
    if (!connection) {
      throw new Error(`MySQL connection not found for database: ${dbName}`);
    }

    console.log(`Executing insert on ${dbName}: ${sql}`);
    console.log(`Parameters:`, values);

    try {
      // 使用模拟的doMAdd方法
      const result = await connection.doMAdd(sql, values || [], up || this.createDefaultUpInfo());
      return result;
    } catch (error) {
      console.error(`Error executing insert: ${error}`);
      throw error;
    }
  }

  isConnected(dbName: string): boolean {
    return this.mysqlConnections.has(dbName);
  }

  // 允许更新配置Agent
  setConfigAgent(configAgent: ConfigAgent) {
    this.configAgent = configAgent;
  }

  private createDefaultUpInfo(): UpInfo {
    // 创建一个默认的UpInfo实例
    const up = new UpInfo(null);
    up.uname = 'system';
    up.apimicro = 'system';
    up.apiobj = 'system';
    up.uptime = new Date();
    up.utime = dayjs().utc().format('YYYY-MM-DD HH:mm:ss');
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