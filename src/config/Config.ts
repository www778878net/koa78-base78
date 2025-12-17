import { injectable } from 'inversify';
import config from 'config';
import * as path from 'path';
import { tableConfigs, TableConfig } from './tableConfig';
import * as fs from 'fs';

@injectable()
export class Config {
    private static instance: Config | null = null;
    private configObject: any;

    private constructor(customConfigPath?: string) {
        const env = process.env.NODE_ENV || 'development';
        console.log(`初始加载 ${env} 环境的配置`);

        try {
            this.configObject = config;
            console.warn(`加载环境配置${this.configObject.location}`);

            // 检查配置中是否有 tableconfigfile 字段
            let tableConfigFilePath = this.configObject.tableconfigfile;

            // 如果指定了外部配置文件路径且文件存在，则使用外部配置
            if (tableConfigFilePath && fs.existsSync(tableConfigFilePath)) {
                try {
                    delete require.cache[require.resolve(tableConfigFilePath)];
                    const customConfigs = require(tableConfigFilePath);
                    this.configObject.tables = customConfigs;
                    console.log(`成功加载外部表配置: ${tableConfigFilePath}`);
                } catch (error) {
                    console.error(`加载外部表配置失败: ${tableConfigFilePath}`, error);
                    // 失败时回退到默认配置
                    this.configObject.tables = tableConfigs;
                }
            } else {
                // 未指定或文件不存在，使用默认配置
                this.configObject.tables = tableConfigs;
            }
        } catch (error) {
            console.error('加载配置时出错:', error);
            throw error;
        }
    }

    public static getInstance(customConfigPath?: string): Config {
        if (!Config.instance) {
            Config.instance = new Config(customConfigPath);
        }
        return Config.instance;
    }

    public static resetInstance(): void {
        Config.instance = null;
    }

    public get(key: string): any {
        if (!this.configObject) {
            throw new Error('Config object is not initialized');
        }
        const value = this.configObject[key];
        return value;
    }

    public getTable(tableName: string): TableConfig | undefined {
        if (!this.configObject.tables) {
            return undefined;
        }
        const tableConfig = this.configObject.tables[tableName];
        if (!tableConfig) {
            return undefined;
        }
        const result = {
            tbname: tableName.toLowerCase(),
            cols: [...tableConfig.colsImp, 'remark', 'remark2', 'remark3', 'remark4', 'remark5', 'remark6'],
            colsImp: tableConfig.colsImp,
            uidcid: tableConfig.uidcid
        };
        return result;
    }

    public has(key: string): boolean {
        return config.has(key);
    }
}