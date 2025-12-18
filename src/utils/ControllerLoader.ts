import { injectable } from 'inversify';
import * as path from 'path';
import * as fs from 'fs';
import Base78 from '../controllers/Base78';
import { ContainerManager } from '../ContainerManager';
import { TsLog78 } from 'tslog78';

const log: TsLog78 = ContainerManager.getLogger() || TsLog78.Instance;

@injectable()
export class ControllerLoader {
    private controllers: Map<string, any> = new Map();

    constructor() {
        log.detail('ControllerLoader constructed');
        this.loadControllers();
    }

    private loadControllers() {
        log.detail('Starting to load controllers');
        const apiDir = path.resolve(__dirname, '..');
        fs.readdirSync(apiDir).forEach((dir) => {
            if (dir.toLowerCase().startsWith('api') && fs.statSync(path.join(apiDir, dir)).isDirectory()) {
                this.loadControllersFromDirectory(path.join(apiDir, dir));
            }
        });
        log.detail('Finished loading controllers');
    }

    private async loadControllersFromDirectory(dir: string) {
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
        const [apiver, apisys, apiobj] = path.split('/');
        const controllerKey = `${apiver}/${apisys}/${apiobj}`.toLowerCase();
        log.detail(`Attempting to get controller with key: ${controllerKey}`);
        return this.controllers.get(controllerKey);
    }
}