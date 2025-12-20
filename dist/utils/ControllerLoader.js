"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ControllerLoader = void 0;
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const path = tslib_1.__importStar(require("path"));
const fs = tslib_1.__importStar(require("fs"));
const Base78_1 = tslib_1.__importDefault(require("../controllers/Base78"));
const ContainerManager_1 = require("../ContainerManager");
const tslog78_1 = require("tslog78");
let ControllerLoader = class ControllerLoader {
    constructor() {
        this.controllers = new Map();
        this.loaded = false;
        // 不在构造函数中加载控制器，避免在模块加载时访问未初始化的日志服务
    }
    loadControllers() {
        // 确保只加载一次
        if (this.loaded) {
            return;
        }
        // 获取日志实例（此时容器应该已经初始化完成）
        const log = ContainerManager_1.ContainerManager.getLogger() || tslog78_1.TsLog78.Instance;
        log.detail('ControllerLoader constructed');
        log.detail('Starting to load controllers');
        // 检测运行环境并确定用户项目控制器目录
        const userProjectSrcDir = this.getUserProjectSrcDir();
        log.debug(`Looking for controllers in: ${userProjectSrcDir}`);
        if (fs.existsSync(userProjectSrcDir) && fs.statSync(userProjectSrcDir).isDirectory()) {
            fs.readdirSync(userProjectSrcDir).forEach((dir) => {
                if (dir.toLowerCase().startsWith('api') && fs.statSync(path.join(userProjectSrcDir, dir)).isDirectory()) {
                    this.loadControllersFromDirectory(path.join(userProjectSrcDir, dir));
                }
            });
        }
        else {
            log.warn(`User project src directory not found at ${userProjectSrcDir}`);
        }
        log.detail('Finished loading controllers');
        this.loaded = true;
    }
    /**
     * 检测运行环境并返回用户项目src目录路径
     * 用户的控制器始终在项目根目录下的src目录中
     */
    getUserProjectSrcDir() {
        // 获取用户项目根目录
        const userProjectRoot = process.cwd();
        // 用户的控制器始终在项目根目录下的src目录中
        // 无论是TypeScript运行时还是JavaScript运行时都是如此
        return path.resolve(userProjectRoot, 'src');
    }
    loadControllersFromDirectory(dir) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            var _a;
            // 获取日志实例
            const log = ContainerManager_1.ContainerManager.getLogger() || new tslog78_1.TsLog78();
            for (const item of fs.readdirSync(dir)) {
                const fullPath = path.join(dir, item);
                const stat = fs.statSync(fullPath);
                if (stat.isDirectory()) {
                    yield this.loadControllersFromDirectory(fullPath);
                }
                else if ((item.endsWith('.ts') || item.endsWith('.js')) && !item.endsWith('.d.ts')) {
                    try {
                        // 使用动态导入替代 require
                        const module = yield (_a = fullPath, Promise.resolve().then(() => tslib_1.__importStar(require(_a))));
                        const controllerClass = module.default;
                        if (controllerClass && controllerClass.prototype instanceof Base78_1.default) {
                            const apiDir = path.basename(path.dirname(path.dirname(fullPath))).toLowerCase();
                            const menuDir = path.basename(path.dirname(fullPath)).toLowerCase();
                            const controllerName = path.basename(fullPath, path.extname(fullPath)).toLowerCase();
                            const controllerKey = `${apiDir}/${menuDir}/${controllerName}`;
                            this.controllers.set(controllerKey, controllerClass);
                            log.debug(`Loaded controller: ${controllerKey}`);
                        }
                        else {
                            log.warn(`File ${fullPath} does not export a valid controller class`);
                        }
                    }
                    catch (error) {
                        log.error(`Error loading controller from ${fullPath}:`, error);
                    }
                }
            }
        });
    }
    getController(path) {
        // 获取日志实例
        const log = ContainerManager_1.ContainerManager.getLogger() || tslog78_1.TsLog78.Instance;
        // 确保控制器已加载
        if (!this.loaded) {
            this.loadControllers();
        }
        const [apiver, apisys, apiobj] = path.split('/');
        const controllerKey = `${apiver}/${apisys}/${apiobj}`.toLowerCase();
        log.detail(`Attempting to get controller with key: ${controllerKey}`);
        return this.controllers.get(controllerKey);
    }
    /**
     * 获取已加载的控制器数量，用于调试和测试
     */
    getControllerCount() {
        return this.controllers.size;
    }
    /**
     * 获取所有已加载的控制器键名列表，用于调试
     */
    getControllerKeys() {
        return Array.from(this.controllers.keys());
    }
};
ControllerLoader = tslib_1.__decorate([
    (0, inversify_1.injectable)(),
    tslib_1.__metadata("design:paramtypes", [])
], ControllerLoader);
exports.ControllerLoader = ControllerLoader;
//# sourceMappingURL=ControllerLoader.js.map