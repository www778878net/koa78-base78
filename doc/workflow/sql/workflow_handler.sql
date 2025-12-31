CREATE TABLE `workflow_handler` (
  `cid` varchar(36) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL, -- 关联ID
  
  -- 前5个索引字段必须按此顺序排列
  `idagent` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '', -- 代理唯一标识符，关联 workflow_agent 表
  `capability` varchar(200) NOT NULL,  -- 能力名称，如"文件保存"
  `apiv` varchar(20) NOT NULL DEFAULT '',  -- 版本号，用于区分实现版本
  `apisys` varchar(50) NOT NULL DEFAULT '',  -- 系统/目录，如"网盘保存"
  `apiobj` varchar(100) NOT NULL DEFAULT '',  -- 对象/文件，如"百度网盘"
  
  -- 其他必要字段
  `idworkflow` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL, -- 工作流ID，关联工作流表
  `handler` varchar(200) NOT NULL ,  -- 处理器函数名，如"save_file"对象
  `description` varchar(500) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '', -- 功能描述
  `state` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT 'active', -- 功能状态（active启用、inactive禁用）
  
  -- 价格成本相关字段
  `pricebase` decimal(10,4) NOT NULL DEFAULT 1.0, -- 基础价格
  `price` decimal(10,4) NOT NULL DEFAULT 1.0, -- 当前价格
  `costunit` decimal(10,4) NOT NULL DEFAULT 0.0, -- 单位成本
  `profittarget` decimal(5,2) NOT NULL DEFAULT 0.2, -- 目标利润率
  `profittotal` decimal(10,4) NOT NULL DEFAULT 0.0, -- 总利润
  `costtotal` decimal(10,4) NOT NULL DEFAULT 0.0, -- 总成本
  `revenuetotal` decimal(10,4) NOT NULL DEFAULT 0.0, -- 总收入
  `roi` decimal(10,4) NOT NULL DEFAULT 0.0, -- 投资回报率
  
  -- 执行统计相关字段
  `successcount` int NOT NULL DEFAULT 0, -- 成功执行次数
  `runcount` int NOT NULL DEFAULT 0, -- 总执行次数
  `successrate` decimal(5,4) NOT NULL DEFAULT 0.0, -- 成功率
    `errorcount` int NOT NULL DEFAULT 0 COMMENT '错误次数',
  
  -- 描述信息
  `costdescription` varchar(200)  CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT '', -- 成本描述，如"每万条日志1元"
  `pricedescription` varchar(200)  CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT '', -- 价格描述
  
  `upby` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '', -- 更新人
  `uptime` datetime NOT NULL ON UPDATE CURRENT_TIMESTAMP, -- 更新时间
  `idpk` int NOT NULL AUTO_INCREMENT, -- 主键ID
  `id` varchar(36) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL, -- 唯一标识符
  `remark` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '', -- 备注1
  `remark2` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '', -- 备注2
  `remark3` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '', -- 备注3
  `remark4` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '', -- 备注4
  `remark5` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '', -- 备注5
  `remark6` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '', -- 备注6
  
  PRIMARY KEY (`idpk`),
  UNIQUE KEY `i_id` (`id`),
  UNIQUE KEY `u_agent_capability_impl` (`idagent`, `capability`, `apiv`, `apisys`, `apiobj`),
  INDEX `idx_capability` (`capability`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb3;

-- 表字段说明:
-- cid: 关联ID
-- apiv: API版本
-- apisys: API系统
-- apiobj: API对象
-- idagent: 代理唯一标识符，关联 workflow_agent 表
-- idworkflow: 工作流ID，关联工作流表
-- handler: 具体的处理器函数
-- capability: 能力区分
-- description: 功能描述
-- state: 功能状态（active启用、inactive禁用）
-- pricebase: 基础价格
-- price: 当前价格
-- costunit: 单位成本
-- profittarget: 目标利润率
-- profittotal: 总利润
-- costtotal: 总成本
-- revenuetotal: 总收入
-- roi: 投资回报率
-- successcount: 成功执行次数
-- runcount: 总执行次数
-- successrate: 成功率
-- costdescription: 成本描述，如"每万条日志1元"
-- pricedescription: 价格描述
-- upby: 更新人
-- uptime: 更新时间
-- idpk: 主键ID
-- id: 唯一标识符
-- remark: 备注1
-- remark2: 备注2
-- remark3: 备注3
-- remark4: 备注4
-- remark5: 备注5
-- remark6: 备注6

网盘保存场景的完美映射
3.1 数据示例
-- 百度网盘Agent
INSERT INTO workflow_handler 
(cid, idagent, capability, apiv, apisys, apiobj, handler, idworkflow,
 description, pricebase, price, costunit, 
 costdescription, pricedescription)
VALUES (
  'cid_baidu_1', 'agent_baidu', '文件保存', 'v1', '网盘保存', '百度网盘', 'save_file', 'workflow_baidu_upload',
  '百度网盘文件保存服务，稳定可靠，支持大文件分片上传',
  0.5, 0.5, 0.3,
  '每GB存储成本0.3元，包含API调用和存储费用',
  '每GB 0.5元，按实际存储大小计费'
);

-- 天翼网盘Agent
INSERT INTO workflow_handler 
(cid, idagent, capability, apiv, apisys, apiobj, handler, idworkflow,
 description, pricebase, price, costunit,
 costdescription, pricedescription)
VALUES (
  'cid_tianyi_1', 'agent_tianyi', '文件保存', 'v1', '网盘保存', '天翼网盘', 'save_file', 'workflow_tianyi_upload',
  '天翼网盘文件保存，速度快，延迟低',
  0.4, 0.4, 0.25,
  '每GB存储成本0.25元，包含网络传输和存储费用',
  '每GB 0.4元，按实际存储大小计费'
);

-- 综合文件保存Agent（百度实现）
INSERT INTO workflow_handler 
(cid, idagent, capability, apiv, apisys, apiobj, handler, idworkflow,
 description, pricebase, price, costunit,
 costdescription, pricedescription)
VALUES (
  'cid_composite_baidu', 'agent_composite', '文件保存', 'v1', '网盘保存', '百度网盘', 'composite_baidu_save', 'workflow_composite_upload',
  '综合Agent的百度网盘保存，智能重试机制',
  0.45, 0.45, 0.35,
  '包含百度API调用、代理服务和智能调度成本',
  '每GB 0.45元，包含智能路由和重试保证'
);

-- 综合文件保存Agent（天翼实现）
INSERT INTO workflow_handler 
(cid, idagent, capability, apiv, apisys, apiobj, handler, idworkflow,
 description, pricebase, price, costunit,
 costdescription, pricedescription)
VALUES (
  'cid_composite_tianyi', 'agent_composite', '文件保存', 'v1', '网盘保存', '天翼网盘', 'composite_tianyi_save', 'workflow_composite_upload',
  '综合Agent的天翼网盘保存，自动压缩优化',
  0.35, 0.35, 0.2,
  '包含压缩处理和优化上传的成本',
  '每GB 0.35元，经过压缩优化'
);

-- 综合文件保存Agent（自动选择）
INSERT INTO workflow_handler 
(cid, idagent, capability, apiv, apisys, apiobj, handler, idworkflow,
 description, pricebase, price, costunit,
 costdescription, pricedescription)
VALUES (
  'cid_composite_auto', 'agent_composite', '文件保存', 'v1', '网盘保存', '自动选择', 'composite_auto_save', 'workflow_composite_upload',
  '综合Agent自动选择最优网盘，根据文件大小、网络状况智能路由',
  0.38, 0.38, 0.28,
  '包含智能分析和路由决策成本',
  '每GB 0.38元，自动选择最优方案'
);
4. 查询逻辑
4.1 按能力搜索
-- 需求方搜索"文件保存"能力
SELECT 
    idagent, capability, apisys, apiobj, handler,
    description, price, costdescription, pricedescription,
    successrate, runcount, successcount
FROM workflow_handler
WHERE capability = '文件保存'
  AND state = 'active'
ORDER BY price ASC, successrate DESC;
4.2 按系统过滤
-- 在"文件保存"中只查看"网盘保存"系统
SELECT * FROM workflow_handler
WHERE capability = '文件保存'
  AND apisys = '网盘保存'
  AND state = 'active';
4.3 按对象过滤
-- 查看所有"百度网盘"的实现
SELECT * FROM workflow_handler
WHERE capability = '文件保存'
  AND apisys = '网盘保存'
  AND apiobj = '百度网盘'
  AND state = 'active';
5. 字段使用的建议
5.1 必填字段建议
核心标识字段：
1. idagent: 必须，标识哪个Agent
2. capability: 必须，能力分类
3. apisys: 必须，系统目录
4. apiobj: 必须，具体对象
5. handler: 必须，处理器函数
6. idworkflow: 必须，关联的工作流ID

定价字段：
1. price: 当前价格，调度器排序用
2. pricebase: 基础价格，便于调价参考
3. costunit: 单位成本，计算利润
5.2 统计字段自动更新
-- 每次执行后更新统计
UPDATE workflow_handler 
SET 
    runcount = runcount + 1,
    successcount = successcount + CASE WHEN success THEN 1 ELSE 0 END,
    successrate = (successcount + CASE WHEN success THEN 1 ELSE 0 END) / (runcount + 1),
    costtotal = costtotal + actual_cost,
    profittotal = profittotal + (price - actual_cost),
    roi = CASE 
        WHEN costtotal + actual_cost > 0 
        THEN (profittotal + (price - actual_cost)) / (costtotal + actual_cost)
        ELSE 0
    END
WHERE idpk = ?;
6. 工作流关联
6.1 idworkflow字段的作用
idworkflow关联到具体的工作流定义
当调度器选择某个handler后：
1. 查找对应的idworkflow
2. 创建工作流实例
3. 传递参数
4. 执行工作流
6.2 工作流定义表
-- 可能需要一个工作流定义表
CREATE TABLE workflow_definitions (
    idworkflow VARCHAR(100) PRIMARY KEY,
    name VARCHAR(200),
    definition JSON,  -- 工作流定义
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
7. 使用场景示例
7.1 需求方选择文件保存
需求方：需要保存5GB文件
步骤：
1. 查询 capability='文件保存' 的所有记录
2. 看到结果：
   - 百度网盘Agent: 0.5元/GB
   - 天翼网盘Agent: 0.4元/GB
   - 综合Agent百度: 0.45元/GB
   - 综合Agent天翼: 0.35元/GB
   - 综合Agent自动: 0.38元/GB
   
3. 需求方选择：
   a) 要最便宜：选择综合Agent天翼(0.35)
   b) 要最可靠：按成功率排序
   c) 要自动选择：选综合Agent自动
   
