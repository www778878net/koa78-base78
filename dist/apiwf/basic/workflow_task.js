"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Base78_1 = require("../../controllers/Base78");
class workflow_task extends Base78_1.CidBase78 {
    constructor() {
        super();
        // 设置分表配置 - 按天分表
        this.setShardingConfig({
            type: 'daily',
            retentionDays: 5, // 保留5天的表  
            tableSQL: `
                CREATE TABLE IF NOT EXISTS {TABLE_NAME} (
                    idpk INT AUTO_INCREMENT PRIMARY KEY,  -- 自增主键
                    cid VARCHAR(36) NOT NULL DEFAULT '' COMMENT '公司/组织ID',  
                    uid VARCHAR(36) NOT NULL DEFAULT '' COMMENT '用户ID',        
                    apiv VARCHAR(20) NOT NULL DEFAULT '' COMMENT 'API版本',
                    apisys VARCHAR(20) NOT NULL DEFAULT '' COMMENT 'API系统',
                    apiobj VARCHAR(20) NOT NULL DEFAULT '' COMMENT 'API对象',

                    idworkflowinstance VARCHAR(36) NOT NULL DEFAULT '' COMMENT '工作流实例ID',
                    idworkflowdefinition VARCHAR(36) NOT NULL DEFAULT '' COMMENT '工作流定义ID',
                    idtaskdefinition VARCHAR(36) NOT NULL DEFAULT '' COMMENT '任务定义ID',
                    taskname VARCHAR(100) NOT NULL DEFAULT '' COMMENT '任务名称',
                    handler VARCHAR(200) NOT NULL DEFAULT '' COMMENT '处理器函数名',
                    idagent VARCHAR(36) NOT NULL DEFAULT '' COMMENT '执行的Agent ID',
                    state VARCHAR(20) NOT NULL DEFAULT 'pending' COMMENT '任务状态: pending待处理, running运行中, completed已完成, failed失败, cancelled已取消',
                    priority INTEGER DEFAULT 99 COMMENT '优先级，数字越小优先级越高',
                    
                    -- 时间信息
                    starttime DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '开始时间',
                    endtime DATETIME NOT NULL DEFAULT '1900-01-01 00:00:00' COMMENT '结束时间',
                    lastruntime DATETIME NOT NULL DEFAULT '1900-01-01 00:00:00' COMMENT '最后运行时间',
                    lasterrortime DATETIME NOT NULL DEFAULT '1900-01-01 00:00:00' COMMENT '最后错误时间',
                    lastoktime DATETIME NOT NULL DEFAULT '1900-01-01 00:00:00' COMMENT '最后成功时间',
                    timeout DATETIME NOT NULL DEFAULT '1900-01-01 00:00:00' COMMENT '超时时间',
                    
                    -- 数据
                    inputdata JSON NOT NULL DEFAULT (JSON_OBJECT()) COMMENT '输入数据',
                    outputdata JSON NOT NULL DEFAULT (JSON_OBJECT()) COMMENT '输出数据',
                    
                    -- 执行信息
                    runningstatus VARCHAR(20) NOT NULL DEFAULT 'idle' COMMENT '运行状态',
                    maxcopy INTEGER NOT NULL DEFAULT 1 COMMENT '最大并发数',
                    currentcopy INTEGER NOT NULL DEFAULT 0 COMMENT '当前并发数',
                    progress INTEGER NOT NULL DEFAULT 0 COMMENT '任务进度（百分比）',
                    retrytimes INTEGER NOT NULL DEFAULT 0 COMMENT '重试次数',
                    retrylimit INTEGER NOT NULL DEFAULT 3 COMMENT '最大重试次数',
                    retryinterval INTEGER NOT NULL DEFAULT 60 COMMENT '重试间隔时间（秒）',
                    maxruntime INTEGER NOT NULL DEFAULT 3600 COMMENT '最大运行时间（秒）',
                    
                    -- 依赖关系
                    dependencies JSON NOT NULL DEFAULT (JSON_OBJECT()) COMMENT '依赖关系，JSON格式',
                    prevtask VARCHAR(36) NOT NULL DEFAULT '' COMMENT '上一个任务ID',
                    nexttask VARCHAR(36) NOT NULL DEFAULT '' COMMENT '下一个任务ID',
                    
                    -- 错误信息
                    lasterrinfo VARCHAR(1000) NOT NULL DEFAULT '' COMMENT '错误信息',
                    lastokinfo VARCHAR(1000) NOT NULL DEFAULT '' COMMENT '成功信息',
                    errsec INTEGER NOT NULL DEFAULT 0 COMMENT '错误秒数',
                    
                    -- 统计
                    successcount INTEGER NOT NULL DEFAULT 0 COMMENT '成功次数',
                    errorcount INTEGER NOT NULL DEFAULT 0 COMMENT '错误次数',
                    runcount INTEGER NOT NULL DEFAULT 0 COMMENT '运行次数',
                    
                    -- 财务
                    actualcost DECIMAL(10,4) NOT NULL DEFAULT 0.0 COMMENT '实际成本',
                    actualrevenue DECIMAL(10,4) NOT NULL DEFAULT 0.0 COMMENT '实际收入',
                    actualprofit DECIMAL(10,4) NOT NULL DEFAULT 0.0 COMMENT '实际利润',
                    executiontime DECIMAL(10,2) NOT NULL DEFAULT 0.0 COMMENT '执行时间（秒）',
                    
                    -- 资源需求
                    resourcereq JSON NOT NULL DEFAULT (JSON_OBJECT()) COMMENT '资源需求，JSON格式',
                    
                    -- 自动生成的字段
                    upby VARCHAR(50) NOT NULL DEFAULT '' COMMENT '更新人',
                    uptime DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '更新时间',
                    id VARCHAR(36) NOT NULL DEFAULT '' COMMENT '全局唯一ID',
                    remark VARCHAR(200) NOT NULL DEFAULT '' COMMENT '备注1',
                    remark2 VARCHAR(200) NOT NULL DEFAULT '' COMMENT '备注2',
                    remark3 VARCHAR(200) NOT NULL DEFAULT '' COMMENT '备注3',
                    remark4 VARCHAR(200) NOT NULL DEFAULT '' COMMENT '备注4',
                    remark5 VARCHAR(200) NOT NULL DEFAULT '' COMMENT '备注5',
                    remark6 VARCHAR(200) NOT NULL DEFAULT '' COMMENT '备注6',
                    
              
                    UNIQUE KEY i_id (id),
                    INDEX idx_workflowinstance (idworkflowinstance),
                    INDEX idx_idagent (idagent)
                ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb3 COMMENT='工作流任务实例表'
            `
        });
    }
}
exports.default = workflow_task;
//# sourceMappingURL=workflow_task.js.map