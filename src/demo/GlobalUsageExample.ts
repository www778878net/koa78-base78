/**
 * Global 对象使用示例
 * 演示如何在 global 对象上存储和访问数据
 */

// 演示 1: 基本的 global 对象使用
function demonstrateBasicGlobalUsage() {
    console.log('=== 演示 1: 基本的 global 对象使用 ===');
    
    // 在 global 上存储数据
    (global as any).myAppName = 'koa78-base78';
    (global as any).appVersion = '1.0.0';
    (global as any).startTime = new Date();
    
    // 在同一文件或其他文件中访问这些数据
    console.log('应用名称:', (global as any).myAppName);
    console.log('应用版本:', (global as any).appVersion);
    console.log('启动时间:', (global as any).startTime);
    
    console.log();
}

// 演示 2: 存储复杂对象
function demonstrateComplexObjectStorage() {
    console.log('=== 演示 2: 存储复杂对象 ===');
    
    // 存储配置对象
    (global as any).appConfig = {
        database: {
            host: 'localhost',
            port: 3306,
            name: 'myapp'
        },
        cache: {
            host: 'localhost',
            port: 6379
        },
        features: {
            logging: true,
            metrics: true
        }
    };
    
    // 存储函数
    (global as any).utils = {
        formatDate: (date: Date) => date.toISOString(),
        generateId: () => Math.random().toString(36).substr(2, 9)
    };
    
    // 访问存储的数据
    console.log('数据库配置:', (global as any).appConfig.database);
    console.log('格式化的时间:', (global as any).utils.formatDate(new Date()));
    console.log('生成的ID:', (global as any).utils.generateId());
    
    console.log();
}

// 演示 3: 存储类实例
class DatabaseConnection {
    private connectionString: string;
    
    constructor(connectionString: string) {
        this.connectionString = connectionString;
    }
    
    connect() {
        console.log(`连接到数据库: ${this.connectionString}`);
        return '数据库连接成功';
    }
    
    query(sql: string) {
        console.log(`执行查询: ${sql}`);
        return [{ id: 1, name: '测试数据' }];
    }
}

class CacheManager {
    private store: Map<string, any> = new Map();
    
    set(key: string, value: any) {
        this.store.set(key, value);
        console.log(`缓存设置: ${key} = ${JSON.stringify(value)}`);
    }
    
    get(key: string) {
        const value = this.store.get(key);
        console.log(`缓存获取: ${key} = ${JSON.stringify(value)}`);
        return value;
    }
}

function demonstrateClassInstanceStorage() {
    console.log('=== 演示 3: 存储类实例 ===');
    
    // 创建并存储实例
    const dbConnection = new DatabaseConnection('mysql://localhost:3306/mydb');
    const cacheManager = new CacheManager();
    
    (global as any).dbConnection = dbConnection;
    (global as any).cacheManager = cacheManager;
    
    // 在其他地方使用这些实例
    const result = (global as any).dbConnection.connect();
    console.log(result);
    
    (global as any).dbConnection.query('SELECT * FROM users');
    
    (global as any).cacheManager.set('user:1', { id: 1, name: '张三' });
    const user = (global as any).cacheManager.get('user:1');
    console.log('获取用户:', user);
    
    console.log();
}

// 演示 4: 在不同文件间共享数据
function demonstrateCrossFileSharing() {
    console.log('=== 演示 4: 跨文件数据共享 ===');
    
    // 在一个"文件"中设置数据
    (global as any).sharedData = {
        apiEndpoints: [
            '/api/users',
            '/api/orders',
            '/api/products'
        ],
        middleware: [
            'auth',
            'logging',
            'rate-limiting'
        ]
    };
    
    // 模拟在"另一个文件"中访问数据
    console.log('API 端点:');
    (global as any).sharedData.apiEndpoints.forEach((endpoint: string) => {
        console.log(`  ${endpoint}`);
    });
    
    console.log('中间件:');
    (global as any).sharedData.middleware.forEach((mw: string) => {
        console.log(`  ${mw}`);
    });
    
    console.log();
}

// 演示 5: 与 ContainerManager 集成
import { Container } from 'inversify';

async function demonstrateContainerManagerIntegration() {
    console.log('=== 演示 5: 与 ContainerManager 集成 ===');
    
    // 注意：这里我们不实际初始化 ContainerManager，只是演示概念
    // 在实际使用中，ContainerManager.initialize() 会创建并返回容器
    
    // 模拟容器
    const mockContainer = {
        get: (serviceName: string) => {
            console.log(`从容器获取服务: ${serviceName}`);
            return `${serviceName} 实例`;
        }
    };
    
    // 将模拟容器挂载到 global
    (global as any).appContainer = mockContainer;
    
    // 模拟在其他文件中使用容器
    const container = (global as any).appContainer;
    const databaseService = container.get('DatabaseService');
    const cacheService = container.get('CacheService');
    
    console.log('获取到的服务:');
    console.log('  DatabaseService:', databaseService);
    console.log('  CacheService:', cacheService);
    
    console.log();
}

// 演示 6: 全局状态管理
function demonstrateGlobalStateManagement() {
    console.log('=== 演示 6: 全局状态管理 ===');
    
    // 初始化全局应用状态
    (global as any).appState = {
        usersOnline: 0,
        totalRequests: 0,
        uptime: process.uptime()
    };
    
    // 更新状态的函数
    (global as any).updateAppState = (updates: any) => {
        Object.assign((global as any).appState, updates);
        console.log('应用状态已更新:', (global as any).appState);
    };
    
    // 在不同地方更新状态
    (global as any).updateAppState({ usersOnline: 5 });
    (global as any).updateAppState({ totalRequests: 100 });
    
    console.log('最终应用状态:', (global as any).appState);
    
    console.log();
}

// 演示 7: 全局事件处理
function demonstrateGlobalEventHandling() {
    console.log('=== 演示 7: 全局事件处理 ===');
    
    // 存储全局事件处理器
    (global as any).eventHandlers = new Map();
    
    // 注册事件处理器
    (global as any).eventHandlers.set('user-login', (username: string) => {
        console.log(`用户 ${username} 已登录`);
    });
    
    (global as any).eventHandlers.set('user-logout', (username: string) => {
        console.log(`用户 ${username} 已登出`);
    });
    
    // 触发事件的函数
    (global as any).triggerEvent = (eventName: string, ...args: any[]) => {
        const handler = (global as any).eventHandlers.get(eventName);
        if (handler) {
            handler(...args);
        } else {
            console.log(`未找到事件处理器: ${eventName}`);
        }
    };
    
    // 模拟触发事件
    (global as any).triggerEvent('user-login', '张三');
    (global as any).triggerEvent('user-logout', '李四');
    (global as any).triggerEvent('unknown-event');
    
    console.log();
}

// 主演示函数
async function main() {
    console.log('Global 对象使用演示\n');
    
    demonstrateBasicGlobalUsage();
    demonstrateComplexObjectStorage();
    demonstrateClassInstanceStorage();
    demonstrateCrossFileSharing();
    await demonstrateContainerManagerIntegration();
    demonstrateGlobalStateManagement();
    demonstrateGlobalEventHandling();
    
    console.log('所有演示完成');
}

// 如果直接运行此文件
if (require.main === module) {
    main();
}

export {
    DatabaseConnection,
    CacheManager,
    main
};