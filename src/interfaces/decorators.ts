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
                if (error instanceof Error) {
                    this._setBack(-8888, error.message);
                } else {
                    this._setBack(-8888, 'An unknown error occurred');
                }
                throw error;
            }
        };
        return descriptor;
    };
}