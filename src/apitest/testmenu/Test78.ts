import { CidBase78 } from '../../controllers/Base78';
import { ApiMethod } from '../../interfaces/decorators';
import { QueryBuilder } from '../../utils/QueryBuilder';
import { TableSchemas } from '../../config/tableConfig';


export default class Test78 extends CidBase78<TableSchemas['Test78']> {

    constructor() {
        super();
        // 设置分表配置示例 - 按天分表
        this.setShardingConfig({
            type: 'daily',
            retentionDays: 5,           // 保留5天的表   
            tableSQL: `
                CREATE TABLE IF NOT EXISTS {TABLE_NAME} (
                    id VARCHAR(36) NOT NULL DEFAULT '',
                    name VARCHAR(100) NOT NULL DEFAULT '',
                    content TEXT NOT NULL,
                    upby VARCHAR(50) NOT NULL DEFAULT '',
                    uptime DATETIME NOT NULL,
                    idpk INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                    ${this.tableConfig.uidcid} VARCHAR(36) NOT NULL DEFAULT ''
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3
            `
        });
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

    @ApiMethod()
    async testShardingConfig(): Promise<any> {
        // 测试分表配置是否正确设置
        return {
            shardingType: this.shardingConfig?.type,
            retentionDays: this.shardingConfig?.retentionDays,
            createFutureDays: this.shardingConfig?.createFutureDays,
            createPastDays: this.shardingConfig?.createPastDays,
            hasTableSQL: !!this.shardingConfig?.tableSQL
        };
    }

    @ApiMethod()
    async testDynamicTableName(): Promise<string> {
        // 测试动态表名生成
        return this.getDynamicTableName();
    }

    @ApiMethod()
    async testPerformShardingMaintenance(): Promise<string> {
        try {
            // 执行分表维护任务
            await this.performShardingTableMaintenance();
            return "分表维护任务执行成功";
        } catch (error) {
            return `分表维护任务执行失败: ${error.message}`;
        }
    }

    @ApiMethod()
    test2(): Promise<string> {
        const self = this;
        const up = self.up;
        console.log("test   in3 test2" + up.uname);
        return new Promise(async (resolve, reject) => {
            resolve("有权限调用OK" + up.parsn);
            return;
        })
    }

    test(): Promise<string> {
        const self = this;
        const up = self.up;
        console.log("testtb in test" + up.uname);
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