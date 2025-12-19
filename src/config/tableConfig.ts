import { CidSchema, UidSchema, BaseSchema } from '../controllers/BaseSchema';

export interface TableSet {
    tbname: string;
    cols: string[];
    colsImp: string[];
    uidcid: 'cid' | 'uid';
}

export interface TableConfig {
    colsImp: readonly string[];
    uidcid: 'cid' | 'uid';
    apiver: string;
    apisys: string;
}

export const tableConfigs = {
    sys_ip: {
        colsImp: ['ip'] as const,
        uidcid: 'cid' as const,
        apiver: 'apitest',
        apisys: 'testmenu'
    },
    sqlitetest: {
        colsImp: ['field1', 'field2'] as const,
        uidcid: 'cid' as const,
        apiver: 'apitest',
        apisys: 'testmenu'
    },
    Test78: {
        colsImp: ['field1', 'field2'] as const,
        uidcid: 'cid' as const,
        apiver: 'apitest',
        apisys: 'testmenu'
    },
    testtb: {
        colsImp: ['kind', 'item', 'data'] as const,
        uidcid: 'cid' as const,
        apiver: 'apitest',
        apisys: 'testmenu'
    },
} as const;

// 修改TableSchemas类型定义，确保所有表配置都符合BaseSchema要求
export type TableSchemas = {
    [K in keyof typeof tableConfigs]: (typeof tableConfigs[K]['uidcid'] extends 'cid' ? CidSchema : UidSchema) &
    Record<typeof tableConfigs[K]['colsImp'][number], string>;
} & {
    // 允许通过字符串索引访问任意表配置，但始终返回BaseSchema兼容类型
    [key: string]: BaseSchema & { [k: string]: any };
};

// 定义一个更宽松的表结构类型，用于外部表配置
export interface ExternalTableSchema {
    [key: string]: string | number | boolean | undefined;
    idpk?: number;
    upby?: string;
    uptime?: string;
    remark?: string;
    remark2?: string;
    remark3?: string;
    remark4?: string;
    remark5?: string;
    remark6?: string;
}
