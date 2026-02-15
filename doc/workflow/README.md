# BASE78 工作流方案设计文档

## 一、方案概述

当前BASE78功能越来越多，特别是MySQL、SQLite等数据库操作的管理变得困难。本方案旨在将整个项目改为工作流模式，从路由层开始改造，将API请求的处理过程定义为可配置的工作流。

## 二、目录结构

```
src/workflow/
├── README.md               # 工作流方案文档
├── workflow-engine.ts      # 工作流引擎核心实现
├── definitions/            # 工作流定义文件
│   ├── api/               # API相关工作流
│   │   └── v1/            # 版本1的API工作流
│   │       └── testtb/    # testtb对象的工作流
│   │           └── get.ts  # 查询操作的工作流定义
└── handlers/               # 工作流步骤处理器
    ├── param-validator.ts  # 参数验证处理器
    ├── db-query.ts         # 数据库查询处理器
    ├── db-update.ts        # 数据库更新处理器
    └── result-formatter.ts # 结果格式化处理器
```

## 三、核心概念

### 1. 工作流定义 (Workflow Definition)

使用TypeScript定义的工作流结构，包含以下核心元素：

- **name**: 工作流名称
- **steps**: 步骤序列，每个步骤包含：
  - **id**: 步骤唯一标识符
  - **type**: 步骤类型，对应处理器
  - **config**: 步骤配置参数
  - **next**: 条件执行时的下一个步骤ID
  - **condition**: 条件表达式
- **output**: 输出结果映射

### 2. 步骤处理器 (Step Handler)

实现具体业务逻辑的可复用组件，每个处理器负责特定类型的操作。

### 3. 工作流引擎 (Workflow Engine)

负责解析工作流定义并执行步骤序列的核心组件。

## 四、示例：验证+查询的工作流定义

### 1. 完整的用户信息查询工作流（包含SID验证）

以下是一个完整的工作流示例，演示如何从SID验证用户身份，转换为UPINFO，验证权限，然后查询数据库获取用户信息：

```typescript
// src/workflow/definitions/api/v1/user/get-by-sid.ts
import { WorkflowDefinition } from '../../../workflow-engine';

export const getUserBySidWorkflow: WorkflowDefinition = {
  name: 'user-get-by-sid',
  steps: [
    {
      id: 'validate-sid',
      type: 'param-validator',
      config: {
        required: ['sid'],
        types: { sid: 'string' },
        rules: { sid: { min: 32, max: 64 } } // SID通常是长字符串
      }
    },
    {
      id: 'convert-sid-to-upinfo',
      type: 'auth-convert-sid',
      config: {
        sidSource: 'request', // 从请求参数中获取sid
        cacheConnection: 'redis' // 使用Redis缓存加速查询
      }
    },
    {
      id: 'validate-user-permission',
      type: 'permission-validator',
      config: {
        resource: 'user:profile',
        action: 'read',
        requireOwnership: true // 要求只能读取自己的信息
      }
    },
    {
      id: 'query-user-info',
      type: 'db-query',
      config: {
        connection: 'default',
        driver: 'mysql',
        query: 'SELECT id, username, email, nickname, avatar FROM users WHERE id = ? AND status = 1',
        params: ['convert-sid-to-upinfo.user.id'] // 从UPINFO中获取用户ID
      }
    },
    {
      id: 'format-result',
      type: 'result-formatter',
      config: {
        exclude: ['password_hash', 'last_login', 'created_at', 'updated_at']
      }
    }
  ],
  output: {
    user: 'format-result.result[0]',
    permissions: 'validate-user-permission.permissions',
    requestId: 'convert-sid-to-upinfo.requestId'
  }
};
```

### 2. SID转换为UPINFO的步骤处理器示例

