CREATE TABLE `workflow_task` (
  -- 插入时必须的字段
  `cid` varchar(36) NOT NULL DEFAULT '' COMMENT '公司/组织ID',
  `uid` varchar(36) NOT NULL DEFAULT '' COMMENT '用户ID',
  `idworkflowinstance` varchar(36) NOT NULL DEFAULT '' COMMENT '工作流实例ID',
  `idworkflowdefinition` varchar(36) NOT NULL DEFAULT '' COMMENT '工作流定义ID',
  `idtaskdefinition` varchar(36) NOT NULL DEFAULT '' COMMENT '任务定义ID',
  `taskname` varchar(100) NOT NULL DEFAULT '' COMMENT '任务名称',
  `handler` varchar(200) NOT NULL DEFAULT '' COMMENT '处理器函数名',
  `idagent` varchar(36) NOT NULL DEFAULT '' COMMENT '执行的Agent ID',
  `state` varchar(20) NOT NULL DEFAULT 'pending' COMMENT '任务状态: pending待处理, running运行中, completed已完成, failed失败, cancelled已取消',
  `priority` int NOT NULL DEFAULT 99 COMMENT '优先级，数字越小优先级越高',
  
  -- 时间信息
  `starttime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '开始时间',
  `endtime` datetime NOT NULL DEFAULT '1900-01-01 00:00:00' COMMENT '结束时间',
  `lastruntime` datetime NOT NULL DEFAULT '1900-01-01 00:00:00' COMMENT '最后运行时间',
  `lasterrortime` datetime NOT NULL DEFAULT '1900-01-01 00:00:00' COMMENT '最后错误时间',
  `lastoktime` datetime NOT NULL DEFAULT '1900-01-01 00:00:00' COMMENT '最后成功时间',
  `timeout` datetime NOT NULL DEFAULT '1900-01-01 00:00:00' COMMENT '超时时间',
  
  -- 数据
  `inputdata` json NOT NULL DEFAULT (JSON_OBJECT()) COMMENT '输入数据',
  `outputdata` json NOT NULL DEFAULT (JSON_OBJECT()) COMMENT '输出数据',
  
  -- 执行信息
  `runningstatus` varchar(20) NOT NULL DEFAULT 'idle' COMMENT '运行状态',
  `maxcopy` int NOT NULL DEFAULT 1 COMMENT '最大并发数',
  `currentcopy` int NOT NULL DEFAULT 0 COMMENT '当前并发数',
  `progress` int NOT NULL DEFAULT 0 COMMENT '任务进度（百分比）',
  `retrytimes` int NOT NULL DEFAULT 0 COMMENT '重试次数',
  `retrylimit` int NOT NULL DEFAULT 3 COMMENT '最大重试次数',
  `retryinterval` int NOT NULL DEFAULT 60 COMMENT '重试间隔时间（秒）',
  `maxruntime` int NOT NULL DEFAULT 3600 COMMENT '最大运行时间（秒）',
  
  -- 依赖关系
  `dependencies` json NOT NULL DEFAULT (JSON_OBJECT()) COMMENT '依赖关系，JSON格式',
  `prevtask` varchar(36) NOT NULL DEFAULT '' COMMENT '上一个任务ID',
  `nexttask` varchar(36) NOT NULL DEFAULT '' COMMENT '下一个任务ID',
  
  -- 错误信息
  `lasterrinfo` varchar(1000) NOT NULL DEFAULT '' COMMENT '错误信息',
  `lastokinfo` varchar(1000) NOT NULL DEFAULT '' COMMENT '成功信息',
  `errsec` int NOT NULL DEFAULT 0 COMMENT '错误秒数',
  
  -- 统计
  `successcount` int NOT NULL DEFAULT 0 COMMENT '成功次数',
  `errorcount` int NOT NULL DEFAULT 0 COMMENT '错误次数',
  `runcount` int NOT NULL DEFAULT 0 COMMENT '运行次数',
  
  -- 财务
  `actualcost` decimal(10,4) NOT NULL DEFAULT 0.0 COMMENT '实际成本',
  `actualrevenue` decimal(10,4) NOT NULL DEFAULT 0.0 COMMENT '实际收入',
  `actualprofit` decimal(10,4) NOT NULL DEFAULT 0.0 COMMENT '实际利润',
  `executiontime` decimal(10,2) NOT NULL DEFAULT 0.0 COMMENT '执行时间（秒）',
  
  -- 资源需求
  `resourcereq` json NOT NULL DEFAULT (JSON_OBJECT()) COMMENT '资源需求，JSON格式',
  
  -- 自动生成的字段
  `upby` varchar(50) NOT NULL DEFAULT '' COMMENT '更新人',
  `uptime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '更新时间',
  `idpk` int NOT NULL AUTO_INCREMENT COMMENT '自增主键',
  `id` varchar(36) NOT NULL DEFAULT '' COMMENT '全局唯一ID',
  `remark` varchar(200) NOT NULL DEFAULT '' COMMENT '备注1',
  `remark2` varchar(200) NOT NULL DEFAULT '' COMMENT '备注2',
  `remark3` varchar(200) NOT NULL DEFAULT '' COMMENT '备注3',
  `remark4` varchar(200) NOT NULL DEFAULT '' COMMENT '备注4',
  `remark5` varchar(200) NOT NULL DEFAULT '' COMMENT '备注5',
  `remark6` varchar(200) NOT NULL DEFAULT '' COMMENT '备注6',
  
 
  UNIQUE KEY `i_id` (`id`),
  INDEX `idx_workflowinstance` (`idworkflowinstance`),
  INDEX `idx_idagent` (`idagent`) 
  
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb3 COMMENT='工作流任务实例表';

-- 字段说明
-- 1. 与 workflow_instance 表对齐的字段
-- 相同字段：
-- - 财务：actualcost, actualrevenue, actualprofit, executiontime
-- - 统计：successcount, errorcount, runcount
-- - 时间：starttime, endtime, lastruntime, lasterrortime, lastoktime
-- - 错误：lasterrinfo, lastokinfo, errsec
-- - 通用：cid, uid, state, priority, upby, uptime, idpk, id, remark1-6
-- 2. workflow_task 特有的字段
-- 任务特有字段：
-- - 关联信息：idworkflowinstance, idworkflowdefinition, idtaskdefinition, taskname, handler, idagent
-- - 执行信息：runningstatus, progress, retrytimes, retrylimit, retryinterval, maxruntime
-- - 依赖关系：dependencies, prevtask, nexttask
-- - 资源：resourcereq
-- - 超时：timeout