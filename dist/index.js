"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Server = exports.ControllerLoader = exports.ContainerManager = exports.ApiMethod = exports.QueryBuilder = exports.Request78 = exports.Elasticsearch78 = exports.AuthService = exports.CacheService = exports.DatabaseService = exports.DatabaseConnections = exports.tableConfigs = exports.Config = exports.UidBase78 = exports.CidBase78 = exports.Base78 = void 0;
const tslib_1 = require("tslib");
const Base78_1 = tslib_1.__importStar(require("./controllers/Base78"));
Object.defineProperty(exports, "Base78", { enumerable: true, get: function () { return Base78_1.default; } });
Object.defineProperty(exports, "CidBase78", { enumerable: true, get: function () { return Base78_1.CidBase78; } });
Object.defineProperty(exports, "UidBase78", { enumerable: true, get: function () { return Base78_1.UidBase78; } });
const Config_1 = require("./config/Config");
Object.defineProperty(exports, "Config", { enumerable: true, get: function () { return Config_1.Config; } });
const tableConfig_1 = require("./config/tableConfig");
Object.defineProperty(exports, "tableConfigs", { enumerable: true, get: function () { return tableConfig_1.tableConfigs; } });
const DatabaseConnections_1 = require("./static/DatabaseConnections");
Object.defineProperty(exports, "DatabaseConnections", { enumerable: true, get: function () { return DatabaseConnections_1.DatabaseConnections; } });
const DatabaseService_1 = require("./services/DatabaseService");
Object.defineProperty(exports, "DatabaseService", { enumerable: true, get: function () { return DatabaseService_1.DatabaseService; } });
const CacheService_1 = require("./services/CacheService");
Object.defineProperty(exports, "CacheService", { enumerable: true, get: function () { return CacheService_1.CacheService; } });
const AuthService_1 = require("./services/AuthService");
Object.defineProperty(exports, "AuthService", { enumerable: true, get: function () { return AuthService_1.AuthService; } });
const elasticsearch78_1 = tslib_1.__importDefault(require("./services/elasticsearch78"));
Object.defineProperty(exports, "Elasticsearch78", { enumerable: true, get: function () { return elasticsearch78_1.default; } });
const Request78_1 = tslib_1.__importDefault(require("./dll78/Request78"));
Object.defineProperty(exports, "Request78", { enumerable: true, get: function () { return Request78_1.default; } });
const QueryBuilder_1 = require("./utils/QueryBuilder");
Object.defineProperty(exports, "QueryBuilder", { enumerable: true, get: function () { return QueryBuilder_1.QueryBuilder; } });
const decorators_1 = require("./interfaces/decorators");
Object.defineProperty(exports, "ApiMethod", { enumerable: true, get: function () { return decorators_1.ApiMethod; } });
const ContainerManager_1 = require("./ContainerManager");
Object.defineProperty(exports, "ContainerManager", { enumerable: true, get: function () { return ContainerManager_1.ContainerManager; } });
const ControllerLoader_1 = require("./utils/ControllerLoader");
Object.defineProperty(exports, "ControllerLoader", { enumerable: true, get: function () { return ControllerLoader_1.ControllerLoader; } });
const server_1 = require("./server");
Object.defineProperty(exports, "Server", { enumerable: true, get: function () { return server_1.Server; } });
// 创建默认导出对象
const koa78Base78 = {
    Base78: Base78_1.default,
    CidBase78: Base78_1.CidBase78,
    UidBase78: Base78_1.UidBase78,
    Config: Config_1.Config,
    tableConfigs: tableConfig_1.tableConfigs,
    DatabaseConnections: DatabaseConnections_1.DatabaseConnections,
    DatabaseService: DatabaseService_1.DatabaseService,
    CacheService: CacheService_1.CacheService,
    AuthService: AuthService_1.AuthService,
    Elasticsearch78: elasticsearch78_1.default,
    Request78: Request78_1.default,
    QueryBuilder: QueryBuilder_1.QueryBuilder,
    ApiMethod: decorators_1.ApiMethod,
    ContainerManager: ContainerManager_1.ContainerManager,
    ControllerLoader: ControllerLoader_1.ControllerLoader,
    Server: server_1.Server
};
// 默认导出整个对象
exports.default = koa78Base78;
//# sourceMappingURL=index.js.map