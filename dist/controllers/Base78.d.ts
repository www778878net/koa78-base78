import 'reflect-metadata';
import { DatabaseService } from '../services/DatabaseService';
import { CacheService } from '../services/CacheService';
import { Config } from '../config/Config';
import { TableSet } from '../config/tableConfig';
import UpInfo from 'koa78-upinfo';
import { BaseSchema } from './BaseSchema';
import { QueryBuilder } from '../utils/QueryBuilder';
import { MyLogger } from '../utils/mylogger';
import Elasticsearch78 from '../services/elasticsearch78';
/**
 * Base78 - 基础控制器类
 *
 * 重要约定：
 * - 所有修改操作的方法（新增、更新、删除）必须以 'm' 开头
 * - 原因：防止浏览器注入跟踪重复提交，需要防重机制
 * - 查询方法（get）可以不以 m 开头，但至少不能重复修改
 *
 * 修改操作包括：
 * - 新增：mAdd, mAddMany
 * - 更新：mUpdate, mUpdateIdpk, mUpdateMany
 * - 删除：mDel, mDelMany
 */
interface ShardingConfig {
    type: 'daily' | 'monthly' | 'none';
    tableSQL?: string;
    retentionDays?: number;
}
/**
 * Base78 基础控制器类
 *
 * 重要说明：
 * 1. 所有修改类方法（增删改）必须以 'm' 开头（如 mAdd、mUpdate、mDel）
 * 2. 原因：某些浏览器会跟踪调度，可能重复发送请求，'m' 前缀用于防重机制
 * 3. 查询方法（get）根据业务需求决定是否需要防重
 * 4. 删除操作属于修改操作，必须使用 mDel 和 mDelMany
 */
export default class Base78<T extends BaseSchema> {
    protected _up?: UpInfo;
    protected logger: MyLogger;
    protected dbname: string;
    protected tbname: string;
    tableConfig: TableSet;
    protected static lastMaintenanceDateMap: Map<string, string>;
    protected shardingConfig?: ShardingConfig;
    protected isadmin: boolean;
    constructor();
    setShardingConfig(config: ShardingConfig): void;
    protected getDynamicTableName(): string;
    private createShardingTable;
    private dropOldShardingTable;
    protected performShardingTableMaintenance(): Promise<void>;
    setup(upInfo: UpInfo): void;
    get up(): UpInfo;
    /**
  * 删除指定日期之前的日志表
  * @param daysAgo 距离今天多少天前的表
  * @returns Promise<number> 返回1表示删除成功，其他值表示删除失败
  */
    private dropOldLogTable;
    mUpdateElkByid(): Promise<any>;
    getCustomCols(): string;
    protected get esService(): Elasticsearch78;
    protected get dbService(): DatabaseService;
    protected get cacheService(): CacheService;
    protected get config(): Config;
    /**
     * 检查管理员权限
     * 如果 isadmin 为 true，则检查用户是否为管理员
     * @throws Error 如果不是管理员则抛出错误
     */
    protected checkAdminPermission(): void;
    protected _handleError(e: any): void;
    private _loadConfig;
    protected _setBack(res: number, errmsg: string, kind?: string): void;
    mUpdateMany(colpin?: string[]): Promise<any>;
    mAdd(colp?: string[]): Promise<string>;
    mAddMany(colp?: string[]): Promise<number>;
    mUpdateIdpk(colp?: string[]): Promise<string>;
    mUpdate(colp?: string[]): Promise<string>;
    midpk(colp?: string[]): Promise<number | string | {
        sql: string;
        values: any[];
    }>;
    m(colp?: string[]): Promise<number | string | {
        sql: string;
        values: any[];
    }>;
    get(colp?: string[]): Promise<object>;
    mdel(): Promise<string>;
    mdelmany(): Promise<string>;
    protected createQueryBuilder(): QueryBuilder<T>;
    /**
     * 没有办法获取ID的情况下 但第一个字段唯一
     * 示例 :第一个字段为唯一
     *   up = UpInfo.getMaster()
        up.cols=["card","lastval"]
        up.set_par(ts_code,price)
        tmp=await up.send_back("apistock/stock/stock_mine/mByFirstField", up)
     * @returns
     */
    mByFirstField(colp?: string[]): Promise<number | string | {
        sql: string;
        values: any[];
    }>;
}
export declare class CidBase78<T extends BaseSchema> extends Base78<T> {
}
export declare class UidBase78<T extends BaseSchema> extends Base78<T> {
}
export {};