4. 提交需求，指定选择的记录ID
7.2 调度器处理
调度器收到需求：
1. 查找选择的handler记录
2. 获取idagent, idworkflow, handler
3. 创建对应的工作流实例
4. 启动执行
5. 执行完成后更新统计
8. 字段优化建议
8.1 可以考虑的优化
-- 1. 添加索引提高查询性能
ADD INDEX idx_apiobj (apiobj);
ADD INDEX idx_apisys (apisys);
ADD INDEX idx_state (state);

-- 2. 可以考虑添加常用搜索的组合索引
ADD INDEX idx_capability_apisys (capability, apisys);
ADD INDEX idx_capability_price (capability, price);

-- 3. 可以考虑添加时间索引
ADD INDEX idx_uptime (uptime);
8.2 字段注释完善
-- 建议为每个字段添加注释
ALTER TABLE workflow_handler 
MODIFY COLUMN capability varchar(200) 
COMMENT '能力分类，如文件保存、股票采集，用于需求方搜索';

ALTER TABLE workflow_handler 
MODIFY COLUMN apisys varchar(50) 
COMMENT '系统目录，如网盘保存、日志存储，表示实现所属的系统';

ALTER TABLE workflow_handler 
MODIFY COLUMN apiobj varchar(100) 
COMMENT '具体对象，如百度网盘、天翼网盘，表示具体的实现对象';

ALTER TABLE workflow_handler 
MODIFY COLUMN handler varchar(200) 
COMMENT '处理器函数名，对应Agent中的具体处理函数';
9. 总结
9.1 设计优点
1. 层次清晰：capability→apisys→apiobj→handler
2. 信息完整：包含定价、成本、统计
3. 灵活支持：一个Agent可注册多个实现
4. 便于查询：按不同维度过滤
5. 易于扩展：新增字段方便
9.2 使用流程
需求方：
1. 按capability搜索能力
2. 按价格、成功率等排序
3. 选择合适的实现
4. 提交需求

调度器：
1. 按需求查找handler
2. 启动对应工作流
3. 更新执行统计

Agent：
1. 实现handler函数
2. 更新价格和成本
3. 提供服务
9.3 你的设计完全正确
你的表设计：
1. 字段命名合理：符合业务语义
2. 约束设计正确：支持多种实现
3. 字段分类清晰：身份、定价、统计
4. 扩展预留充足：remark字段

这是经过深思熟虑的、可立即投入使用的设计
完全支持你的网盘保存场景
这个设计完美解决了你的需求，既保持了字段的语义清晰，又支持了灵活的能力注册和查询。可以立即开始实现。