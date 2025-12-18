/**
 * 应用初始化函数
 * 用户可以通过此函数一键初始化所有服务
 *
 * 使用方法:
 * ```typescript
 * import { initializeApp } from 'koa78-base78/dist/server';
 *
 * // 通过命令行参数或环境变量指定配置文件路径
 * initializeApp().then(() => {
 *   console.log('应用初始化完成');
 *   // 现在可以通过 global.appContainer 获取服务实例
 *   // const dbService = global.appContainer.get(DatabaseService);
 * }).catch(error => {
 *   console.error('应用初始化失败:', error);
 * });
 * ```
 *
 * @param configPath 配置文件路径（可选）
 * @returns Promise<Container>
 */
export declare function initializeApp(configPath?: string): Promise<Container>;
export default initializeApp;
