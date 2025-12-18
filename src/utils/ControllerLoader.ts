import { injectable } from 'inversify';
import * as path from 'path';
import * as fs from 'fs';
import Base78 from '../controllers/Base78';
import { ContainerManager } from '../ContainerManager';
import { TsLog78 } from 'tslog78';



@injectable()
export class ControllerLoader {
    private controllers: Map<string, any> = new Map();
    private loaded: boolean = false;

    constructor() {
        // 不在构造函数中加载控制器，避免在模块加载时访问未初始化的日志服务
    }

    private loadControllers() {
        // 确保只加载一次
        if (this.loaded) {
            return;
        }

        // 获取日志实例（此时容器应该已经初始化完成）
        const log: TsLog78 = ContainerManager.getLogger() || TsLog78.Instance;

        log.detail('ControllerLoader constructed');
        log.detail('Starting to load controllers');
        const apiDir = path.resolve(__dirname, '..');
        fs.readdirSync(apiDir).forEach((dir) => {
            if (dir.toLowerCase().startsWith('api') && fs.statSync(path.join(apiDir, dir)).isDirectory()) {
                this.loadControllersFromDirectory(path.join(apiDir, dir));
            }
        });
        log.detail('Finished loading controllers');
        this.loaded = true;
    }

    private async loadControllersFromDirectory(dir: string) {
        // 获取日志实例
        const log: TsLog78 = ContainerManager.getLogger() || new TsLog78();

        for (const item of fs.readdirSync(dir)) {
            const fullPath = path.join(dir, item);
            if (fs.statSync(fullPath).isDirectory()) {
                await this.loadControllersFromDirectory(fullPath);
            } else if (item.endsWith('.ts') || item.endsWith('.js')) {
                if (item.endsWith('.d.ts')) continue;
                try {
                    // 使用动态导入替代 require
                    const module = await import(fullPath);
                    const controllerClass = module.default;
                    if (controllerClass && controllerClass.prototype instanceof Base78) {
                        const apiDir = path.basename(path.dirname(path.dirname(fullPath))).toLowerCase();
                        const menuDir = path.basename(path.dirname(fullPath)).toLowerCase();
                        const controllerName = path.basename(fullPath, path.extname(fullPath)).toLowerCase();
                        const controllerKey = `${apiDir}/${menuDir}/${controllerName}`;

                        this.controllers.set(controllerKey, controllerClass);
                    } else {
                        log.warn(`File ${fullPath} does not export a valid controller class`);
                    }
                } catch (error) {
                    log.error(`Error loading controller from ${fullPath}:`, error);
                }
            }
        }
    }

    getController(path: string): any {
        // 确保控制器已加载
        if (!this.loaded) {
            this.loadControllers();
        }

        // 获取日志实例
        const log: TsLog78 = ContainerManager.getLogger() || TsLog78.Instance;

        const [apiver, apisys, apiobj] = path.split('/');
        const controllerKey = `${apiver}/${apisys}/${apiobj}`.toLowerCase();
        log.detail(`Attempting to get controller with key: ${controllerKey}`);
        return this.controllers.get(controllerKey);
    }
}