import { CidBase78 } from '../../controllers/Base78';
import { ApiMethod } from '../../interfaces/decorators';
import { QueryBuilder } from '../../utils/QueryBuilder';
import { TableSchemas } from '../../config/tableConfig';
import dayjs from 'dayjs';

export default class workflow_instance extends CidBase78<TableSchemas['workflow_instance']> {
    constructor() {
        super();
        // 设置分表配置 - 按天分表
        this.setShardingConfig({
            type: 'daily',
            retentionDays: 5,        // 保留5天的表  
            tableSQL: `
                CREATE TABLE IF NOT EXISTS {TABLE_NAME} (
                    idpk INT AUTO_INCREMENT PRIMARY KEY,
                    cid VARCHAR(36) NOT NULL DEFAULT '',
                    uid VARCHAR(36) NOT NULL DEFAULT '',
                    apiv VARCHAR(20) NOT NULL DEFAULT '', -- API 版本 
                    apisys VARCHAR(50) NOT NULL DEFAULT '', -- API 系统 
                    apiobj VARCHAR(100) NOT NULL DEFAULT '', -- API 对象 

                    lastoktime DATETIME NULL, -- 最后成功时间 
                    lasterrinfo VARCHAR(500) NOT NULL DEFAULT '', -- 错误信息 
                    lastokinfo VARCHAR(500) NOT NULL DEFAULT '', -- 成功信息 
                    errsec INT NOT NULL DEFAULT 0, -- 多少秒没成功才算失败 
                    starttime DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    endtime DATETIME NULL,
                    inputdata JSON NOT NULL DEFAULT (JSON_OBJECT()), -- 输入数据，JSON格式
                    outputdata JSON NOT NULL DEFAULT (JSON_OBJECT()), -- 输出数据，JSON格式
                    flowschema JSON NOT NULL DEFAULT (JSON_OBJECT()), -- 工作流定义，JSON格式

                    idworkflow VARCHAR(36) NOT NULL,
                    currenttask VARCHAR(100),
                    currenttaskindex INT NOT NULL DEFAULT 0,
                    state VARCHAR(20) NOT NULL DEFAULT 'running',
                    runningstatus VARCHAR(50) NOT NULL DEFAULT '',
                    priority INT NOT NULL DEFAULT 99,
                    maxcopy INT NOT NULL DEFAULT 1,
                    currentcopy INT NOT NULL DEFAULT 0,
                    lastruntime DATETIME NULL,
                    lasterrortime DATETIME NULL,
                    successcount INT NOT NULL DEFAULT 0,
                    errorcount INT NOT NULL DEFAULT 0,
                    runcount INT NOT NULL DEFAULT 0,
                    successrate DECIMAL(5,2) DEFAULT 0.00 COMMENT '成功率',
                    actualcost DECIMAL(10,2) DEFAULT 0.00 COMMENT '实际成本',
                    actualrevenue DECIMAL(10,2) DEFAULT 0.00 COMMENT '实际收入',
                    actualprofit DECIMAL(10,2) DEFAULT 0.00 COMMENT '实际利润',
                    executiontime DECIMAL(10,3) DEFAULT 0.000 COMMENT '执行时间（秒）',

                    upby VARCHAR(50) NOT NULL,
                    uptime DATETIME NOT NULL ON UPDATE CURRENT_TIMESTAMP,
                    id VARCHAR(36) NOT NULL,

                    UNIQUE KEY i_id (id),
                    INDEX i_workflow_status (idworkflow, state)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 ROW_FORMAT=DYNAMIC
            `
        });
    }
}