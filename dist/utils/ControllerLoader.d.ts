export declare class ControllerLoader {
    private controllers;
    private loaded;
    constructor();
    private loadControllers;
    private loadControllersFromDirectory;
    getController(path: string): any;
}
