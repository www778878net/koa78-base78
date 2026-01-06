import 'reflect-metadata';
import { DatabaseService } from '../services/DatabaseService';
import { CacheService } from '../services/CacheService';
import { AuthService } from '../services/AuthService';
import { Config } from '../config/Config';
import { TableSet, TableConfig } from '../config/tableConfig';

import UpInfo from 'koa78-upinfo';
import { BaseSchema } from './BaseSchema';
import { QueryBuilder } from '../utils/QueryBuilder';
import { ApiMethod } from '../interfaces/decorators';
import { ContainerManager } from '../ContainerManager';
import { TsLog78 } from 'tslog78';
import Elasticsearch78 from '../services/elasticsearch78';
import dayjs from 'dayjs'; // 导入dayjs

// 确保使用CommonJS模块导出方式

// 分表配置接口
interface ShardingConfig {
    type: 'daily' | 'monthly' | 'none';
    tableSQL?: string;
    retentionDays?: number; // 保留天数，默认为5
}

export default class Base78<T extends BaseSchema> {
    protected _up?: UpInfo;
    protected logger: TsLog78;
    protected dbname: string = "default";//mysql数据库名（非表名）
    protected tbname: string;//表名
    public tableConfig: TableSet;
    //维护命令一天执行一次
    protected static lastMaintenanceDate: string = '';
    // 新增：分表配置对象
    protected shardingConfig?: ShardingConfig;

    constructor() {
        // 使用新的日志服务方式，与DatabaseService中完全一致
        this.logger = ContainerManager.getLogger() || TsLog78.Instance;
        this.logger.debug(`Base78 constructor called for ${this.constructor.name}`);
        this.tableConfig = this._loadConfig();
        this.tbname = this.constructor.name;
    }

    // 新增：设置分表配置的方法
    public setShardingConfig(config: ShardingConfig): void {
        this.shardingConfig = config;
    }

    // 新增：获取动态表名的方法
    protected getDynamicTableName(): string {
        if (!this.shardingConfig || this.shardingConfig.type === 'none') {
            return this.tableConfig.tbname;
        }

        const currentDate = dayjs();
        let dateSuffix: string;

        switch (this.shardingConfig.type) {
            case 'daily':
                dateSuffix = currentDate.format('YYYYMMDD');
                break;
            case 'monthly':
                dateSuffix = currentDate.format('YYYYMM');
                break;
            default:
                return this.tableConfig.tbname;
        }

        return `${this.tableConfig.tbname}_${dateSuffix}`;
    }

    // 新增：创建分表的方法
    private async createShardingTable(dateStr: string): Promise<void> {
        if (!this.shardingConfig || !this.shardingConfig.tableSQL) {
            throw new Error('分表建表SQL未定义');
        }

        const tableName = `${this.tableConfig.tbname}_${dateStr}`;
        // 替换SQL中的表名占位符（如果有的话）为实际的表名
        const sqlWithTableName = this.shardingConfig.tableSQL.replace(/\{TABLE_NAME\}/g, tableName);
        await this.dbService.m(sqlWithTableName, [], this.up, this.dbname);
    }

    // 新增：删除指定日期之前的分表
    private async dropOldShardingTable(daysAgo: number): Promise<number> {
        if (!this.shardingConfig) {
            return 0; // 没有配置分表，直接返回
        }

        let targetDate: string;
        if (this.shardingConfig.type === 'daily') {
            targetDate = dayjs().subtract(daysAgo, 'day').format('YYYYMMDD');
        } else if (this.shardingConfig.type === 'monthly') {
            targetDate = dayjs().subtract(daysAgo, 'month').format('YYYYMM');
        } else {
            return 0; // 不是分表类型，返回
        }

        const tableName = `${this.tableConfig.tbname}_${targetDate}`;
        const dropTableSQL = `DROP TABLE IF EXISTS \`${tableName}\``;

        try {
            // 先检查表是否存在
            const checkTableSQL = `SHOW TABLES LIKE '${tableName}'`;
            const tableExists = await this.dbService.get(checkTableSQL, [], this.up, this.dbname);

            // 如果表不存在，直接返回0
            if (tableExists.length === 0) {
                return 0;
            }

            await this.dbService.m(dropTableSQL, [], this.up, this.dbname);
            return 1; // 成功删除返回1
        } catch (error) {
            this.logger.error(`删除表 ${tableName} 失败: ${error}`);
            return 0; // 删除失败返回0
        }
    }

