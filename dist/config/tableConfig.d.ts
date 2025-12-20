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
export declare const tableConfigs: {
    readonly sys_ip: {
        readonly colsImp: readonly ["ip"];
        readonly uidcid: "cid";
        readonly apiver: "apitest";
        readonly apisys: "testmenu";
    };
    readonly sqlitetest: {
        readonly colsImp: readonly ["field1", "field2"];
        readonly uidcid: "cid";
        readonly apiver: "apitest";
        readonly apisys: "testmenu";
    };
    readonly Test78: {
        readonly colsImp: readonly ["field1", "field2"];
        readonly uidcid: "cid";
        readonly apiver: "apitest";
        readonly apisys: "testmenu";
    };
    readonly testtb: {
        readonly colsImp: readonly ["kind", "item", "data"];
        readonly uidcid: "cid";
        readonly apiver: "apitest";
        readonly apisys: "testmenu";
    };
};
export type TableSchemas = {
    [K in keyof typeof tableConfigs]: (typeof tableConfigs[K]['uidcid'] extends 'cid' ? CidSchema : UidSchema) & Record<typeof tableConfigs[K]['colsImp'][number], string>;
} & {
    [key: string]: BaseSchema & {
        [k: string]: any;
    };
};
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
