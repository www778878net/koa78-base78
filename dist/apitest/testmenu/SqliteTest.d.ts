import { CidBase78 } from '../../controllers/Base78';
import { TableSchemas } from '../../config/tableConfig';
export default class sqlitetest extends CidBase78<TableSchemas['SqliteTest']> {
    /**
     * 初始化数据库连接
     */
    initDb(): Promise<string>;
    /**
     * 创建系统表（包括sys_log表）
     */
    createTables(): Promise<string>;
    /**
     * 插入测试数据到sys_log表
     */
    insertLog(): Promise<string>;
    /**
     * 查询sys_log表中的数据
     */
    queryLogs(): Promise<any>;
    /**
     * 查询sys_warn表中的数据
     */
    queryWarnings(): Promise<any>;
    /**
     * 查询sys_sql表中的数据
     */
    querySqlRecords(): Promise<any>;
}