```typescript
// src/workflow/handlers/auth-convert-sid.ts
import { StepHandler } from './step-handler-interface';
import { WorkflowStep } from '../workflow-engine';
import { AuthService } from '../../services/AuthService';
import { CacheService } from '../../services/CacheService';

export class AuthConvertSidHandler implements StepHandler {
  private authService: AuthService;
  private cacheService: CacheService;
  
  constructor() {
    this.authService = AuthService.instance;
    this.cacheService = CacheService.instance;
  }
  
  async execute(step: WorkflowStep, context: any): Promise<any> {
    const { sidSource, cacheConnection } = step.config;
    const { request, ctx } = context;
    
    // 获取SID
    let sid;
    if (sidSource === 'request') {
      sid = request.sid || request.token;
    } else if (sidSource === 'cookie') {
      sid = ctx.cookies.get('sid');
    } else if (sidSource === 'header') {
      sid = ctx.headers['x-sid'] || ctx.headers['authorization']?.replace('Bearer ', '');
    }
    
    if (!sid) {
      throw new Error('SID not found in request');
    }
    
    // 尝试从缓存获取UPINFO
    let upInfo;
    const cacheKey = `upinfo:${sid}`;
    const cachedUpInfo = await this.cacheService.get(cacheKey, cacheConnection);
    
    if (cachedUpInfo) {
      upInfo = JSON.parse(cachedUpInfo);
    } else {
      // 缓存未命中，从数据库获取
      upInfo = await this.authService.getUpInfoBySid(sid, ctx);
      
      if (!upInfo) {
        throw new Error('Invalid or expired SID');
      }
      
      // 缓存UPINFO
      await this.cacheService.set(cacheKey, JSON.stringify(upInfo), 3600, cacheConnection); // 缓存1小时
    }
    
    // 生成请求ID
    const requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // 将UPINFO存储到上下文中，供后续步骤使用
    context.upInfo = upInfo;
    
    return {
      user: upInfo.user,
      permissions: upInfo.permissions,
      requestId,
      sid
    };
  }
}
```

### 3. 权限验证步骤处理器示例

```typescript
// src/workflow/handlers/permission-validator.ts
import { StepHandler } from './step-handler-interface';
import { WorkflowStep } from '../workflow-engine';

export class PermissionValidatorHandler implements StepHandler {
  async execute(step: WorkflowStep, context: any): Promise<any> {
    const { resource, action, requireOwnership } = step.config;
    const { upInfo, request } = context;
    
    // 获取用户权限
    const userPermissions = upInfo.permissions;
    
    // 检查是否有权限
    const hasPermission = userPermissions.some(perm => 
      perm.resource === resource && 
      (perm.action === action || perm.action === 'all')
    );
    
    if (!hasPermission) {
      throw new Error(`Insufficient permissions for ${action}:${resource}`);
    }
    
    // 如果需要验证所有权
    if (requireOwnership) {
      // 获取请求的资源ID
      const resourceId = request.id || request.userId;
      
      // 验证是否为用户自己的资源
      if (resourceId && upInfo.user.id !== resourceId) {
        throw new Error('Permission denied: Cannot access other user\'s resources');
      }
    }
    
    return {
      hasPermission: true,
      permissions: userPermissions,
      resource,
      action
    };
  }
}
```

### 4. 工作流引擎更新（添加新处理器注册）

```typescript
// src/workflow/workflow-engine.ts 中的 registerDefaultHandlers 方法更新
private registerDefaultHandlers(): void {
  // 延迟导入以避免循环依赖
  import('./handlers/param-validator').then(module => {
    this.registerHandler('param-validator', new module.ParamValidatorHandler());
  });
  
  import('./handlers/auth-convert-sid').then(module => {
    this.registerHandler('auth-convert-sid', new module.AuthConvertSidHandler());
  });
  
  import('./handlers/permission-validator').then(module => {
    this.registerHandler('permission-validator', new module.PermissionValidatorHandler());
  });
  
  import('./handlers/db-query').then(module => {
    this.registerHandler('db-query', new module.DatabaseQueryHandler());
  });
  
  import('./handlers/result-formatter').then(module => {
    this.registerHandler('result-formatter', new module.ResultFormatterHandler());
  });
}
```

### 5. 路由配置示例

```typescript
// src/routers/httpServer.ts 中添加

// SID验证的用户信息查询路由
router.get('/api/v1/user/me', async (ctx: Context) => {
  try {
    // 动态加载工作流定义
    const workflowModule = await import('../workflow/definitions/api/v1/user/get-by-sid');
    const workflow = workflowModule.getUserBySidWorkflow;
    
    // 执行工作流
    const workflowEngine = new WorkflowEngine();
    const result = await workflowEngine.execute(workflow, ctx);
    
    // 返回结果
    ctx.body = {
      res: 0,
      errmsg: '',
      kind: 'json',
      back: result.user,
      permissions: result.permissions,
      requestId: result.requestId
    };
  } catch (e) {
    // 错误处理
    ctx.status = 401;
    ctx.body = {
      res: 1,
      errmsg: e.message || 'Authentication failed',
      kind: 'json'
    };
  }
});
```

