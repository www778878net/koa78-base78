import { CidSchema, UidSchema } from '../controllers/BaseSchema';
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

// type CommonFields = 'id' | 'idpk' | 'upby' | 'uptime';  // 注释掉这行

export type TableSchemas = {
    [K in keyof typeof tableConfigs]: (typeof tableConfigs[K]['uidcid'] extends 'cid' ? CidSchema : UidSchema) &
    Record<typeof tableConfigs[K]['colsImp'][number], string>;
};