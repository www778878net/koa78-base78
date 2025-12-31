import { Agent } from '../base/agent';
import { TsLog78 } from 'tslog78';
import * as fs from 'fs';
import * as path from 'path';
import config from 'config';
import { tableConfigs } from '../../config/tableConfig';

const log = TsLog78.Instance;

export class ConfigAgent extends Agent {
    private config: Record<string, any> = {};

    constructor() {
        super(); // 调用父类的构造函数

        // 构造函数中不再自动加载配置，等待显式调用init方法
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

    /**
     * 初始化配置
     * 这个方法应该在容器初始化时被显式调用
     */
    public init(): void {
        // 修改配置加载逻辑，优先使用 CONFIG_FILE 环境变量指定的配置文件
        const configFile = process.env.CONFIG_FILE;
        const env = process.env.NODE_ENV || 'development';
        log.info(`初始加载 ${env} 环境的配置`);

        try {
            if (configFile && fs.existsSync(configFile)) {
                // 如果指定了 CONFIG_FILE 环境变量且文件存在，则直接加载该文件
                log.info(`使用 CONFIG_FILE 指定的配置文件: ${configFile}`);
                this.config = JSON.parse(fs.readFileSync(configFile, 'utf-8'));
            } else {
                // 否则使用 config 包按环境加载配置
                this.config = config;
                log.info(`加载环境配置: ${config.util.getEnv('NODE_ENV')}`);
            }

            // 添加调试日志，输出配置内容
            log.debug('Loaded config object:', JSON.stringify(this.config, null, 2));

            // 从环境变量或配置中获取表配置文件路径
            let tableConfigFilePath = this.config.tableconfigfile;

            // 如果指定了外部配置文件路径，则相对于用户项目根目录解析路径
            if (tableConfigFilePath) {
                // 如果是相对路径，则相对于用户项目根目录解析
                if (!path.isAbsolute(tableConfigFilePath)) {
                    tableConfigFilePath = path.resolve(process.cwd(), tableConfigFilePath);
                }

                // 如果文件存在，则使用外部配置
                if (fs.existsSync(tableConfigFilePath)) {
                    this.loadExternalConfig(tableConfigFilePath);
                } else {
                    log.info(`外部表配置文件不存在: ${tableConfigFilePath}，使用默认配置`);
                    // 文件不存在，使用默认配置
                    this.config.tables = tableConfigs;
                }
            } else {
                // 未指定，使用默认配置
                this.config.tables = tableConfigs;
                log.info(`使用默认表配置`);
            }
        } catch (error) {
            log.error('配置加载失败:', error);
            // 出现任何错误时，使用默认配置
            this.config = {
                ...config,
                tables: tableConfigs
            };
        }
    }

    private loadExternalConfig(filePath: string): void {
        try {
            delete require.cache[require.resolve(filePath)];
            const customConfigs = require(filePath);
            // 处理多一层结构的问题
            this.config.tables = customConfigs.tableConfigs || customConfigs;
            log.info(`成功加载外部表配置: ${filePath}`);
        } catch (error) {
            log.error(`加载外部表配置失败: ${filePath}`, error);
            // 失败时回退到默认配置
            this.config.tables = tableConfigs;
        }
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

    public getTable(tableName: string): any {
        if (!this.config.tables) {
            log.debug('Tables configuration not found');
            return undefined;
        }
        const tableConfig = this.config.tables[tableName];
        if (!tableConfig) {
            log.debug(`Table config for ${tableName} not found`);
            return undefined;
        }
        return {
            tbname: tableName.toLowerCase(),
            cols: [...tableConfig.colsImp, 'remark', 'remark2', 'remark3', 'remark4', 'remark5', 'remark6'],
            colsImp: tableConfig.colsImp,
            uidcid: tableConfig.uidcid
        };
    }
}