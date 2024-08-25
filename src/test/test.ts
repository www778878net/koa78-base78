import Base78 from "../dlldata/Base78";



export default class test extends Base78 {
    constructor(ctx: any) {

        super(ctx);
        //this.uidcid = "uid";
        this.tbname = "test";
        //这个不是表
        this.colsImp = [];
        this.cols = this.colsImp.concat(this.colsremark);
    }

    testredis(): Promise<string> {
        const self = this;
        const up = self.up;

        return new Promise(async (resolve, reject) => {
            const setback = await self.redis.set("testitem", 8, 60);
            const getback = await self.redis.get("testitem")
            resolve(getback);
            return;
        })
    }

}
