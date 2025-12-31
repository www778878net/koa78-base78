import { CidSchema, BaseSchema } from '../controllers/BaseSchema';
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
export declare const tableConfigs: {
    readonly sys_ip: {
        readonly colsImp: readonly ["ip"];
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
    [K in keyof typeof tableConfigs]: CidSchema & Record<typeof tableConfigs[K]['colsImp'][number], string>;
} & {
    [key: string]: BaseSchema & {
        [k: string]: any;
    };
};
