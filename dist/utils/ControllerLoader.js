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
        // 获取日志实例（此时容器应该已经初始化完成）
        const log = ContainerManager_1.ContainerManager.getLogger() || tslog78_1.TsLog78.Instance;
        log.detail('ControllerLoader loadControllers');
        // 确保只加载一次
        if (this.loaded) {
            return;
        }
        log.detail('Starting to load controllers');
        // 检测运行环境并确定用户项目控制器目录
        const userProjectDir = this.getUserProjectDir();
        log.debug(`Looking for controllers in: ${userProjectDir}`);
        if (fs.existsSync(userProjectDir) && fs.statSync(userProjectDir).isDirectory()) {
            fs.readdirSync(userProjectDir).forEach((dir) => {
                if (dir.toLowerCase().startsWith('api') && fs.statSync(path.join(userProjectDir, dir)).isDirectory()) {
                    this.loadControllersFromDirectory(path.join(userProjectDir, dir));
                }
            });
        }
        else {
            log.warn(`User project directory not found at ${userProjectDir}`);
        }
        log.info(`Total controllers loaded: ${this.controllers.size}`);
        log.detail('Finished loading controllers');
        this.loaded = true;
    }
    /**
     * 检测运行环境并返回用户项目控制器目录路径
     * 在开发环境中返回src目录，在生产环境中返回dist目录
     */
    getUserProjectDir() {
        // 获取用户项目根目录
        const userProjectRoot = process.cwd();
        // 检查NODE_ENV环境变量判断运行环境
        const isProduction = process.env.NODE_ENV === 'production';
        // 在生产环境中加载编译后的JavaScript文件（dist目录）
        // 在开发环境中加载TypeScript源文件（src目录）
        const controllerDir = isProduction ? 'dist' : 'src';
        return path.resolve(userProjectRoot, controllerDir);
    }
    loadControllersFromDirectory(dir) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // 获取日志实例
            const log = ContainerManager_1.ContainerManager.getLogger() || new tslog78_1.TsLog78();
            for (const item of fs.readdirSync(dir)) {
                const fullPath = path.join(dir, item);
                const stat = fs.statSync(fullPath);
                // 确定要加载的文件扩展名
                const isProduction = process.env.NODE_ENV === 'production';
                const validExtensions = isProduction
                    ? ['.js'] // 生产环境只加载JavaScript文件
                    : ['.ts', '.js']; // 开发环境加载TypeScript和JavaScript文件
                if (stat.isDirectory()) {
                    yield this.loadControllersFromDirectory(fullPath);
                }
                else if (validExtensions.includes(path.extname(item)) && !item.endsWith('.d.ts')) {
                    try {
                        // 构造正确的文件路径（在生产环境中需要将.ts转换为.js）
                        let importPath = fullPath;
                        if (isProduction && path.extname(importPath) === '.ts') {
                            // 在生产环境中，TypeScript文件已经被编译为JavaScript文件
                            importPath = fullPath.replace(/\.ts$/, '.js');
                        }
                        log.debug(`Attempting to load controller from: ${importPath}`);
                        // 使用动态导入替代 require
                        const module = yield Promise.resolve(`${importPath}`).then(s => tslib_1.__importStar(require(s)));
                        const controllerClass = module.default;
                        if (controllerClass && controllerClass.prototype instanceof Base78_1.default) {
                            const apiDir = path.basename(path.dirname(path.dirname(importPath))).toLowerCase();
                            const menuDir = path.basename(path.dirname(importPath)).toLowerCase();
                            const controllerName = path.basename(importPath, path.extname(importPath)).toLowerCase();
                            const controllerKey = `${apiDir}/${menuDir}/${controllerName}`;
                            this.controllers.set(controllerKey, controllerClass);
                            log.debug(`Loaded controller: ${controllerKey}`);
                        }
                        else {
                            log.warn(`File ${importPath} does not export a valid controller class`);
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
        const controller = this.controllers.get(controllerKey);
        if (!controller) {
            log.warn(`Controller not found for key: ${controllerKey}. Available controllers: ${Array.from(this.controllers.keys()).join(', ')}`);
        }
        return controller;
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
exports.ControllerLoader = ControllerLoader;
exports.ControllerLoader = ControllerLoader = tslib_1.__decorate([
    (0, inversify_1.injectable)(),
    tslib_1.__metadata("design:paramtypes", [])
], ControllerLoader);
//# sourceMappingURL=ControllerLoader.js.map