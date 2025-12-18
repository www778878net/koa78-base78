export declare class ControllerLoader {
    private controllers;
    private loaded;
    constructor();
    loadControllers(): void;
    private loadControllersFromDirectory;
    getController(path: string): any;
}
