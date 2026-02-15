// 创建一个默认导出对象，将所有导出项挂载在其上
import {
    BaseSchema,
    CidSchema,
    UidSchema,
} from './controllers/BaseSchema';

import {
    default as Base78,
    CidBase78,
    UidBase78
} from './controllers/Base78';

import {
    Config,
} from './config/Config';

import {
    TableSet,
    TableConfig,
    tableConfigs,
    TableSchemas
} from './config/tableConfig';

import {
    DatabaseConnections,
} from './static/DatabaseConnections';

import {
    DatabaseService,
} from './services/DatabaseService';

import {
    CacheService,
} from './services/CacheService';

import {
    AuthService,
} from './services/AuthService';

import {
    default as Elasticsearch78
} from './services/elasticsearch78';

import {
    default as Request78
} from './dll78/Request78';

import {
    QueryBuilder,
} from './utils/QueryBuilder';

import {
    ApiMethod,
} from './interfaces/decorators';

import {
    ContainerManager,
} from './ContainerManager';

import {
    ControllerLoader,
} from './utils/ControllerLoader';

import { Server } from './server';

import {
    default as UpInfo
} from '../Upinfo';

// 创建默认导出对象
const koa78Base78 = {
    Base78,
    CidBase78,
    UidBase78,
    Config,
    tableConfigs,
    DatabaseConnections,
    DatabaseService,
    CacheService,
    AuthService,
    Elasticsearch78,
    Request78,
    QueryBuilder,
    ApiMethod,
    ContainerManager,
    ControllerLoader,
    Server,
    UpInfo
};

// 导出所有内容
export {
    BaseSchema,
    CidSchema,
    UidSchema,
    Base78,
    CidBase78,
    UidBase78,
    Config,
    TableSet,
    TableConfig,
    tableConfigs,
    TableSchemas,
    DatabaseConnections,
    DatabaseService,
    CacheService,
    AuthService,
    Elasticsearch78,
    Request78,
    QueryBuilder,
    ApiMethod,
    ContainerManager,
    ControllerLoader,
    Server,
    UpInfo
};

// 默认导出整个对象
export default koa78Base78;