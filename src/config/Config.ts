import { injectable } from 'inversify';
import config from 'config';
import * as fs from 'fs';
import { tableConfigs, TableSet } from './tableConfig';

@injectable()
export class Config {
    private static instance: Config | null = null;
    private configObject: any;

    constructor() {
        // 修改配置加载逻辑，优先使用 CONFIG_FILE 环境变量指定的配置文件
        const configFile = process.env.CONFIG_FILE;
        const env = process.env.NODE_ENV || 'development';
        console.log(`初始加载 ${env} 环境的配置`);

        try {
            if (configFile && fs.existsSync(configFile)) {
                // 如果指定了 CONFIG_FILE 环境变量且文件存在，则直接加载该文件
                console.log(`使用 CONFIG_FILE 指定的配置文件: ${configFile}`);
                this.configObject = JSON.parse(fs.readFileSync(configFile, 'utf-8'));
            } else {
                // 否则使用 config 包按环境加载配置
                this.configObject = config;
                console.log(`加载环境配置: ${config.util.getEnv('NODE_ENV')}`);
            }

            // 从环境变量或配置中获取表配置文件路径
            const tableConfigFilePath = this.configObject.tableconfigfile;

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
            // 出错时使用默认配置
            this.configObject = {
                tables: tableConfigs
            };
        }
    }

    public static getInstance(): Config {
        if (!Config.instance) {
            Config.instance = new Config();
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