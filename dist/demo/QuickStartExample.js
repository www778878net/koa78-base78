"use strict";
/**
 * 快速开始示例
 *
 * 展示如何使用 initializeApp 函数一键启动 koa78-base78 应用
 */
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const index_1 = require("../index");
/**
 * 快速启动函数
 *
 * 使用方法:
 * ```bash
 * # 通过命令行参数指定配置文件
 * npx ts-node src/demo/QuickStartExample.ts config.json
 *
 * # 或者通过环境变量指定配置文件
 * TABLE_CONFIG_FILE=config.json npx ts-node src/demo/QuickStartExample.ts
 * ```
 */
function quickStart() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        try {
            // 一键初始化所有服务
            const container = yield (0, index_1.initializeApp)();
            console.log('✅ 应用初始化成功!');
            console.log('现在可以通过 global.appContainer 获取服务实例');
            // 示例: 获取数据库服务
            // const dbService = global.appContainer.get('DatabaseService');
            // 启动 HTTP 服务器的代码可以在这里添加
            // 例如: startHttpServer();
        }
        catch (error) {
            console.error('❌ 应用初始化失败:', error);
            process.exit(1);
        }
    });
}
// 如果直接运行此文件，则执行快速启动
if (require.main === module) {
    quickStart();
}
exports.default = quickStart;
//# sourceMappingURL=QuickStartExample.js.map