    // 新增：执行分表维护任务
    protected async performShardingTableMaintenance(): Promise<void> {
        if (!this.shardingConfig || this.shardingConfig.type === 'none') {
            return; // 如果没有启用分表，则不执行维护任务
        }

        const today = dayjs().format('YYYY-MM-DD');
        const retentionDays = this.shardingConfig.retentionDays || 5;

        // 如果今天已经执行过维护任务，则跳过
        if (Base78.lastMaintenanceDate === today) {
            return;
        }

        try {
            // 正常情况下：删除retentionDays天前的分表
            const dropResult = await this.dropOldShardingTable(retentionDays);

            if (dropResult === 1) {
                // 如果删除成功，只新建第retentionDays天的表
                let futureDate;

                if (this.shardingConfig.type === 'daily') {
                    futureDate = dayjs().add(retentionDays, 'day');
                } else { // monthly
                    futureDate = dayjs().add(retentionDays, 'month');
                }

                const dateStr = this.shardingConfig.type === 'daily' ?
                    futureDate.format('YYYYMMDD') :
                    futureDate.format('YYYYMM');
                await this.createShardingTable(dateStr);
            } else {
                // 如果删除失败，新建从后退(retentionDays-1)天开始到未来retentionDays天的表
                const pastDays = retentionDays - 1;
                const futureDays = retentionDays;

                for (let i = -pastDays; i <= futureDays; i++) {
                    let date;
                    if (this.shardingConfig.type === 'daily') {
                        date = dayjs().add(i, 'day');
                    } else { // monthly
                        date = dayjs().add(i, 'month');
                    }

                    const dateStr = this.shardingConfig.type === 'daily' ?
                        date.format('YYYYMMDD') :
                        date.format('YYYYMM');
                    await this.createShardingTable(dateStr);
                }
            }

            // 更新最后维护日期
            Base78.lastMaintenanceDate = today;
        } catch (error) {
            this.logger.error(`执行分表维护任务失败: ${error}`);
        }
    }

    public setup(upInfo: UpInfo): void {
        this._up = upInfo;
    }

    public get up(): UpInfo {
        if (!this._up) {
            throw new Error('UpInfo not set. Call setup() before using up.');
        }
        return this._up;
    }



    /**
  * 删除指定日期之前的日志表
  * @param daysAgo 距离今天多少天前的表
  * @returns Promise<number> 返回1表示删除成功，其他值表示删除失败
  */
    private async dropOldLogTable(daysAgo: number): Promise<number> {
        const targetDate = dayjs().subtract(daysAgo, 'day').format('YYYYMMDD');
        const tableName = `sys_log_${targetDate}`;
        const dropTableSQL = `DROP TABLE IF EXISTS \`${tableName}\``;

        try {
            // 先检查表是否存在
            const checkTableSQL = `SHOW TABLES LIKE '${tableName}'`;
            const tableExists = await this.dbService.get(checkTableSQL, [], this.up);

            // 如果表不存在，直接返回0
            if (tableExists.length === 0) {
                return 0;
            }

            await this.dbService.m(dropTableSQL, [], this.up);
            return 1; // 成功删除返回1
        } catch (error) {
            this.logger.error(`删除表 ${tableName} 失败: ${error}`);
            return 0; // 删除失败返回0
        }
    }

    @ApiMethod()
    async mUpdateElkByid(): Promise<any> {
        const up = this.up;
        if ((up.cid !== this.config.get('cidvps') && up.cid !== this.config.get('cidmy')) && !up.uname?.indexOf("sys")) {
            throw new Error("err:只有管理员可以操作");
        }
        if (this.esService === null) return null;
        const index = this.tbname; // 替换为你的索引名称
        const id = this.up.pars[0]; // 替换为你的文档 ID
        const updateDoc = JSON.parse(this.up.pars[1]);

        const updatedData = await this.esService.updateById(index, id, updateDoc);
        return updatedData;
    }

    public getCustomCols() {
        return '||||';
    }

    protected get esService(): Elasticsearch78 {
        return Elasticsearch78.getInstance();
    }

    protected get dbService(): DatabaseService {
        return DatabaseService.instance;
    }

    protected get cacheService(): CacheService {
        return CacheService.instance;
    }


    protected get config(): Config {
        return Config.getInstance();
    }

    protected _handleError(e: any): void {
        this.up.errmsg = e.message;
        this.up.res = -8888;
        this.logger.error("错误:", e);
    }

