import { CidBase78 } from '../../controllers/Base78';
import { TableSchemas } from '../../config/tableConfig';
export default class Test78 extends CidBase78<TableSchemas['Test78']> {
    constructor();
    testMemcachedAdd(): Promise<any>;
    testMemcached(): Promise<string>;
    testRedis(): Promise<string>;
    testShardingConfig(): Promise<any>;
    testDynamicTableName(): Promise<string>;
    testPerformShardingMaintenance(): Promise<string>;
    test2(): Promise<string>;
    test(): Promise<string>;
    getConfig78(): Promise<{}>;
}
