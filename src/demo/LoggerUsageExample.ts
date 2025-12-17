/**
 * 日志服务使用示例
 * 
 * 展示如何在初始化容器后使用日志服务
 */

import { ContainerManager } from '../ContainerManager';
import { TsLog78 } from 'tslog78';

async function main() {
    try {
        // 创建容器管理器实例
        const containerManager = new ContainerManager('./configtest.json');
        
        // 初始化所有服务，包括日志服务
        const container = await containerManager.initialize();
        
        // 获取日志实例
        const logger: TsLog78 | null = ContainerManager.getLogger();
        
        if (logger) {
            logger.info('应用启动成功');
            logger.debug('这是调试信息');
            logger.warn('这是警告信息');
        } else {
            console.log('日志服务未正确初始化，使用控制台输出');
            console.log('应用启动成功');
        }
        
        // 获取其他服务实例
        const databaseService = container.get('DatabaseService');
        const cacheService = container.get('CacheService');
        
        console.log('服务初始化完成，可以开始使用');
        
    } catch (error) {
        console.error('初始化失败:', error);
        process.exit(1);
    }
}

// 如果直接运行此文件
if (require.main === module) {
    main();
}

export { };