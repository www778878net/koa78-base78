import { Agent } from '../base/agent';
export declare class ConfigAgent extends Agent {
    private config;
    constructor();
    /**
     * 初始化配置
     * 这个方法应该在容器初始化时被显式调用
     */
    init(): void;
    private loadExternalConfig;
    get(key: string): any;
    set(key: string, value: any): void;
    load(configData: Record<string, any>): void;
    getAll(): Record<string, any>;
    getTable(tableName: string): any;
}
