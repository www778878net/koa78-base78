export interface BaseSchema {
    id: string;
    idpk: number;
    upby: string;
    uptime: Date;
    remark?: string;
    remark2?: string;
    remark3?: string;
    remark4?: string;
    remark5?: string;
    remark6?: string;
}

export interface CidSchema extends BaseSchema {
    cid: string;
}

export interface UidSchema extends BaseSchema {
    uid: string;
}
