import { CidSchema, UidSchema, BaseSchema } from '../controllers/BaseSchema';

export interface TableSet {
    tbname: string;
    cols: string[];
    colsImp: string[];
    uidcid: 'cid' | 'uid';
}

export interface TableConfig {
    colsImp: readonly string[];
    apiver: string;
    apisys: string;
}

export const tableConfigs = {
    sys_ip: {
        colsImp: ['ip'] as const,
        apiver: 'apitest',
        apisys: 'testmenu'
    },
    sqlitetest: {
        colsImp: ['field1', 'field2'] as const,
        apiver: 'apitest',
        apisys: 'testmenu'
    },
    Test78: {
        colsImp: ['field1', 'field2'] as const,
        apiver: 'apitest',
        apisys: 'testmenu'
    },
    testtb: {
        colsImp: ['kind', 'item', 'data'] as const,
        apiver: 'apitest',
        apisys: 'testmenu'
    },
} as const;

// 修改TableSchemas类型定义，确保所有表配置都符合BaseSchema要求
export type TableSchemas = {
    [K in keyof typeof tableConfigs]: 
        // 默认全部使用CidSchema，除非特别指定
        CidSchema &
        Record<typeof tableConfigs[K]['colsImp'][number], string>;
} & {
    // 允许通过字符串索引访问任意表配置，但始终返回BaseSchema兼容类型
    [key: string]: BaseSchema & { [k: string]: any };
};