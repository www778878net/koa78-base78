import { TableSet } from './tableConfig';
export declare class Config {
    private static instance;
    private configObject;
    constructor();
    /**
     * 初始化配置
     * 这个方法应该在容器初始化时被显式调用
     */
    init(): void;
    static getInstance(): Config;
    static resetInstance(): void;
    /**
     * 获取配置项
     * @param key 配置项键名
     */
    get(key: string): any;
    getTable(tableName: string): TableSet | undefined;
    has(key: string): boolean;
    private loadExternalConfig;
}
