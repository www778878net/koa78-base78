import 'reflect-metadata';
import { DatabaseService } from '../services/DatabaseService';
import { CacheService } from '../services/CacheService';
import { Config } from '../config/Config';
import { TableSet } from '../config/tableConfig';
import UpInfo from 'koa78-upinfo';
import { BaseSchema } from './BaseSchema';
import { QueryBuilder } from '../utils/QueryBuilder';
import { TsLog78 } from 'tslog78';
import Elasticsearch78 from '../services/elasticsearch78';
interface ShardingConfig {
    type: 'daily' | 'monthly' | 'none';
    tableSQL?: string;
    retentionDays?: number;
    createFutureDays?: number;
    createPastDays?: number;
}
export default class Base78<T extends BaseSchema> {
    protected _up?: UpInfo;
    protected logger: TsLog78;
    protected dbname: string;
    protected tbname: string;
    tableConfig: TableSet;
    private static lastMaintenanceDate;
    protected shardingConfig?: ShardingConfig;
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
    protected _handleError(e: any): void;
    private _loadConfig;
    protected _setBack(res: number, errmsg: string, kind?: string): void;
    mUpdateMany(colpin?: string[]): Promise<any>;
    mAdd(colp?: string[]): Promise<number>;
    mUpdateIdpk(colp?: string[]): Promise<string>;
    mUpdate(colp?: string[]): Promise<string>;
    midpk(colp?: string[]): Promise<string>;
    m(colp?: string[]): Promise<string>;
    get(colp?: string[]): Promise<object>;
    del(): Promise<string>;
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
    mByFirstField(colp?: string[]): Promise<string>;
}
export declare class CidBase78<T extends BaseSchema> extends Base78<T> {
}
export declare class UidBase78<T extends BaseSchema> extends Base78<T> {
}
export {};
