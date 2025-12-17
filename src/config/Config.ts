import { injectable } from 'inversify';
import config from 'config';
import * as path from 'path';
import { tableConfigs, TableSet } from './tableConfig';
import * as fs from 'fs';

@injectable()
export class Config {
    private static instance: Config | null = null;
    private configObject: any;

    constructor(customConfigPath?: string) {
        const env = process.env.NODE_ENV || 'development';
        console.log(`初始加载 ${env} 环境的配置`);

        try {
            this.configObject = config;
            console.warn(`加载环境配置${this.configObject.location}`);

            // 首先检查构造函数参数
            let tableConfigFilePath = customConfigPath;

            // 如果构造函数参数为空，则检查环境变量
            if (!tableConfigFilePath) {
                tableConfigFilePath = process.env.TABLE_CONFIG_FILE;
            }

            // 如果环境变量也为空，则检查配置文件中的 tableconfigfile 字段
            if (!tableConfigFilePath) {
                tableConfigFilePath = this.configObject.tableconfigfile;
            }

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

    /**
     * 获取配置项
     * @param key 配置项键名
     */
    public get(key: string): any {
        if (!this.configObject) {
            throw new Error('Config object is not initialized');
        }
        const value = this.configObject[key];
        return value;
    }

    public getTable(tableName: string): TableSet | undefined {
        //console.log(`Attempting to get table config for: ${tableName}`);
        if (!this.configObject.tables) {
            //console.log('Tables configuration not found');
            return undefined;
        }
        const tableConfig = this.configObject.tables[tableName];
        //console.log(`Raw table config for ${tableName}:`, tableConfig);
        if (!tableConfig) {
            //console.log(`Table config for ${tableName} not found`);
            return undefined;
        }
        const result: TableSet = {
            tbname: tableName.toLowerCase(),
            cols: [...tableConfig.colsImp, 'remark', 'remark2', 'remark3', 'remark4', 'remark5', 'remark6'],
            colsImp: tableConfig.colsImp,
            uidcid: tableConfig.uidcid
        };
        //console.log(`Processed table config for ${tableName}:`, result);
        return result;
    }

    public has(key: string): boolean {
        return config.has(key);
    }
}