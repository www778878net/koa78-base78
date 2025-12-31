CREATE TABLE `workflow_agent` (
  -- 插入时必须的字段
  `cid` varchar(36) NOT NULL DEFAULT '' COMMENT '公司/组织ID',
  `agentname` varchar(200) NOT NULL DEFAULT '' COMMENT 'Agent名称',
  `apiv` varchar(20) NOT NULL DEFAULT '' COMMENT 'API版本',
  `apisys` varchar(50) NOT NULL DEFAULT '' COMMENT 'API系统目录',
  `apiobj` varchar(100) NOT NULL DEFAULT '' COMMENT 'API对象',
  `description` varchar(500) NOT NULL DEFAULT '' COMMENT '描述',
  `maxcopy` int NOT NULL DEFAULT 1 COMMENT '最大并发数',
  
  -- 价格成本相关字段（与workflow_handler完全一致）
  `pricebase` decimal(10,4) NOT NULL DEFAULT 1.0 COMMENT '基础价格',
  `price` decimal(10,4) NOT NULL DEFAULT 1.0 COMMENT '当前价格',
  `costunit` decimal(10,4) NOT NULL DEFAULT 0.0 COMMENT '单位成本',
  `profittarget` decimal(5,2) NOT NULL DEFAULT 0.2 COMMENT '目标利润率',
  `profittotal` decimal(10,4) NOT NULL DEFAULT 0.0 COMMENT '总利润',
  `costtotal` decimal(10,4) NOT NULL DEFAULT 0.0 COMMENT '总成本',
  `revenuetotal` decimal(10,4) NOT NULL DEFAULT 0.0 COMMENT '总收入',
  `roi` decimal(10,4) NOT NULL DEFAULT 0.0 COMMENT '投资回报率',
  
  -- 执行统计相关字段（与workflow_handler完全一致）
  `successcount` int NOT NULL DEFAULT 0 COMMENT '成功执行次数',
  `runcount` int NOT NULL DEFAULT 0 COMMENT '总执行次数',
  `successrate` decimal(5,4) NOT NULL DEFAULT 0.0 COMMENT '成功率',
    `errorcount` int NOT NULL DEFAULT 0 COMMENT '错误次数',
  
  -- 状态和配置
  `state` varchar(20) NOT NULL DEFAULT 'active' COMMENT '状态: active启用, inactive禁用',
  `version` varchar(50) NOT NULL DEFAULT '1.0.0' COMMENT '版本',
  `errsec` int NOT NULL DEFAULT 0 COMMENT '多少秒没成功才算失败',
  
  -- 系统自动维护的字段
  `currentcopy` int NOT NULL DEFAULT 0 COMMENT '当前并发数',
  `lastheartbeat` datetime NOT NULL DEFAULT '1900-01-01 00:00:00' COMMENT '最后心跳时间',
  `lastoktime` datetime NOT NULL DEFAULT '1900-01-01 00:00:00' COMMENT '最后成功时间',
  `lasterrinfo` varchar(500) NOT NULL DEFAULT '' COMMENT '错误信息',
  `lastokinfo` varchar(500) NOT NULL DEFAULT '' COMMENT '成功信息',
  
  -- 生命周期
  `starttime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '启动时间',
  `endtime` datetime NOT NULL DEFAULT '1900-01-01 00:00:00' COMMENT '结束时间',
  
  -- 描述信息
  `costdescription` varchar(1000) NOT NULL DEFAULT '' COMMENT '成本描述',
  `pricedescription` varchar(1000) NOT NULL DEFAULT '' COMMENT '价格描述',
  
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
  UNIQUE KEY `i_id` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb3;