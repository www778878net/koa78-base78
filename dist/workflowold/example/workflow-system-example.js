"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
// 工作流系统完整示例
const agent_1 = require("../../workflow/base/agent");
const handler_1 = require("../../workflow/base/handler");
const workflow_1 = require("../../workflow/base/workflow");
// 1. 创建Agent实例
const agent = new agent_1.Agent();
console.log('=== 创建Agent ===');
agent.name = 'workflow-agent';
agent.state = 'active';
console.log(`Agent: ${agent.name} (状态: ${agent.state})`);
// 2. 注册Handler到Agent
// 创建参数验证器Handler
const paramValidatorHandler = new handler_1.Handler();
paramValidatorHandler.name = 'param-validator';
paramValidatorHandler.type = 'validator';
paramValidatorHandler.capability = 'validate';
paramValidatorHandler.state = 'active';
// 设置验证器回调函数
paramValidatorHandler.setCallback((inputData) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    console.log('参数验证器回调被调用');
    console.log('传入参数:', inputData);
    if (!inputData || !inputData.sid) {
        return {
            handler: 'param-validator',
            capability: 'validate',
            result: {
                status: 'error',
                message: '缺少必要参数sid'
            }
        };
    }
    return {
        handler: 'param-validator',
        capability: 'validate',
        result: {
            status: 'success',
            message: '参数验证通过',
            data: inputData
        }
    };
}));
// 创建数据库查询Handler
const dbQueryHandler = new handler_1.Handler();
dbQueryHandler.name = 'db-query';
dbQueryHandler.type = 'action';
dbQueryHandler.capability = 'query';
dbQueryHandler.state = 'active';
// 设置数据库查询回调函数
dbQueryHandler.setCallback((inputData) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    console.log('数据库查询回调被调用');
    console.log('传入参数:', inputData);
    // 模拟数据库查询
    const mockUser = {
        id: 'user-123',
        name: '张三',
        email: 'zhangsan@example.com',
        sid: inputData.sid
    };
    return {
        handler: 'db-query',
        capability: 'query',
        result: {
            status: 'success',
            message: '查询成功',
            data: mockUser
        }
    };
}));
// 创建结果格式化Handler
const resultFormatterHandler = new handler_1.Handler();
resultFormatterHandler.name = 'result-formatter';
resultFormatterHandler.type = 'formatter';
resultFormatterHandler.capability = 'format';
resultFormatterHandler.state = 'active';
// 设置结果格式化回调函数
resultFormatterHandler.setCallback((inputData) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    console.log('结果格式化回调被调用');
    console.log('传入参数:', inputData);
    if (!inputData || !inputData.data) {
        return {
            handler: 'result-formatter',
            capability: 'format',
            result: {
                status: 'error',
                message: '缺少格式化数据'
            }
        };
    }
    return {
        handler: 'result-formatter',
        capability: 'format',
        result: {
            status: 'success',
            message: '格式化成功',
            formatted_data: {
                userId: inputData.data.id,
                userName: inputData.data.name,
                userEmail: inputData.data.email,
                sessionId: inputData.data.sid
            }
        }
    };
}));
// 将Handler注册到Agent
console.log('\n=== 注册Handler到Agent ===');
agent.addHandler(paramValidatorHandler);
agent.addHandler(dbQueryHandler);
agent.addHandler(resultFormatterHandler);
// 验证Handler注册
const allHandlers = agent.getAllHandlers();
let handlerCount = 0;
allHandlers.forEach(typeMap => {
    handlerCount += typeMap.size;
});
console.log(`注册的Handler数量: ${handlerCount}`);
// 遍历所有Handler
let index = 1;
allHandlers.forEach((typeMap, type) => {
    typeMap.forEach(handler => {
        console.log(`${index}. ${handler.handler} (${type})`);
        index++;
    });
});
// 3. 创建工作流定义和实例
console.log('\n=== 创建工作流 ===');
// 创建工作流定义
const workflowDef = new workflow_1.Workflow();
workflowDef.id = 'wf-get-user-by-sid';
workflowDef.wfname = '通过Session ID获取用户信息';
workflowDef.version = '1.0';
workflowDef.state = 'active';
workflowDef.description = '通过Session ID查询用户信息的工作流';
// 定义工作流结构
const workflowSchema = {
    tasks: [
        {
            id: 'task-validate',
            name: '参数验证',
            handler: 'param-validator',
            input_data: {},
            transitions: {
                'success': {
                    condition: null,
                    task_id: 'task-query'
                }
            }
        },
        {
            id: 'task-query',
            name: '数据库查询',
            handler: 'db-query',
            input_data: {},
            transitions: {
                'success': {
                    condition: null,
                    task_id: 'task-format'
                }
            }
        },
        {
            id: 'task-format',
            name: '结果格式化',
            handler: 'result-formatter',
            input_data: {},
            transitions: {}
        }
    ]
};
// 设置工作流结构
workflowDef.setFlowSchema(workflowSchema);
// 4. 执行工作流
console.log('\n=== 执行工作流 ===');
// 设置工作流输入数据
workflowDef.inputdata = JSON.stringify({ sid: 'session-123' });
// 执行工作流
(() => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const result = yield workflowDef.execute(agent);
    console.log('\n=== 工作流执行结果 ===');
    console.log('执行状态:', result);
    console.log('工作流状态:', workflowDef.get_status());
    console.log('任务执行结果:', JSON.stringify(workflowDef.get_task_results(), null, 2));
    // 测试失败情况
    console.log('\n=== 测试失败情况 ===');
    const workflowDef2 = new workflow_1.Workflow();
    workflowDef2.id = 'wf-fail-example';
    workflowDef2.wfname = '失败测试工作流';
    workflowDef2.state = 'active';
    workflowDef2.inputdata = JSON.stringify({}); // 缺少必要参数
    workflowDef2.setFlowSchema(workflowSchema);
    const result2 = yield workflowDef2.execute(agent);
    console.log('执行状态:', result2);
    console.log('工作流状态:', workflowDef2.get_status());
    console.log('任务执行结果:', JSON.stringify(workflowDef2.get_task_results(), null, 2));
}))();
//# sourceMappingURL=workflow-system-example.js.map