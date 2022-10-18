import UpInfo from '@www778878net/koa78-upinfo'

//import MemCache78 from "./MemCache78";

export default class Base78Amd {
    up: UpInfo;
    //memcache: MemCache78;
    //表相关属性
    tbname: string = "";
    cols: string[] = [];//所有列
    colsImp: string[] = [];//除remark外
    uidcid: string = "cid";//cid uid zid(都有可能) nid（都不用)
    colsremark: string[] = [];//所有表都有的默认字段

    constructor(ctx: any) {
        this.up = new UpInfo(ctx);

    }
}