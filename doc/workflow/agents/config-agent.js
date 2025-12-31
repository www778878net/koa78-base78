"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigAgent = void 0;
const tslib_1 = require("tslib");
const agent_1 = require("../base/agent");
const tslog78_1 = require("tslog78");
const fs = tslib_1.__importStar(require("fs"));
const path = tslib_1.__importStar(require("path"));
const config_1 = tslib_1.__importDefault(require("config"));
const tableConfig_1 = require("../../config/tableConfig");
const log = tslog78_1.TsLog78.Instance;
class ConfigAgent extends agent_1.Agent {
    constructor() {
        super(); // 调用父类的构造函数
        this.config = {};
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
    init() {
        // 修改配置加载逻辑，优先使用 CONFIG_FILE 环境变量指定的配置文件
        const configFile = process.env.CONFIG_FILE;
        const env = process.env.NODE_ENV || 'development';
        log.info(`初始加载 ${env} 环境的配置`);
        try {
            if (configFile && fs.existsSync(configFile)) {
                // 如果指定了 CONFIG_FILE 环境变量且文件存在，则直接加载该文件
                log.info(`使用 CONFIG_FILE 指定的配置文件: ${configFile}`);
                this.config = JSON.parse(fs.readFileSync(configFile, 'utf-8'));
            }
            else {
                // 否则使用 config 包按环境加载配置
                this.config = config_1.default;
                log.info(`加载环境配置: ${config_1.default.util.getEnv('NODE_ENV')}`);
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
                }
                else {
                    log.info(`外部表配置文件不存在: ${tableConfigFilePath}，使用默认配置`);
                    // 文件不存在，使用默认配置
                    this.config.tables = tableConfig_1.tableConfigs;
                }
            }
            else {
                // 未指定，使用默认配置
                this.config.tables = tableConfig_1.tableConfigs;
                log.info(`使用默认表配置`);
            }
        }
        catch (error) {
            log.error('配置加载失败:', error);
            // 出现任何错误时，使用默认配置
            this.config = Object.assign(Object.assign({}, config_1.default), { tables: tableConfig_1.tableConfigs });
        }
    }
    loadExternalConfig(filePath) {
        try {
            delete require.cache[require.resolve(filePath)];
            const customConfigs = require(filePath);
            // 处理多一层结构的问题
            this.config.tables = customConfigs.tableConfigs || customConfigs;
            log.info(`成功加载外部表配置: ${filePath}`);
        }
        catch (error) {
            log.error(`加载外部表配置失败: ${filePath}`, error);
            // 失败时回退到默认配置
            this.config.tables = tableConfig_1.tableConfigs;
        }
    }
    get(key) {
        const keys = key.split('.');
        let value = this.config;
        for (const k of keys) {
            if (value === undefined || value === null) {
                return undefined;
            }
            value = value[k];
        }
        return value;
    }
    set(key, value) {
        const keys = key.split('.');
        let current = this.config;
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
    load(configData) {
        this.config = Object.assign(Object.assign({}, this.config), configData);
        log.info('ConfigAgent loaded new configuration');
    }
    getAll() {
        return Object.assign({}, this.config);
    }
    getTable(tableName) {
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
exports.ConfigAgent = ConfigAgent;
//# sourceMappingURL=config-agent.js.map