import { CidBase78 } from '../../controllers/Base78';
import { ApiMethod } from '../../interfaces/decorators';
import { QueryBuilder } from '../../utils/QueryBuilder';
import { TableSchemas } from '../../config/tableConfig';




export default class Test78 extends CidBase78<TableSchemas['Test78']> {




    @ApiMethod()
    async testMemcachedAdd(): Promise<any> {
        const lockKey = `${this.constructor.name}_2day_report_lock_test`;

        // 尝试获取锁
        const lock = await this.cacheService.add(lockKey, 'locked');
        const reback = await this.cacheService.get(lockKey);
        const back = {
            lock: lock,
            lockKey: lockKey,
            reback: reback
        }
        return back;
    }

    @ApiMethod()
    async testMemcached(): Promise<string> {
        this.cacheService.set("test", "testMemcached");
        return this.cacheService.get("test");
    }

    @ApiMethod()
    async testRedis(): Promise<string> {
        this.cacheService.redisSet("test", "testRedis");
        return this.cacheService.redisGet("test");
    }

    test(): Promise<string> {
        const self = this;
        const up = self.up;
        console.log("test in test" + up.uname);
        return new Promise(async (resolve, reject) => {
            resolve("看到我说明路由ok,中文ok,无权限调用OK" + up.parsn);
            return;
        })
    }

    getConfig78(): Promise<{}> {
        const self = this;
        const up = self.up;
        console.log("test in getConfig78" + up.uname);

        return new Promise(async (resolve, reject) => {
            resolve("不能公开config测试的时候用用")
            //resolve({ Argv: self.Argv, Config: self.Config });
            return;
        })
    }
}