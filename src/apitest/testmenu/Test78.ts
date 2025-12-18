import { CidBase78 } from '../../controllers/Base78';
import { ApiMethod } from '../../interfaces/decorators';
import { QueryBuilder } from '../../utils/QueryBuilder';
import { TableSchemas } from '../../config/tableConfig';




export default class Test78 extends CidBase78<TableSchemas['Test78']> {


    @ApiMethod()
    async getConfig78(): Promise<string> {
        this.logger.info("getConfig78 method called");  // 使用 .info() 方法
        return JSON.stringify({ back: "不能公开config测试的时候用用" });
    }

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
}