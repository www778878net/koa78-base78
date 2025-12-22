import { BaseSchema, CidSchema, UidSchema } from './controllers/BaseSchema';
import { default as Base78, CidBase78, UidBase78 } from './controllers/Base78';
import { Config } from './config/Config';
import { TableSet, TableConfig, tableConfigs, TableSchemas } from './config/tableConfig';
import { DatabaseConnections } from './static/DatabaseConnections';
import { DatabaseService } from './services/DatabaseService';
import { CacheService } from './services/CacheService';
import { AuthService } from './services/AuthService';
import { default as Elasticsearch78 } from './services/elasticsearch78';
import { default as Request78 } from './dll78/Request78';
import { QueryBuilder } from './utils/QueryBuilder';
import { ApiMethod } from './interfaces/decorators';
import { ContainerManager } from './ContainerManager';
import { ControllerLoader } from './utils/ControllerLoader';
import { Server } from './server';
declare const koa78Base78: {
    Base78: typeof Base78;
    CidBase78: typeof CidBase78;
    UidBase78: typeof UidBase78;
    Config: typeof Config;
    tableConfigs: {
        readonly sys_ip: {
            readonly colsImp: readonly ["ip"];
            readonly uidcid: "cid";
            readonly apiver: "apitest";
            readonly apisys: "testmenu";
        };
        readonly Test78: {
            readonly colsImp: readonly ["field1", "field2"];
            readonly uidcid: "cid";
            readonly apiver: "apitest";
            readonly apisys: "testmenu";
        };
        readonly testtb: {
            readonly colsImp: readonly ["kind", "item", "data"];
            readonly uidcid: "cid";
            readonly apiver: "apitest";
            readonly apisys: "testmenu";
        };
    };
    DatabaseConnections: typeof DatabaseConnections;
    DatabaseService: typeof DatabaseService;
    CacheService: typeof CacheService;
    AuthService: typeof AuthService;
    Elasticsearch78: typeof Elasticsearch78;
    Request78: typeof Request78;
    QueryBuilder: typeof QueryBuilder;
    ApiMethod: typeof ApiMethod;
    ContainerManager: typeof ContainerManager;
    ControllerLoader: typeof ControllerLoader;
    Server: typeof Server;
};
export { BaseSchema, CidSchema, UidSchema, Base78, CidBase78, UidBase78, Config, TableSet, TableConfig, tableConfigs, TableSchemas, DatabaseConnections, DatabaseService, CacheService, AuthService, Elasticsearch78, Request78, QueryBuilder, ApiMethod, ContainerManager, ControllerLoader, Server };
export default koa78Base78;
