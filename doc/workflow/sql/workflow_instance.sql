CREATE TABLE `workflow_instance` (
  -- 插入时必须的字段
  `cid` varchar(36) NOT NULL DEFAULT '' COMMENT '公司/组织ID',
  `uid` varchar(36) NOT NULL DEFAULT '' COMMENT '用户ID',
  `idworkflow` varchar(36) NOT NULL DEFAULT '' COMMENT '工作流定义ID',
   `flowschema` json NOT NULL DEFAULT (JSON_OBJECT()) COMMENT '工作流定义，JSON格式',
  `apiv` varchar(20) NOT NULL DEFAULT '' COMMENT 'API版本',
  `apisys` varchar(50) NOT NULL DEFAULT '' COMMENT 'API系统目录',
  `apiobj` varchar(100) NOT NULL DEFAULT '' COMMENT 'API对象',
  `state` varchar(20) NOT NULL DEFAULT 'running' COMMENT '实例状态',
  `priority` int NOT NULL DEFAULT 0 COMMENT '优先级',
  
  -- 时间信息
  `starttime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '开始时间',
  `endtime` datetime NOT NULL DEFAULT '1900-01-01 00:00:00' COMMENT '结束时间',
  `lastruntime` datetime NOT NULL DEFAULT '1900-01-01 00:00:00' COMMENT '最后运行时间',
  `lasterrortime` datetime NOT NULL DEFAULT '1900-01-01 00:00:00' COMMENT '最后错误时间',
  `lastoktime` datetime NOT NULL DEFAULT '1900-01-01 00:00:00' COMMENT '最后成功时间',
  
  -- 数据
  `inputdata` json NOT NULL DEFAULT (JSON_OBJECT()) COMMENT '输入数据',
  `outputdata` json NOT NULL DEFAULT (JSON_OBJECT()) COMMENT '输出数据',
  
  -- 执行信息
  `currenttask` varchar(100) NOT NULL DEFAULT '' COMMENT '当前任务',
  `currenttaskindex` int NOT NULL DEFAULT 0 COMMENT '当前任务索引',
  `runningstatus` varchar(50) NOT NULL DEFAULT '' COMMENT '运行状态',
  `maxcopy` int NOT NULL DEFAULT 1 COMMENT '最大并发数',
  `currentcopy` int NOT NULL DEFAULT 0 COMMENT '当前并发数',
  
  -- 错误信息
  `lasterrinfo` varchar(1000) NOT NULL DEFAULT '' COMMENT '错误信息',
  `lastokinfo` varchar(1000) NOT NULL DEFAULT '' COMMENT '成功信息',
  `errsec` int NOT NULL DEFAULT 0 COMMENT '错误秒数',
  
  -- 统计
  `successcount` int NOT NULL DEFAULT 0 COMMENT '成功次数',
  `runcount` int NOT NULL DEFAULT 0 COMMENT '总运行次数',
  `successrate` decimal(5,4) NOT NULL DEFAULT 0.0 COMMENT '成功率',
  `errorcount` int NOT NULL DEFAULT 0 COMMENT '错误次数',
  
  -- 财务
  `actualcost` decimal(10,4) NOT NULL DEFAULT 0.0 COMMENT '实际成本',
  `actualrevenue` decimal(10,4) NOT NULL DEFAULT 0.0 COMMENT '实际收入',
  `actualprofit` decimal(10,4) NOT NULL DEFAULT 0.0 COMMENT '实际利润',
  `executiontime` decimal(10,2) NOT NULL DEFAULT 0.0 COMMENT '执行时间',
  
  -- 自动生成的字段
  `upby` varchar(50) NOT NULL DEFAULT '' COMMENT '更新人',
  `uptime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `idpk` int NOT NULL AUTO_INCREMENT COMMENT '自增主键',
  `id` varchar(36) NOT NULL DEFAULT '' COMMENT '全局唯一ID',
  `remark` varchar(200) NOT NULL DEFAULT '' COMMENT '备注1',
  `remark2` varchar(200) NOT NULL DEFAULT '' COMMENT '备注2',
  `remark3` varchar(200) NOT NULL DEFAULT '' COMMENT '备注3',
  `remark4` varchar(200) NOT NULL DEFAULT '' COMMENT '备注4',
  `remark5` varchar(200) NOT NULL DEFAULT '' COMMENT '备注5',
  `remark6` varchar(200) NOT NULL DEFAULT '' COMMENT '备注6',
  
  PRIMARY KEY (`idpk`),
  UNIQUE KEY `i_id` (`id`),
  INDEX `idx_workflow_status` (`idworkflow`, `state`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb3;