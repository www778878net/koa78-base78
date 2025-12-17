/**
 * 演示如何在另一个文件中使用已初始化的容器和服务
 */

// 方式一：通过全局变量访问容器
function useServicesViaGlobal() {
    // 检查全局容器是否存在
    if (!(global as any).appContainer) {
        throw new Error('容器尚未初始化，请先运行 ContainerManager.initialize()');
    }

    // 从全局容器获取服务
    const container = (global as any).appContainer;
    const databaseService = container.get('DatabaseService');
    const cacheService = container.get('CacheService');

    console.log('通过全局变量获取服务成功');
    
    // 使用服务进行操作
    // databaseService.query('SELECT * FROM users');
    // cacheService.get('key');
}

// 方式二：通过模块导入访问容器
import { ContainerManager } from '../ContainerManager';

// 创建 ContainerManager 的第二个实例（不会重复初始化，会复用已有的容器）
const containerManager = new ContainerManager();

function useServicesViaModule() {
    const container = containerManager.getContainer();
    
    if (!container) {
        throw new Error('容器尚未初始化，请先运行 ContainerManager.initialize()');
    }

    const databaseService = container.get('DatabaseService');
    const cacheService = container.get('CacheService');

    console.log('通过模块导入获取服务成功');
    
    // 使用服务进行操作
    // databaseService.query('SELECT * FROM users');
    // cacheService.get('key');
}

// 方式三：创建专门的服务获取函数
let cachedContainer: any = null;

async function getContainer(): Promise<any> {
    if (cachedContainer) {
        return cachedContainer;
    }

    // 如果需要确保容器已初始化
    const manager = new ContainerManager();
    cachedContainer = manager.getContainer() || await manager.initialize();
    return cachedContainer;
}

async function useServicesViaFunction() {
    try {
        const container = await getContainer();
        const databaseService = container.get('DatabaseService');
        const cacheService = container.get('CacheService');

        console.log('通过函数获取服务成功');
        
        // 使用服务进行操作
        // databaseService.query('SELECT * FROM users');
        // cacheService.get('key');
    } catch (error) {
        console.error('获取服务失败:', error);
    }
}

// 方式四：创建专门的服务访问器
class ServiceAccessor {
    static async getDatabaseService() {
        const container = await getContainer();
        return container.get('DatabaseService');
    }

    static async getCacheService() {
        const container = await getContainer();
        return container.get('CacheService');
    }
}

async function useServicesViaAccessor() {
    try {
        const databaseService = await ServiceAccessor.getDatabaseService();
        const cacheService = await ServiceAccessor.getCacheService();

        console.log('通过服务访问器获取服务成功');
        
        // 使用服务进行操作
        // databaseService.query('SELECT * FROM users');
        // cacheService.get('key');
    } catch (error) {
        console.error('获取服务失败:', error);
    }
}

// 主函数演示
async function main() {
    console.log('演示在另一个文件中使用已初始化的服务');
    
    try {
        // 注意：这些函数假设容器已经在其他地方初始化过了
        // 在实际使用中，您需要确保 ContainerManager.initialize() 已经被调用
        
        useServicesViaGlobal();
        useServicesViaModule();
        await useServicesViaFunction();
        await useServicesViaAccessor();
        
        console.log('所有演示完成');
    } catch (error) {
        console.error('演示过程中出现错误:', error);
    }
}

// 如果直接运行此文件
if (require.main === module) {
    main();
}

export {
    useServicesViaGlobal,
    useServicesViaModule,
    useServicesViaFunction,
    useServicesViaAccessor,
    ServiceAccessor,
    getContainer
};