## 五、工作流引擎设计

### 2. 步骤处理器实现示例

```typescript
// src/workflow/handlers/param-validator.ts
import { StepHandler } from '../workflow-engine';

export class ParamValidatorHandler implements StepHandler {
  async execute(step: any, context: any): Promise<any> {
    const { request, params } = context;
    const { required, types, rules } = step.config;
    
    // 合并请求体和URL参数
    const allParams = { ...request, ...params };
    
    // 验证必填字段
    if (required) {
      for (const field of required) {
        if (allParams[field] === undefined || allParams[field] === null) {
          throw new Error(`Missing required parameter: ${field}`);
        }
      }
    }
    
    // 验证数据类型
    if (types) {
      for (const [field, type] of Object.entries(types)) {
        if (allParams[field] !== undefined && typeof allParams[field] !== type) {
          throw new Error(`Parameter ${field} must be ${type}`);
        }
      }
    }
    
    // 验证自定义规则
    if (rules) {
      for (const [field, fieldRules] of Object.entries(rules)) {
        if (allParams[field] !== undefined) {
          if (fieldRules.min !== undefined && allParams[field] < fieldRules.min) {
            throw new Error(`Parameter ${field} must be at least ${fieldRules.min}`);
          }
          if (fieldRules.max !== undefined && allParams[field] > fieldRules.max) {
            throw new Error(`Parameter ${field} must be at most ${fieldRules.max}`);
          }
          // 可添加更多规则验证
        }
      }
    }
    
    return { valid: true, params: allParams };
  }
}
```

```typescript
// src/workflow/handlers/db-query.ts
import { StepHandler } from '../workflow-engine';
import { DatabaseService } from '../../services/DatabaseService';

export class DatabaseQueryHandler implements StepHandler {
  private dbService: DatabaseService;
  
  constructor() {
    this.dbService = DatabaseService.instance;
  }
  
  async execute(step: any, context: any): Promise<any> {
    const { request, params, validate-params } = context;
    const { connection, driver, query, params: queryParams } = step.config;
    
    // 解析参数值
    const resolvedParams = queryParams.map((paramKey: string) => {
      // 支持从验证结果或直接从请求参数中获取值
      return validate-params.params[paramKey] || request[paramKey] || params[paramKey];
    });
    
    let result;
    if (driver === 'sqlite') {
      result = await this.dbService.sqliteGet(query, resolvedParams, context.ctx.up, connection);
    } else {
      result = await this.dbService.get(query, resolvedParams, context.ctx.up, connection);
    }
    
    return { result };
  }
}
```

## 五、工作流引擎设计

