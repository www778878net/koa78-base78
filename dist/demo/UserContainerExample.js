"use strict";
/**
 * 用户使用容器管理器示例
 *
 * 这个文件展示了用户如何使用 ContainerManager 类来初始化服务
 */
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const ContainerManager_1 = require("../ContainerManager");
function method2() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        console.log('方法2: 通过命令行参数传递配置文件路径');
        console.log('使用方式: node dist/demo/UserContainerExample.js config configtest.json');
        try {
            // 创建容器管理器实例，不传入配置文件路径（会自动从命令行参数解析）
            const containerManager = new ContainerManager_1.ContainerManager();
            // 初始化所有服务
            const container = yield containerManager.initialize();
            // 获取服务实例
            const databaseService = container.get('DatabaseService');
            const cacheService = container.get('CacheService');
            console.log('服务初始化完成，可以开始使用');
        }
        catch (error) {
            console.error('初始化失败:', error);
            process.exit(1);
        }
    });
}
function method1() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        console.log('方法1: 通过构造函数传入配置文件路径');
        try {
            // 创建容器管理器实例，传入配置文件路径
            const containerManager = new ContainerManager_1.ContainerManager('./configtest.json');
            // 初始化所有服务
            const container = yield containerManager.initialize();
            // 获取服务实例
            const databaseService = container.get('DatabaseService');
            const cacheService = container.get('CacheService');
            console.log('服务初始化完成，可以开始使用');
        }
        catch (error) {
            console.error('初始化失败:', error);
            process.exit(1);
        }
    });
}
function main() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const args = process.argv.slice(2);
        if (args.includes('method1')) {
            yield method1();
        }
        else if (args.includes('method2')) {
            yield method2();
        }
        else {
            console.log('使用方法:');
            console.log('node dist/demo/UserContainerExample.js method1');
            console.log('node dist/demo/UserContainerExample.js method2 config configtest.json');
        }
    });
}
// 如果直接运行此文件
if (require.main === module) {
    main();
}
//# sourceMappingURL=UserContainerExample.js.map