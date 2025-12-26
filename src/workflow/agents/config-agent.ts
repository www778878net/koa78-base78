import { Agent } from '../base/agent';
import { TsLog78 } from 'tslog78';

const log = TsLog78.Instance;

export class ConfigAgent extends Agent {
  private config: Record<string, any> = {};

  constructor() {
    super(); // 调用父类的构造函数
    
    // 初始化默认配置
    this.config = {
      port: 3000,
      httpPort: 3000,
      httpsPort: 3001,
      dbtype: 'mysql',
      mysql: {
        host: 'localhost',
        port: 3306,
        user: 'root',
        password: '',
        database: 'test',
      },
      redis: {
        host: '127.0.0.1',
        port: 6379,
      }
    };

    log.info('ConfigAgent initialized');
  }

  get(key: string): any {
    const keys = key.split('.');
    let value: any = this.config;

    for (const k of keys) {
      if (value === undefined || value === null) {
        return undefined;
      }
      value = value[k];
    }

    return value;
  }

  set(key: string, value: any): void {
    const keys = key.split('.');
    let current: any = this.config;

    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i];
      if (!(k in current) || typeof current[k] !== 'object') {
        current[k] = {};
      }
      current = current[k];
    }

    current[keys[keys.length - 1]] = value;
    log.debug(`ConfigAgent set ${key} = ${JSON.stringify(value)}`);
  }

  load(configData: Record<string, any>): void {
    this.config = { ...this.config, ...configData };
    log.info('ConfigAgent loaded new configuration');
  }

  getAll(): Record<string, any> {
    return { ...this.config };
  }
}