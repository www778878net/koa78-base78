export const tableConfigs = {
    sys_ip: {
        colsImp: ['ip'] as const,
        uidcid: 'uid' as const,
        apisys: 'apitest',
        apimicro: 'testmenu'
    },
    sqlitetest: {
        colsImp: ['field1', 'field2'] as const,
        uidcid: 'cid' as const,
        apisys: 'apitest',
        apimicro: 'testmenu'
    },
    Test78: {
        colsImp: ['field1', 'field2'] as const,
        uidcid: 'cid' as const,
        apisys: 'apitest',
        apimicro: 'testmenu'
    },
    testtb: {
        colsImp: ['kind', 'item', 'data'] as const,
        uidcid: 'cid' as const,
        apisys: 'apitest',
        apimicro: 'testmenu'
    },
    workflow_definition: {
        // 工作流定义        
        colsImp: [
            // API 版本    API 系统    API 对象
            'apisys', 'apimicro', 'apiobj',
            // 工作流名称    描述    版本    状态
            'wfname', 'description', 'version', 'state',
            // 工作流结构
            'starttask', 'flowschema',
            // 健康监控
            'lastoktime', 'lasterrinfo', 'lastokinfo', 'errsec',
            // 财务统计
            'totalcost', 'totalrevenue', 'totalprofit', 'roi',
            // 执行统计
            'runcount', 'successcount', 'errorcount', 'successrate', 'executiontime'
        ] as const,
        uidcid: 'cid' as const,
        apisys: 'apiwf',
        apimicro: 'basic'
    },
    workflow_instance: {
        colsImp: [
            // API 版本    API 系统    API 对象
            'apisys', 'apimicro', 'apiobj',
            // 工作流ID    状态    优先级
            'idworkflow', 'state', 'priority',
            // 工作流定义
            'flowschema',
            // 时间信息
            'starttime', 'endtime', 'lastruntime', 'lasterrortime', 'lastoktime',
            // 数据
            'inputdata', 'outputdata',
            // 执行信息
            'currenttask', 'currenttaskindex', 'runningstatus', 'maxcopy', 'currentcopy',
            // 错误信息
            'lasterrinfo', 'lastokinfo', 'errsec',
            // 统计
            'successcount', 'runcount', 'successrate', 'errorcount',
            // 财务
            'actualcost', 'actualrevenue', 'actualprofit', 'executiontime'
        ] as const,
        uidcid: 'cid' as const,
        apisys: 'apiwf',
        apimicro: 'basic'
    },
    workflow_agent: {
        colsImp: [
            // API 版本    API 系统    API 对象
            'apisys', 'apimicro', 'apiobj',
            // 代理名称    描述
            'agentname', 'description',
            // 最大并发数
            'maxcopy',
            // 价格成本相关字段
            'pricebase', 'price', 'costunit', 'profittarget',
            'profittotal', 'costtotal', 'revenuetotal', 'roi',
            // 执行统计相关字段
            'successcount', 'runcount', 'successrate', 'errorcount',
            // 状态和配置
            'state', 'version', 'errsec',
            // 生命周期
            'starttime', 'endtime',
            // 描述信息
            'costdescription', 'pricedescription'
        ] as const,
        uidcid: 'cid' as const,
        apisys: 'apiwf',
        apimicro: 'basic'
    },
    workflow_task: {
        colsImp: [
            // API 版本    API 系统    API 对象
            'apisys', 'apimicro', 'apiobj',
            // 工作流实例ID    工作流定义ID    任务定义ID
            'idworkflowinstance', 'idworkflowdefinition', 'idtaskdefinition',
            // 任务名称    处理器函数名    执行的Agent ID
            'taskname', 'handler', 'idagent',
            // 状态    优先级    输入数据
            'state', 'priority', 'inputdata',
            // 输出数据    运行状态
            'outputdata', 'runningstatus',
            // 最大并发数    当前并发数    进度
            'maxcopy', 'currentcopy', 'progress',
            // 重试次数    最大重试次数    重试间隔时间
            'retrytimes', 'retrylimit', 'retryinterval',
            // 最大运行时间    超时时间
            'maxruntime', 'timeout',
            // 依赖关系    上一个任务ID    下一个任务ID
            'dependencies', 'prevtask', 'nexttask',
            // 资源需求
            'resourcereq',
            // 错误信息    成功信息    错误秒数
            'lasterrinfo', 'lastokinfo', 'errsec',
            // 财务信息
            'actualcost', 'actualrevenue', 'actualprofit',
            // 执行时间
            'executiontime',
            // 生命周期
            'starttime', 'endtime',
            // 时间信息
            'lastruntime', 'lasterrortime', 'lastoktime',
            // 执行统计
            'successcount', 'errorcount', 'runcount'
        ] as const,
        uidcid: 'cid' as const,
        apisys: 'apiwf',
        apimicro: 'basic'
    },
    workflow_handler: {
        colsImp: [
            // 前5个字段必须按索引顺序排列
            'idagent', 'capability', 'apisys', 'apimicro', 'apiobj',
            // 其他必要字段
            'idworkflow', 'handler', 'description', 'state',
            // 价格成本相关字段
            'pricebase', 'price', 'costunit', 'profittarget', 'profittotal', 'costtotal', 'revenuetotal', 'roi',
            // 执行统计相关字段
            'successcount', 'runcount', 'successrate',
            // 描述信息
            'costdescription', 'pricedescription'
        ] as const,
        uidcid: 'cid' as const,
        apisys: 'apiwf',
        apimicro: 'basic'
    },
    workflow_definition_task: {
        colsImp: [
            // API 版本    API 系统    API 对象
            'apisys', 'apimicro', 'apiobj',
            // 工作流定义ID    任务名称    处理器函数名
            'idworkflowdefinition', 'taskname', 'handler',
            // 描述    状态
            'description', 'state',
            // 任务类型    优先级    最大并发数
            'tasktype', 'priority', 'maxcopy',
            // 超时时间    最大重试次数    重试间隔时间
            'timeout', 'retrylimit', 'retryinterval',
            // 错误判定时间
            'errsec',
            // 依赖任务列表    任务配置
            'dependencies', 'config',
            // 健康监控
            'lastoktime', 'lasterrinfo', 'lastokinfo',
            // 财务统计
            'totalcost', 'totalrevenue', 'totalprofit', 'roi',
            // 执行统计
            'runcount', 'successcount', 'errorcount', 'successrate', 'executiontime'
        ] as const,
        uidcid: 'cid' as const,
        apisys: 'apiwf',
        apimicro: 'basic'
    }
} as const;
