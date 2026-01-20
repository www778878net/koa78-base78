import { AuthService } from '../services/AuthService';
import Base78 from '../controllers/Base78';

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

                // 记录错误日志：包含表名、方法名和错误信息
                const errorInfo = {
                    tbname: this.tableConfig?.tbname || 'unknown',
                    dbname: this.dbname || 'default',
                    method: propertyKey,
                    apisys: this.up?.apisys,
                    apiobj: this.up?.apiobj,
                    apifun: this.up?.apifun,
                    error: errorMessage,
                    sid: this.up?.sid
                };
                console.error(`[ApiMethod Error] ${JSON.stringify(errorInfo)}`);

                // 重新抛出错误，让上层处理器捕获并返回适当的 HTTP 状态码
                // 错误消息会被 httpServer.ts 中的错误处理器捕获
                throw new Error(`参数验证失败: ${errorMessage}`);
            }
        };
        return descriptor;
    };
}