    private _loadConfig(): TableSet {
        const className = this.constructor.name;
        //this.logger.debug(`正在加载类的配置: ${className}`);
        const config = Config.getInstance();
        this.logger.debug(`Config 实例: ${config ? 'exists' : 'undefined'}`);
        if (!config) {
            this.logger.error('Config is not initialized');
            throw new Error('Config is not initialized');
        }
        const tableConfig = config.getTable(className);
        //this.logger.debug(`${className} 的表配置:`, tableConfig);
        if (!tableConfig) {
            this.logger.error(`未找到 ${className} 的表配置`);
            this.logger.debug('完整配置:', JSON.stringify(config.get(''), null, 2));
            throw new Error(`未找到 ${className} 的表配置`);
        }
        return tableConfig;
    }

    protected _setBack(res: number, errmsg: string, kind: string = ""): void {
        this.up.backtype = kind || "string";
        this.up.res = res || 0;
        this.up.errmsg = errmsg || "";
    }

    @ApiMethod()
    async mUpdateMany(colpin?: string[]): Promise<any> {
        const self = this;
        const up = self.up;

        // 防注入: 校验cid和uname
        if ((up.cid !== this.config.get('cidvps') && up.cid !== this.config.get('cidmy')) && !up.uname?.indexOf("sys")) {
            throw new Error("err:只有管理员可以操作");
        }

        let colp = colpin || this.up.cols || self.tableConfig.colsImp;  // 修改列
        let order = up.order;  // 主键，暂时只支持一个
        let num = colp.length + 1;  // 添加额外的字段来更新
        let idlist: any[] = [];  // 用于存储ID
        let values: any[] = [];  // 用于存储更新值
        let pars: any[] = [];  // 最终的查询参数

        // 处理每一组参数并构建更新列表
        while (up.pars.length > 0) {
            let vals = up.pars.splice(0, num);
            idlist.push(vals[num - 1]);  // 获取ID列表
            vals[num - 1] = up.uname ?? "";  // 设置更新者
            vals.push(up.utime);  // 添加更新时间
            values.push(vals);  // 存储更新值
        }

        // 构建 SQL 查询
        let sb = `UPDATE ${self.getDynamicTableName()} SET `;
        for (let i = 0; i < colp.length; i++) {
            if (i > 0) sb += `, `;
            sb += `\`${colp[i]}\` = CASE \`id\` `;
            for (let j = 0; j < idlist.length; j++) {
                sb += `WHEN ? THEN ? `;
                pars.push(idlist[j], values[j][i]);  // 添加查询参数
            }
            sb += `END`;
        }

        // 添加 upby 和 uptime 字段
        sb += ", \`upby\` = ?, \`uptime\` = ? ";

        // 添加 where 子句
        sb += `WHERE \`id\` IN (${idlist.map(() => '?').join(',')})`;
        pars.push(up.uname, up.utime, ...idlist);

        // 执行更新操作
        try {
            const result = await this.dbService.m(sb, pars, up, this.dbname);
            if (result.error) {
                this._setBack(-1, result.error);
                return result.error;
            }
            return result.affectedRows.toString();
        } catch (error) {
            throw new Error(`数据库操作失败: ${error.message}`);
        }
    }

    @ApiMethod()
    async mAdd(colp?: string[]): Promise<string> {
        await this.performShardingTableMaintenance();

        colp = colp || this.tableConfig.colsImp;
        if (this.up.pars.length < colp.length) {
            colp = colp.slice(0, this.up.pars.length);
        }
        const values = this.up.pars.slice(0, colp.length);
        values.push(this.up.mid, this.up.uname || '', this.up.utime, this.up[this.tableConfig.uidcid]);

        // 为所有字段名添加反引号
        const quotedColp = colp.map(col => `\`${col}\``);
        const query = `INSERT INTO ${this.getDynamicTableName()} (${quotedColp.join(',')},\`id\`,\`upby\`,\`uptime\`,\`${this.tableConfig.uidcid}\`) VALUES (${new Array(colp.length + 4).fill('?').join(',')})`; // 使用动态表名

        // 执行插入操作
        const result = await this.dbService.mAdd(query, values, this.up, this.dbname);

        // 如果返回结果包含错误信息，设置 res 为负值并返回错误信息
        if (result.error) {
            this._setBack(-1, result.error);
            return result.error;
        }

        // 返回可直接在SQL客户端执行的完整SQL（带参数值）
        let sql = query;
        for (let i = 0; i < values.length; i++) {
            const val = values[i];
            const replacement = typeof val === 'string' ? `'${val.replace(/'/g, "''")}'` : val;
            sql = sql.replace('?', replacement);
        }

        return sql;
    }

