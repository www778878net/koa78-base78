"use strict";
var Config_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Config = void 0;
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const config_1 = tslib_1.__importDefault(require("config"));
const fs = tslib_1.__importStar(require("fs"));
const tableConfig_1 = require("./tableConfig");
let Config = Config_1 = class Config {
    constructor(customConfigPath) {
        const env = process.env.NODE_ENV || 'development';
        console.log(`初始加载 ${env} 环境的配置`);
        try {
            this.configObject = config_1.default;
            console.log(`加载环境配置: ${config_1.default.util.getEnv('NODE_ENV')}`);
            // 检查构造函数参数是否指定表配置文件路径
            let tableConfigFilePath = customConfigPath;
            // 如果未通过构造函数参数指定，则检查配置文件中的 tableconfigfile 字段
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
                }
                catch (error) {
                    console.error(`加载外部表配置失败: ${tableConfigFilePath}`, error);
                    // 失败时回退到默认配置
                    this.configObject.tables = tableConfig_1.tableConfigs;
                }
            }
            else {
                // 未指定或文件不存在，使用默认配置
                this.configObject.tables = tableConfig_1.tableConfigs;
            }
        }
        catch (error) {
            console.error('加载配置时出错:', error);
            // 出错时使用默认配置
            this.configObject = {
                tables: tableConfig_1.tableConfigs
            };
        }
    }
    static getInstance(customConfigPath) {
        if (!Config_1.instance) {
            Config_1.instance = new Config_1(customConfigPath);
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
};
Config.instance = null;
Config = Config_1 = tslib_1.__decorate([
    (0, inversify_1.injectable)(),
    tslib_1.__metadata("design:paramtypes", [String])
], Config);
exports.Config = Config;
//# sourceMappingURL=Config.js.map