import { Container } from 'inversify';
import { DatabaseConnections, MySQLConfig, MemcachedConfig, RedisConfig } from '../static/DatabaseConnections';
import { Config } from '../config/Config';
import { DatabaseService } from './DatabaseService';
import { CacheService } from './CacheService';
import { AuthService } from './AuthService';
import LoggerService from './LoggerService';
import { ControllerLoader } from '../utils/ControllerLoader';
import testtb from '../apitest/testmenu/testtb';


const log = LoggerService.getLogger();

log.detail('Starting ContainerManager initialization');

const container = new Container();

// 绑定 Config
container.bind(Config).toSelf().inSingletonScope();
const config = container.get<Config>(Config);

// 使用 config 实例获取配置
const mysqlsConfig = config.get('mysqls');
const memcachedConfig = config.get('memcached');
const redisConfig = config.get('redis');


// 初始化 DatabaseConnections
const dbConnections = DatabaseConnections.getInstance(mysqlsConfig, memcachedConfig, redisConfig);
container.bind(DatabaseConnections).toConstantValue(dbConnections);

// 绑定其他服务
container.bind(DatabaseService).toSelf().inSingletonScope();
container.bind(CacheService).toSelf().inSingletonScope();
container.bind(AuthService).toSelf().inSingletonScope();
container.bind(LoggerService).toConstantValue(LoggerService);
container.bind(ControllerLoader).toSelf().inSingletonScope();


// 初始化 DatabaseService 和 CacheService
const databaseService = container.get(DatabaseService);
databaseService.setDatabaseConnections(dbConnections);

const cacheService = container.get(CacheService);
cacheService.setMemcache(dbConnections);

// 绑定 testtb 控制器
container.bind(testtb).toSelf().inSingletonScope();

log.detail('Services bound to container');

// 初始化 ControllerLoader
const controllerLoader = container.get(ControllerLoader);
// controllerLoader 的构造函数中已经调用了 loadControllers 方法

log.detail('ContainerManager initialization completed');
 

export { container };
export default container;