    @ApiMethod()
    async mAddMany(colp?: string[]): Promise<number> {
        await this.performShardingTableMaintenance();

        colp = colp || this.tableConfig.colsImp;

        // 检查是否有足够的数据
        if (this.up.pars.length < colp.length) {
            throw new Error('insufficient parameters for mAddMany');
        }

        // 计算行数：前端只传业务字段，每行 colp.length 个字段
        const totalPars = this.up.pars.length;
        const rowCount = Math.floor(totalPars / colp.length);

        if (rowCount === 0) {
            throw new Error('no data to insert');
        }

        // 检查是否有余数（参数数量必须是 colp.length 的整数倍）
        if (totalPars % colp.length !== 0) {
            throw new Error('parameters count must be multiple of column count');
        }

        // 为所有字段名添加反引号
        const quotedColp = colp.map(col => `\`${col}\``);

        // 每行实际需要的参数数：业务字段 + 4个系统字段
        const fieldsPerRow = colp.length + 4;

        // 构建批量插入的SQL
        const query = `INSERT INTO ${this.getDynamicTableName()} (${quotedColp.join(',')},\`id\`,\`upby\`,\`uptime\`,\`${this.tableConfig.uidcid}\`) VALUES ${new Array(rowCount).fill(`(${new Array(fieldsPerRow).fill('?').join(',')})`).join(',')}`;

        // 构建参数数组
        const values: any[] = [];

        for (let i = 0; i < rowCount; i++) {
            const startIndex = i * colp.length;
            const rowValues = this.up.pars.slice(startIndex, startIndex + colp.length);

            // 添加业务字段值
            values.push(...rowValues);

            // 添加系统字段值（每行都相同）
            values.push(this.up.mid, this.up.uname || '', this.up.utime, this.up[this.tableConfig.uidcid]);
        }

        const result = await this.dbService.m(query, values, this.up, this.dbname);

        // 如果返回结果包含错误信息，设置 res 为负值并返回受影响行数（0）
        if (result.error) {
            this._setBack(-1, result.error);
            return 0;
        }

        return result.affectedRows;
    }

    @ApiMethod()
    async mUpdateIdpk(colp?: string[]): Promise<string> {
        colp = colp || this.up.cols || this.tableConfig.colsImp;
        if (this.up.pars.length < colp.length) {
            colp = colp.slice(0, this.up.pars.length);
        }

        const setClause = colp.map(col => `\`${col}\`=?`).join(',');
        const query = `UPDATE ${this.getDynamicTableName()} SET ${setClause}, \`upby\`=?, \`uptime\`=? WHERE \`idpk\`=? AND \`${this.tableConfig.uidcid}\`=? LIMIT 1`; // 使用动态表名

        const values = this.up.pars.slice(0, colp.length);
        values.push(this.up.uname || '', this.up.utime, this.up.midpk.toString(), this.up[this.tableConfig.uidcid]);

        const result = await this.dbService.m(query, values, this.up, this.dbname);
        if (result.error) {
            this._setBack(-1, result.error);
            return result.error;
        }
        if (result.affectedRows == 0) return this.up.midpk.toString() + " " + this.tableConfig.uidcid + " "
            + this.up[this.tableConfig.uidcid] + " " + JSON.stringify(this.up)
        return result.affectedRows === 1 ? this.up.mid.toString() : result.affectedRows.toString();
    }

    @ApiMethod()
    async mUpdate(colp?: string[]): Promise<string> {
        colp = colp || this.up.cols || this.tableConfig.cols;
        if (this.up.pars.length < colp.length) {
            colp = colp.slice(0, this.up.pars.length);
        }
        const setClause = colp.map(col => `\`${col}\`=?`).join(',');
        const query = `UPDATE ${this.getDynamicTableName()} SET ${setClause}, \`upby\`=?, \`uptime\`=? WHERE \`id\`=? AND \`${this.tableConfig.uidcid}\`=? LIMIT 1`; // 使用动态表名

        const values = this.up.pars.slice(0, colp.length);
        values.push(this.up.uname || '', this.up.utime, this.up.mid, this.up[this.tableConfig.uidcid]);

        const result = await this.dbService.m(query, values, this.up, this.dbname);

        if (result.error) {
            this._setBack(-1, result.error);
            return result.error;
        }

        return result.affectedRows === 1 ? this.up.mid.toString() : result.affectedRows.toString();
    }

