import { injectable } from 'inversify';
import UpInfo from 'koa78-upinfo';
import { DatabaseConnections } from '../static/DatabaseConnections';
import { ContainerManager } from '../ContainerManager';

@injectable()
export class DatabaseService {
    public static instance: DatabaseService;
    public dbConnections?: DatabaseConnections;
    private log: any = null;

    constructor() {
        // 使用新的日志服务方式
        this.log = ContainerManager.getLogger();
        DatabaseService.instance = this;
    }

    setDatabaseConnections(dbConnections: DatabaseConnections) {
        this.dbConnections = dbConnections;
    }

    async get(sql: string, values: any[], up: UpInfo, dbName: string = "default"): Promise<any> {
        if (!this.dbConnections) {
            this.log.error('DatabaseConnections not initialized');
            throw new Error('DatabaseConnections not initialized');
        }
        const mysql = this.dbConnections.getMySQLConnection(dbName);
        if (!mysql) {
            this.log.error('Default MySQL connection not found' + dbName);
            throw new Error('Default MySQL connection not found' + dbName);
        }
        try {
            return await mysql.doGet(sql, values, up);
        } catch (error) {
            this.log.error(dbName + 'Error in DatabaseService.get:', error);
            throw error;
        }
    }

    async m(sql: string, values: any[], up: UpInfo, dbName: string = "default"): Promise<{ affectedRows: number; error?: string }> {
        if (!this.dbConnections) {
            this.log.error('DatabaseConnections not initialized');
            throw new Error('DatabaseConnections not initialized');
        }
        const mysql = this.dbConnections.getMySQLConnection(dbName);
        if (!mysql) {
            this.log.error('Default MySQL connection not found');
            throw new Error('Default MySQL connection not found');
        }
        try {
            return await mysql.doM(sql, values, up);
        } catch (error) {
            this.log.error(dbName + 'Error in DatabaseService.m:', error);
            throw error;
        }
    }

    async doT(cmds: string[], values: string[][], errtexts: string[], logtext: string, logvalue: string[], up: UpInfo, dbName: string = "default"): Promise<string> {
        if (!this.dbConnections) {
            this.log.error('DatabaseConnections not initialized');
            throw new Error('DatabaseConnections not initialized');
        }
        const mysql = this.dbConnections.getMySQLConnection(dbName);
        if (!mysql) {
            this.log.error('Default MySQL connection not found');
            throw new Error('Default MySQL connection not found');
        }
        try {
            return await mysql.doT(cmds, values, errtexts, logtext, logvalue, up);
        } catch (error) {
            this.log.error(dbName + 'Error in DatabaseService.doT:', error);
            throw error;
        }
    }

    async mAdd(sql: string, values: any[], up: UpInfo, dbName: string = "default"): Promise<{ insertId: number; error?: string }> {
        if (!this.dbConnections) {
            this.log.error('DatabaseConnections not initialized');
            throw new Error('DatabaseConnections not initialized');
        }
        const mysql = this.dbConnections.getMySQLConnection(dbName);
        if (!mysql) {
            this.log.error('Default MySQL connection not found');
            throw new Error('Default MySQL connection not found');
        }
        try {
            return await mysql.doMAdd(sql, values, up);
        } catch (error) {
            this.log.error(dbName + 'Error in DatabaseService.mAdd:', error);
            throw error;
        }
    }

    // SQLite相关方法
    async sqliteGet(sql: string, values: any[], up: UpInfo, dbName: string = "default"): Promise<any> {
        if (!this.dbConnections) {
            this.log.error('DatabaseConnections not initialized');
            throw new Error('DatabaseConnections not initialized');
        }
        const sqlite = this.dbConnections.getSQLiteConnection(dbName);
        if (!sqlite) {
            this.log.error('Default SQLite connection not found');
            throw new Error('Default SQLite connection not found');
        }
        try {
            return await sqlite.doGet(sql, values, up);
        } catch (error) {
            this.log.error(dbName + 'Error in DatabaseService.sqliteGet:', error);
            throw error;
        }
    }

    async sqliteM(sql: string, values: any[], up: UpInfo, dbName: string = "default"): Promise<{ affectedRows: number; error?: string }> {
        if (!this.dbConnections) {
            this.log.error('DatabaseConnections not initialized');
            throw new Error('DatabaseConnections not initialized');
        }
        const sqlite = this.dbConnections.getSQLiteConnection(dbName);
        if (!sqlite) {
            this.log.error('Default SQLite connection not found');
            throw new Error('Default SQLite connection not found');
        }
        try {
            return await sqlite.doM(sql, values, up);
        } catch (error) {
            this.log.error(dbName + 'Error in DatabaseService.sqliteM:', error);
            throw error;
        }
    }

    async sqliteDoT(cmds: string[], values: string[][], errtexts: string[], logtext: string, logvalue: string[], up: UpInfo, dbName: string = "default"): Promise<string> {
        if (!this.dbConnections) {
            this.log.error('DatabaseConnections not initialized');
            throw new Error('DatabaseConnections not initialized');
        }
        const sqlite = this.dbConnections.getSQLiteConnection(dbName);
        if (!sqlite) {
            this.log.error('Default SQLite connection not found');
            throw new Error('Default SQLite connection not found');
        }
        try {
            return await sqlite.doT(cmds, values, errtexts, logtext, logvalue, up);
        } catch (error) {
            this.log.error(dbName + 'Error in DatabaseService.sqliteDoT:', error);
            throw error;
        }
    }

    async sqliteMAdd(sql: string, values: any[], up: UpInfo, dbName: string = "default"): Promise<{ insertId: number; error?: string }> {
        if (!this.dbConnections) {
            this.log.error('DatabaseConnections not initialized');
            throw new Error('DatabaseConnections not initialized');
        }
        const sqlite = this.dbConnections.getSQLiteConnection(dbName);
        if (!sqlite) {
            this.log.error('Default SQLite connection not found');
            throw new Error('Default SQLite connection not found');
        }
        try {
            return await sqlite.doMAdd(sql, values, up);
        } catch (error) {
            this.log.error(dbName + 'Error in DatabaseService.sqliteMAdd:', error);
            throw error;
        }
    }

    // Add other methods...
}