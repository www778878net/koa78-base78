import { StepHandler, HandlerRegistry } from './StepHandler';

// 处理器注册中心实现类
export class HandlerRegistryImpl implements HandlerRegistry {
    // 处理器映射表
    private handlers: Map<string, StepHandler> = new Map();

    /**
     * 注册处理器
     * @param type 处理器类型
     * @param handler 处理器实例
     */
    registerHandler(type: string, handler: StepHandler): void {
        if (!type || !handler) {
            throw new Error('Handler type and instance must be provided');
        }

        if (this.handlers.has(type)) {
            console.warn(`Handler type '${type}' is already registered, will be replaced`);
        }

        this.handlers.set(type, handler);
        console.info(`Handler '${type}' registered successfully`);
    }

    /**
     * 获取处理器
     * @param type 处理器类型
     * @returns 处理器实例或undefined
     */
    getHandler(type: string): StepHandler | undefined {
        if (!type) {
            return undefined;
        }

        return this.handlers.get(type);
    }

    /**
     * 检查处理器是否存在
     * @param type 处理器类型
     * @returns 是否存在
     */
    hasHandler(type: string): boolean {
        if (!type) {
            return false;
        }

        return this.handlers.has(type);
    }

    /**
     * 获取所有注册的处理器类型
     * @returns 处理器类型数组
     */
    getRegisteredTypes(): string[] {
        return Array.from(this.handlers.keys());
    }
}

// 创建全局处理器注册器实例
const globalHandlerRegistry = new HandlerRegistryImpl();

export default globalHandlerRegistry;