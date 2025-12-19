export declare class ControllerLoader {
    private controllers;
    private loaded;
    constructor();
    loadControllers(): void;
    /**
     * 检测运行环境并返回用户项目src目录路径
     * 用户的控制器始终在项目根目录下的src目录中
     */
    private getUserProjectSrcDir;
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
