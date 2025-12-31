"use strict";
var Config_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Config = void 0;
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const config_1 = tslib_1.__importDefault(require("config"));
const fs = tslib_1.__importStar(require("fs"));
const path = tslib_1.__importStar(require("path"));
const tableConfig_1 = require("./tableConfig");
let Config = Config_1 = class Config {
    constructor() {
        // 构造函数中不再自动加载配置，等待显式调用init方法
    }
    /**
     * 初始化配置
     * 这个方法应该在容器初始化时被显式调用
     */
    init() {
        Config_1.instance = this;
        // 修改配置加载逻辑，优先使用 CONFIG_FILE 环境变量指定的配置文件
        const configFile = process.env.CONFIG_FILE;
        const env = process.env.NODE_ENV || 'development';
        console.log(`初始加载 ${env} 环境的配置`);
        try {
            if (configFile && fs.existsSync(configFile)) {
                // 如果指定了 CONFIG_FILE 环境变量且文件存在，则直接加载该文件
                console.log(`使用 CONFIG_FILE 指定的配置文件: ${configFile}`);
                this.configObject = JSON.parse(fs.readFileSync(configFile, 'utf-8'));
            }
            else {
                // 否则使用 config 包按环境加载配置
                this.configObject = config_1.default;
                console.log(`加载环境配置: ${config_1.default.util.getEnv('NODE_ENV')}`);
            }
            // 添加调试日志，输出配置内容
            console.log('Loaded config object:', JSON.stringify(this.configObject, null, 2));
            // 从环境变量或配置中获取表配置文件路径
            let tableConfigFilePath = this.configObject.tableconfigfile;
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
                    console.log(`外部表配置文件不存在: ${tableConfigFilePath}，使用默认配置`);
                    // 文件不存在，使用默认配置
                    this.configObject.tables = tableConfig_1.tableConfigs;
                }
            }
            else {
                // 未指定，使用默认配置
                this.configObject.tables = tableConfig_1.tableConfigs;
                console.log(`使用默认表配置`);
            }
        }
        catch (error) {
            console.error('配置加载失败:', error);
            // 出现任何错误时，使用默认配置
            this.configObject = Object.assign(Object.assign({}, config_1.default), { tables: tableConfig_1.tableConfigs });
        }
    }
    static getInstance() {
        if (!Config_1.instance) {
            Config_1.instance = new Config_1();
        }
        return Config_1.instance;
    }
    static resetInstance() {
        Config_1.instance = null;
    }
    /**
     * 获取配置项
     * @param key 配置项键名
     */
    get(key) {
        if (!this.configObject) {
            throw new Error('Config object is not initialized');
        }
        const value = this.configObject[key];
        return value;
    }
    getTable(tableName) {
        //console.log(`Attempting to get table config for: ${tableName}`);
        if (!this.configObject.tables) {
            //console.log('Tables configuration not found');
            return undefined;
        }
        const tableConfig = this.configObject.tables[tableName];
        //console.log(`Raw table config for ${tableName}:`, tableConfig);
        if (!tableConfig) {
            //console.log('完整配置:', JSON.stringify(this.configObject, null, 2));
            //console.log(`Table config for ${tableName} not found`);
            return undefined;
        }
        const result = {
            tbname: tableName.toLowerCase(),
            cols: [...tableConfig.colsImp, 'remark', 'remark2', 'remark3', 'remark4', 'remark5', 'remark6'],
            colsImp: tableConfig.colsImp,
            uidcid: tableConfig.uidcid
        };
        //console.log(`Processed table config for ${tableName}:`, result);
        return result;
    }
    has(key) {
        return config_1.default.has(key);
    }
    loadExternalConfig(filePath) {
        try {
            delete require.cache[require.resolve(filePath)];
            const customConfigs = require(filePath);
            // 处理多一层结构的问题
            this.configObject.tables = customConfigs.tableConfigs || customConfigs;
            console.log(`成功加载外部表配置: ${filePath}`);
        }
        catch (error) {
            console.error(`加载外部表配置失败: ${filePath}`, error);
            // 失败时回退到默认配置
            this.configObject.tables = tableConfig_1.tableConfigs;
        }
    }
};
Config.instance = null;
Config = Config_1 = tslib_1.__decorate([
    (0, inversify_1.injectable)(),
    tslib_1.__metadata("design:paramtypes", [])
], Config);
exports.Config = Config;
//# sourceMappingURL=Config.js.map