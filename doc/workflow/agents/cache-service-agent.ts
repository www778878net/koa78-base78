import { Agent } from '../base/agent';
import { TsLog78 } from 'tslog78';

const log = TsLog78.Instance;

export class CacheServiceAgent extends Agent {
  private cacheStore: Map<string, { value: any, expireAt: number | null }> = new Map();
  private config: any;

  constructor(config?: any) {
    super();
    this.config = config || {};
    this.agentname = 'CacheServiceAgent';
  }

  async get(key: string): Promise<any> {
    const item = this.cacheStore.get(key);
    if (!item) {
      return null;
    }

    // 检查是否过期
    if (item.expireAt && item.expireAt < Date.now()) {
      this.cacheStore.delete(key);
      return null;
    }

    console.log(`Retrieved from cache: ${key}`);
    return item.value;
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    const expireAt = ttl ? Date.now() + (ttl * 1000) : null;
    this.cacheStore.set(key, { value, expireAt });
    console.log(`Set in cache: ${key}, TTL: ${ttl}s`);
  }

  async delete(key: string): Promise<boolean> {
    console.log(`Deleting from cache: ${key}`);
    return this.cacheStore.delete(key);
  }

  async exists(key: string): Promise<boolean> {
    const item = this.cacheStore.get(key);
    if (!item) {
      return false;
    }

    // 检查是否过期
    if (item.expireAt && item.expireAt < Date.now()) {
      this.cacheStore.delete(key);
      return false;
    }

    return true;
  }

  async clear(): Promise<void> {
    this.cacheStore.clear();
    console.log('Cache cleared');
  }

  // 特定于业务的缓存操作
  async tbget(key: string, debug: boolean = false): Promise<any> {
    const value = await this.get(key);
    if (debug) {
      console.log(`TBGET ${key}:`, value);
    }
    return value;
  }

  async tbset(key: string, value: any, ttl?: number): Promise<void> {
    await this.set(key, value, ttl);
  }

  // Agent处理器：缓存获取任务
  async executeGetTask(params: { key: string, debug?: boolean }): Promise<any> {
    const { key, debug = false } = params;
    return await this.tbget(key, debug);
  }

  // Agent处理器：缓存设置任务
  async executeSetTask(params: { key: string, value: any, ttl?: number }): Promise<void> {
    const { key, value, ttl } = params;
    await this.tbset(key, value, ttl);
  }
}