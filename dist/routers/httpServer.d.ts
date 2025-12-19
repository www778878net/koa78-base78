/// <reference types="node" />
import Koa from 'koa';
import http from 'http';
declare module 'koa' {
    interface Request {
        body?: any;
        fields?: any;
    }
}
export declare function startServer(port?: number): Promise<{
    app: Koa;
    httpServer: http.Server;
}>;
export declare function stopServer(server: http.Server): Promise<void>;
