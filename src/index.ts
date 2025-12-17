export {
    BaseSchema,
    CidSchema,
    UidSchema,
} from './controllers/BaseSchema';

export {
    AppInitializer,
    initializeApp,
    getConfigPathFromArgs
} from './AppInitializer';

export {
    Config,
} from './config/Config';

export {
    DatabaseConnections,
} from './static/DatabaseConnections';

export {
    DatabaseService,
} from './services/DatabaseService';

export {
    CacheService,
} from './services/CacheService';

// 注意：初始化代码不会自动运行，用户需要明确实例化 AppInitializer 来触发初始化过程
// 示例：
// import { AppInitializer } from 'koa78-base78';
// const app = new AppInitializer('/path/to/config.json');
// const container = app.initializeAll();