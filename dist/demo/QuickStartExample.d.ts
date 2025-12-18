/**
 * 快速开始示例
 *
 * 展示如何使用 initializeApp 函数一键启动 koa78-base78 应用
 */
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
declare function quickStart(): Promise<void>;
export default quickStart;
