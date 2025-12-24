export declare class ControllerLoader {
    private controllers;
    private loaded;
    constructor();
    loadControllers(): void;
    /**
     * 检测运行环境并返回用户项目控制器目录路径
     * 在开发环境中返回src目录，在生产环境中返回dist目录
     */
    private getUserProjectDir;
    private loadControllersFromDirectory;
    getController(path: string): any;
    /**
     * 获取已加载的控制器数量，用于调试和测试
     */
    getControllerCount(): number;
    /**
     * 获取所有已加载的控制器键名列表，用于调试
     */
    getControllerKeys(): string[];
}
