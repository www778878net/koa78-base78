import { AuthService } from '../services/AuthService';
import Base78 from '../controllers/Base78';
import { MyLogger } from '../utils/mylogger';

// 延迟初始化logger缓存，避免模块加载时初始化导致502错误
let _logger: MyLogger | null = null;

export function ApiMethod() {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;
        descriptor.value = async function (this: Base78<any>, ...args: any[]) {
            try {
                // 从容器中获取AuthService实例
                const container = (global as any).appContainer;
                if (!container) {
                    throw new Error('App container not initialized');
                }

                const authService: AuthService = container ? container.get(AuthService) : AuthService.getInstance();

                // 执行 upcheck
                await authService.upcheck(this.up, this.tableConfig.cols, this.dbname);

                // 执行原始方法
                return await originalMethod.apply(this, args);
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
                this._setBack(-8888, errorMessage);

                // 记录详细的错误信息（tbname, dbname, method, apimicro, apiobj, apifun, error, sid）
                const errorInfo = {
                    tbname: this.tableConfig?.tbname || 'unknown',
                    dbname: this.dbname || 'default',
                    method: propertyKey,
                    apimicro: this.up?.apimicro,
                    apiobj: this.up?.apiobj,
                    apifun: this.up?.apifun,
                    error: errorMessage,
                    sid: this.up?.sid
                };

                // 延迟初始化logger，只在首次使用时才创建，避免模块加载时初始化导致502
                if (!_logger) {
                    try {
                        _logger = MyLogger.getInstance("base78", 3, "koa78");
                    } catch (err) {
                        // logger初始化失败，使用console.error作为后备
                        console.error(`[ApiMethod Error] ${JSON.stringify(errorInfo)}`);
                        throw new Error(`参数验证失败: ${errorMessage}`);
                    }
                }
                _logger.error(`[ApiMethod Error] ${JSON.stringify(errorInfo)}`, error as Error);

                throw new Error(`参数验证失败: ${errorMessage}`);
            }
        };
        return descriptor;
    };
}