```typescript
// src/workflow/workflow-engine.ts
import { Context } from 'koa';
import { ParamValidatorHandler } from './handlers/param-validator';
import { DatabaseQueryHandler } from './handlers/db-query';

// 工作流定义接口
export interface WorkflowDefinition {
  name: string;
  steps: WorkflowStep[];
  output?: Record<string, string>;
}

// 工作流步骤接口
export interface WorkflowStep {
  id: string;
  type: string;
  config: any;
  next?: string;
  condition?: string;
}

// 步骤处理器接口
export interface StepHandler {
  execute(step: WorkflowStep, context: any): Promise<any>;
}

// 工作流引擎类
export class WorkflowEngine {
  private stepHandlers: Record<string, StepHandler> = {};
  
  constructor() {
    this.registerDefaultHandlers();
  }
  
  // 注册默认处理器
  private registerDefaultHandlers(): void {
    this.registerHandler('param-validator', new ParamValidatorHandler());
    this.registerHandler('db-query', new DatabaseQueryHandler());
    // 可添加更多默认处理器
  }
  
  // 注册自定义处理器
  public registerHandler(type: string, handler: StepHandler): void {
    this.stepHandlers[type] = handler;
  }
  
  // 执行工作流
  public async execute(workflow: WorkflowDefinition, ctx: Context): Promise<any> {
    const context = {
      request: ctx.request.body || {},
      params: ctx.params,
      ctx: ctx,
      result: {}
    };
    
    // 执行每个步骤
    for (const step of workflow.steps) {
      const handler = this.stepHandlers[step.type];
      if (!handler) {
        throw new Error(`No handler found for step type: ${step.type}`);
      }
      
      // 执行步骤
      const stepResult = await handler.execute(step, context);
      context.result[step.id] = stepResult;
      
      // 处理条件分支
      if (step.condition && step.next) {
        if (this.evaluateCondition(step.condition, context)) {
          // 跳转到指定步骤
          const nextStepIndex = workflow.steps.findIndex(s => s.id === step.next);
          if (nextStepIndex !== -1) {
            workflow.steps = workflow.steps.slice(nextStepIndex);
          }
        }
      }
    }
    
    // 构建输出结果
    if (workflow.output) {
      return this.buildOutput(workflow.output, context.result);
    }
    
    return context.result;
  }
  
  // 评估条件表达式
  private evaluateCondition(condition: string, context: any): boolean {
    // 简单实现，实际项目中可使用更复杂的表达式解析器
    try {
      // 使用Function构造函数安全地评估条件
      const func = new Function('context', `return ${condition};`);
      return func(context);
    } catch (error) {
      throw new Error(`Invalid condition expression: ${condition}`);
    }
  }
  
  // 构建输出结果
  private buildOutput(outputMap: Record<string, string>, result: any): any {
    const output: any = {};
    
    for (const [key, path] of Object.entries(outputMap)) {
      output[key] = this.resolvePath(path, result);
    }
    
    return output;
  }
  
  // 解析路径
  private resolvePath(path: string, result: any): any {
    const parts = path.split('.');
    let value = result;
    
    for (const part of parts) {
      if (value === undefined || value === null) return undefined;
      
      if (part.includes('[')) {
        // 处理数组索引，如 result[0]
        const [arrayKey, index] = part.replace(']', '').split('[');
        value = value[arrayKey][parseInt(index)];
      } else {
        value = value[part];
      }
    }
    
    return value;
  }
}
```

## 六、与现有系统的集成

### 1. 路由层集成

在现有的路由处理中添加工作流支持：

```typescript
// src/routers/httpServer.ts 中添加

// 工作流路由处理器
router.all('/wf/:apimicro/:apiobj/:apifun', async (ctx: Context) => {
  try {
    const { apimicro, apiobj, apifun } = ctx.params;
    const workflowKey = `${apimicro}/${apiobj}/${apifun}`;
    
    // 动态加载工作流定义
    const workflowModule = await import(`../workflow/definitions/api/v1/${apimicro}/${apiobj}/${apifun}`);
    const workflow = workflowModule.default;
    
    if (!workflow) {
      ctx.status = 404;
      ctx.body = { error: 'Workflow not found' };
      return;
    }
    
    // 执行工作流
    const workflowEngine = new WorkflowEngine();
    const result = await workflowEngine.execute(workflow, ctx);
    
    // 返回结果
    ctx.body = {
      res: 0,
      errmsg: '',
      kind: 'json',
      back: result
    };
  } catch (e) {
    // 错误处理
    // ...
  }
});
```

### 2. 与UpInfo的集成

工作流引擎将接收Koa的Context对象，从中可以获取UpInfo实例：

```typescript
// 在步骤处理器中使用UpInfo
const upInfo = context.ctx.up;
// 使用upInfo进行权限验证、获取用户信息等
```

## 七、迁移计划

1. **第一阶段**：实现工作流引擎核心和基础处理器
2. **第二阶段**：为现有API创建工作流定义（从简单的CRUD操作开始）
3. **第三阶段**：在路由层添加工作流支持，保持与现有系统的兼容性
4. **第四阶段**：逐步将现有控制器方法迁移到工作流模式
5. **第五阶段**：优化工作流引擎，添加监控和调试功能

## 八、优势

1. **模块化管理**：将复杂的业务流程拆分为可复用的步骤
2. **可视化配置**：工作流定义采用声明式配置，易于理解和修改
3. **灵活扩展**：新功能可以通过添加新的步骤处理器来实现
4. **统一管理**：MySQL和SQLite等数据库操作可以通过统一的工作流步骤来处理
5. **提高可测试性**：每个步骤都可以独立测试

## 九、后续计划

- 实现更多内置步骤处理器
- 添加工作流可视化设计工具
- 实现工作流版本管理
- 添加工作流执行监控和日志
- 支持工作流的异步执行

---

通过本方案的实施，可以有效地解决BASE78功能日益增多导致的管理困难问题，提高系统的可维护性和扩展性。