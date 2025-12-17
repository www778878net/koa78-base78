import { TableSet } from './tableConfig';
export declare class Config {
    private static instance;
    private configObject;
    constructor(customConfigPath?: string);
    static getInstance(customConfigPath?: string): Config;
    static resetInstance(): void;
    /**
     * 获取配置项
     * @param key 配置项键名
     */
    get(key: string): any;
    getTable(tableName: string): TableSet | undefined;
    has(key: string): boolean;
}
