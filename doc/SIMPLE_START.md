# 极简使用方式

为了满足用户快速使用的需求，我们提供了一个简单的容器管理器类。

## 使用方法

用户可以通过以下方式使用 ContainerManager 类来初始化所有服务：

### 方式一：通过构造函数传入配置文件路径

```typescript
import { ContainerManager } from 'koa78-base78/ContainerManager';

// 创建容器管理器实例，传入配置文件路径
const containerManager = new ContainerManager('./config.json');

// 初始化所有服务
const container = await containerManager.initialize();

// 获取服务实例
const databaseService = container.get('DatabaseService');
const cacheService = container.get('CacheService');
```

### 方式二：通过命令行参数传递配置文件路径

当您通过命令行运行代码时，可以将配置文件路径作为参数传递：

```bash
node your-app.js config configtest.json
```

在这种情况下，您不需要在代码中显式指定配置文件路径：

```typescript
import { ContainerManager } from 'koa78-base78/ContainerManager';

// 创建容器管理器实例，不传入配置文件路径
const containerManager = new ContainerManager();

// 初始化所有服务（会自动从命令行参数解析配置文件路径）
const container = await containerManager.initialize();

// 获取服务实例
const databaseService = container.get('DatabaseService');
const cacheService = container.get('CacheService');
```

## 在其他文件中使用已初始化的服务

初始化完成后，您可以在应用程序的其他文件中访问已初始化的服务。有以下几种方式：

### 方式一：通过全局变量访问

容器初始化后会自动挂载到 `global.appContainer`，您可以在任何文件中直接访问：

```typescript
// 在另一个文件中
function useDatabaseService() {
    // 检查全局容器是否存在
    if (!(global as any).appContainer) {
        throw new Error('容器尚未初始化，请先运行 ContainerManager.initialize()');
    }

    // 从全局容器获取服务
    const container = (global as any).appContainer;
    const databaseService = container.get('DatabaseService');
    const cacheService = container.get('CacheService');
    
    // 使用服务
    // databaseService.query('SELECT * FROM users');
}
```

### 方式二：通过重新创建 ContainerManager 实例访问

```typescript
// 在另一个文件中
import { ContainerManager } from 'koa78-base78';

// 创建 ContainerManager 的新实例（不会重复初始化）
const containerManager = new ContainerManager();

function useServices() {
    const container = containerManager.getContainer();
    
    if (!container) {
        throw new Error('容器尚未初始化，请先运行 ContainerManager.initialize()');
    }

    const databaseService = container.get('DatabaseService');
    const cacheService = container.get('CacheService');
    
    // 使用服务
}
```

### 方式三：创建服务访问工具函数

```typescript
// 创建一个专门的服务访问模块 (services/ServiceAccessor.ts)
import { ContainerManager } from 'koa78-base78/ContainerManager';

let cachedContainer: any = null;

async function getContainer(): Promise<any> {
    if (cachedContainer) {
        return cachedContainer;
    }

    const manager = new ContainerManager();
    cachedContainer = manager.getContainer() || await manager.initialize();
    return cachedContainer;
}

export class ServiceAccessor {
    static async getDatabaseService() {
        const container = await getContainer();
        return container.get('DatabaseService');
    }

    static async getCacheService() {
        const container = await getContainer();
        return container.get('CacheService');
    }
    
    static getLogger() {
        return ContainerManager.getLogger();
    }
}

// 在业务文件中使用
import { ServiceAccessor } from './services/ServiceAccessor';

async function businessLogic() {
    // 获取日志服务
    const logger = ServiceAccessor.getLogger();
    if (logger) {
        logger.info('开始执行业务逻辑');
    }
    
    const databaseService = await ServiceAccessor.getDatabaseService();
    const cacheService = await ServiceAccessor.getCacheService();
    
    // 使用服务进行业务逻辑处理
}
```

## 完整示例

```typescript
import { ContainerManager } from 'koa78-base78/ContainerManager';

async function main() {
    try {
        // 创建容器管理器实例，传入配置文件路径
        const containerManager = new ContainerManager('./configtest.json');
        
        // 初始化所有服务
        const container = await containerManager.initialize();
        
        // 获取日志实例
        const logger = ContainerManager.getLogger();
        if (logger) {
            logger.info('应用启动成功');
        }
        
        // 获取服务实例
        const databaseService = container.get('DatabaseService');
        const cacheService = container.get('CacheService');
        
        console.log('服务初始化完成，可以开始使用');
        
        // 在这里可以继续编写业务逻辑
        // databaseService.xxx();
        // cacheService.xxx();
        
    } catch (error) {
        console.error('初始化失败:', error);
        process.exit(1);
    }
}

main();
```

## 实现效果

使用 ContainerManager 类会自动：
1. 解析传入的配置文件路径（通过构造函数参数或命令行参数）
2. 加载配置文件
3. 初始化所有服务（数据库连接、缓存、日志等）
4. 返回配置好的容器实例

用户可以通过容器实例获取任何需要的服务，这种方式简单明了，符合类库的使用习惯。