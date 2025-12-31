CREATE TABLE `workflow_definition` (
  -- 新增时必须的字段
  `cid` varchar(36) NOT NULL DEFAULT '' COMMENT '公司/组织ID',
  `wfname` varchar(100) NOT NULL DEFAULT '' COMMENT '工作流名称',
  `version` varchar(20) NOT NULL DEFAULT '1.0.0' COMMENT '版本',
  `state` varchar(20) NOT NULL DEFAULT 'active' COMMENT '状态: active启用, inactive禁用',
  `apiv` varchar(20) NOT NULL DEFAULT '' COMMENT 'API版本',
  `apisys` varchar(50) NOT NULL DEFAULT '' COMMENT 'API系统目录',
  `apiobj` varchar(100) NOT NULL DEFAULT '' COMMENT 'API对象',
  `starttask` varchar(100) NOT NULL DEFAULT '' COMMENT '起始任务',
  `flowschema` json NOT NULL DEFAULT (JSON_OBJECT()) COMMENT '工作流定义，JSON格式',
  `description` varchar(500) NOT NULL DEFAULT '' COMMENT '描述',
  
  -- 健康监控
  `lastoktime` datetime NOT NULL DEFAULT '1900-01-01 00:00:00' COMMENT '最后成功时间',
  `lasterrinfo` varchar(500) NOT NULL DEFAULT '' COMMENT '错误信息',
  `lastokinfo` varchar(500) NOT NULL DEFAULT '' COMMENT '成功信息',
  `errsec` int NOT NULL DEFAULT 0 COMMENT '多少秒没成功才算失败',
  
  -- 财务统计（保持与其他表一致的命名）
  `totalcost` decimal(20,4) NOT NULL DEFAULT 0.0 COMMENT '总成本',
  `totalrevenue` decimal(20,4) NOT NULL DEFAULT 0.0 COMMENT '总收入',
  `totalprofit` decimal(20,4) NOT NULL DEFAULT 0.0 COMMENT '总利润',
  `roi` decimal(10,4) NOT NULL DEFAULT 0.0 COMMENT '投资回报率',
  
  -- 执行统计（统一命名）
  `runcount` int NOT NULL DEFAULT 0 COMMENT '总执行次数',
  `successcount` int NOT NULL DEFAULT 0 COMMENT '成功次数',
  `errorcount` int NOT NULL DEFAULT 0 COMMENT '失败次数',
  `successrate` decimal(5,4) NOT NULL DEFAULT 0.0 COMMENT '成功率',
  `executiontime` decimal(10,2) NOT NULL DEFAULT 0.0 COMMENT '执行时间(秒)',
  
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
  UNIQUE KEY `u_name_version` (`wfname`, `version`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb3 COMMENT='工作流定义表';