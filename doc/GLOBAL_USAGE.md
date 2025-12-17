# Global 对象使用指南

## 什么是 Global 对象

在 Node.js 环境中，`global` 是一个全局对象，类似于浏览器环境中的 `window` 对象。它在所有模块中都是可访问的，并且在整个应用程序的生命周期内都存在。

## Global 对象的工作原理

1. **全局可访问性**：在 Node.js 应用程序中，`global` 对象在所有模块中都是可访问的，这意味着您可以在任何文件中读取或写入 `global` 对象上的属性。

2. **跨模块共享**：由于 `global` 是全局的，它可以用来在不同模块之间共享数据，而无需显式导入或导出。

3. **持久性**：在应用程序的整个生命周期内，`global` 对象上的属性会一直存在，直到被显式删除或应用程序终止。

## 在 koa78-base78 中的使用

在我们的框架中，`ContainerManager` 类在初始化完成后会自动将容器实例挂载到 `global.appContainer` 上：

```typescript
// 在 ContainerManager.initialize() 方法中
(global as any).appContainer = this.container;
```

这样，您就可以在应用程序的任何地方通过以下方式访问容器和服务：

```typescript
// 在任何文件中访问容器
const container = (global as any).appContainer;
const databaseService = container.get('DatabaseService');
const cacheService = container.get('CacheService');
```

## 您可以挂载什么到 Global 中

您可以在 `global` 对象上挂载任何 JavaScript 值，包括但不限于：

### 1. 配置对象
```typescript
(global as any).appConfig = {
  database: {
    host: 'localhost',
    port: 3306
  },
  features: {
    logging: true,
    metrics: true
  }
};
```

### 2. 工具函数
```typescript
(global as any).utils = {
  formatDate: (date: Date) => date.toISOString(),
  generateId: () => Math.random().toString(36).substr(2, 9)
};
```

### 3. 类实例
```typescript
class DatabaseConnection {
  // ... 实现
}

(global as any).dbConnection = new DatabaseConnection();
```

### 4. 应用状态
```typescript
(global as any).appState = {
  usersOnline: 0,
  totalRequests: 0,
  startTime: new Date()
};
```

## 使用注意事项

### 1. 类型安全
由于 TypeScript 默认不包含您自定义的全局属性，您需要使用类型断言：
```typescript
(global as any).myProperty = value;
```

### 2. 命名冲突
为了避免与其他库或 Node.js 内置属性冲突，请使用唯一的命名空间：
```typescript
// 推荐
(global as any).myApp = {
  config: {...},
  services: {...}
};

// 不推荐
(global as any).config = {...}; // 可能与其他库冲突
```

### 3. 过度使用
虽然 `global` 对象很方便，但过度使用会导致代码难以维护和测试。建议仅用于以下场景：
- 全局单例对象（如容器、数据库连接）
- 应用程序级别的配置
- 跨模块共享的关键数据

## 最佳实践

### 1. 使用命名空间
```typescript
// 创建一个应用级别的命名空间
(global as any).myApp = {
  container: null,
  config: {},
  services: {}
};

// 在初始化时设置
(global as any).myApp.container = initializedContainer;
```

### 2. 提供访问函数
```typescript
// 提供专门的访问函数而不是直接访问 global
function getAppContainer() {
  return (global as any).appContainer;
}

function getDatabaseService() {
  const container = getAppContainer();
  return container ? container.get('DatabaseService') : null;
}
```

### 3. 文档化全局属性
在您的项目文档中明确说明使用了哪些全局属性及其用途。

## 示例

查看 [src/demo/GlobalUsageExample.ts](file:///d:/50.code/30.git78/50.koa78/koa78-base78/src/demo/GlobalUsageExample.ts) 文件了解更多使用示例。