    @ApiMethod()
    async midpk(colp?: string[]): Promise<number | string | { sql: string, values: any[] }> {
        const query = `SELECT \`id\`,\`idpk\` FROM ${this.getDynamicTableName()} WHERE \`idpk\`=? AND \`${this.tableConfig.uidcid}\`=?`; // 使用动态表名
        const result = await this.dbService.get(query, [this.up.midpk, this.up[this.tableConfig.uidcid]], this.up, this.dbname);

        if (result.length === 1) {
            this.up.midpk = result[0]["idpk"]
            return this.mUpdateIdpk(colp);
        } else {
            return await this.mAdd(colp);
        }
    }

    @ApiMethod()
    async m(colp?: string[]): Promise<number | string | { sql: string, values: any[] }> {
        const query = `SELECT \`id\`,\`idpk\` FROM ${this.getDynamicTableName()} WHERE \`id\`=? AND \`${this.tableConfig.uidcid}\`=?`; // 使用动态表名
        const result = await this.dbService.get(query, [this.up.mid, this.up[this.tableConfig.uidcid]], this.up, this.dbname);

        if (result.length === 1) {
            this.up.midpk = result[0]["idpk"]
            return this.mUpdateIdpk(colp);
        } else {
            return await this.mAdd(colp);
        }
    }

    @ApiMethod()
    async get(colp?: string[]): Promise<object> {
        // colp现在控制WHERE条件字段名
        // up.pars控制WHERE条件的值
        // SELECT字段改为*

        colp = colp || this.up.cols || this.tableConfig.cols;
        if (this.up.pars.length < colp.length) {
            colp = colp.slice(0, this.up.pars.length);
        }

        let whereClause = `\`${this.tableConfig.uidcid}\`=?`;
        let queryParams = [this.up[this.tableConfig.uidcid]];

        if (colp && this.up.pars && colp.length > 0) {
            for (let i = 0; i < colp.length; i++) {
                whereClause += ` AND \`${colp[i]}\`=?`;
                queryParams.push(this.up.pars[i]);
            }
        }

        const query = `SELECT *    FROM ${this.getDynamicTableName()} WHERE ${whereClause} ORDER BY ${this.up.order} LIMIT ${this.up.getstart}, ${this.up.getnumber}`; // 使用动态表名

        return this.dbService.get(query, queryParams, this.up, this.dbname);
    }
    @ApiMethod()
    async del(): Promise<string> {
        const query = `DELETE FROM ${this.getDynamicTableName()} WHERE \`id\`=? AND \`${this.tableConfig.uidcid}\`=? LIMIT 1`; // 使用动态表名
        const result = await this.dbService.m(query, [this.up.mid, this.up[this.tableConfig.uidcid]], this.up, this.dbname);

        if (result.error) {
            this._setBack(-1, result.error);
            return result.error;
        }

        return result.affectedRows === 0 ? "err:没有行被修改" : this.up.mid.toString();
    }

    protected createQueryBuilder(): QueryBuilder<T> {
        return new QueryBuilder<T>(this.tableConfig.cols);
    }

    /**
     * 没有办法获取ID的情况下 但第一个字段唯一
     * 示例 :第一个字段为唯一
     *   up = UpInfo.getMaster()
        up.cols=["card","lastval"]
        up.set_par(ts_code,price)
        tmp=await up.send_back("apistock/stock/stock_mine/mByFirstField", up)
     * @returns
     */
    @ApiMethod()
    async mByFirstField(colp?: string[]): Promise<number | string | { sql: string, values: any[] }> {
        const firstField = this.tableConfig.cols[0];
        const firstFieldValue = this.up.pars[0];
        //console.log(`mByFirstField:` + this.up.debug + " " + this.up.uname + "  " + this.up.cid)
        const query = `SELECT \`id\`,\`idpk\` FROM ${this.getDynamicTableName()} WHERE \`${firstField}\`=? AND \`${this.tableConfig.uidcid}\`=?`; // 使用动态表名
        const result = await this.dbService.get(query, [firstFieldValue, this.up[this.tableConfig.uidcid]], this.up, this.dbname);
        //console.log(`mByFirstField33:` + query + " " + this.up[this.tableConfig.uidcid] + " " + firstFieldValue + " " + JSON.stringify(result))
        if (result.length === 1) {
            this.up.mid = result[0]["id"];
            this.up.midpk = result[0]["idpk"];
            return this.mUpdateIdpk();
        } else {
            return await this.mAdd(colp);
        }
    }
}

export class CidBase78<T extends BaseSchema> extends Base78<T> { }
export class UidBase78<T extends BaseSchema> extends Base78<T> { }
