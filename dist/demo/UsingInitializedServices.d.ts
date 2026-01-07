/**
 * 演示如何在另一个文件中使用已初始化的容器和服务
 */
declare function useServicesViaGlobal(): void;
declare function useServicesViaModule(): void;
declare function getContainer(): Promise<any>;
declare function useServicesViaFunction(): Promise<void>;
declare class ServiceAccessor {
    static getDatabaseService(): Promise<any>;
    static getCacheService(): Promise<any>;
}
declare function useServicesViaAccessor(): Promise<void>;
export { useServicesViaGlobal, useServicesViaModule, useServicesViaFunction, useServicesViaAccessor, ServiceAccessor, getContainer };
