/// <reference types="node" />
import Koa from 'koa';
import http from 'http';
export declare function startServer(port?: number): Promise<{
    app: Koa;
    httpServer: http.Server;
}>;
export declare function stopServer(server: http.Server): Promise<void>;
