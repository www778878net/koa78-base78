import UpInfo from '@www778878net/koa78-upinfo'

//import MemCache78 from "./MemCache78";

export default class Base78Amd {
    up: UpInfo;
    //memcache: MemCache78;
    //���������
    tbname: string = "";
    cols: string[] = [];//������
    colsImp: string[] = [];//��remark��
    uidcid: string = "cid";//cid uid zid(���п���) nid��������)
    colsremark: string[] = [];//���б��е�Ĭ���ֶ�

    constructor(ctx: any) {
        this.up = new UpInfo(ctx);

    }
}