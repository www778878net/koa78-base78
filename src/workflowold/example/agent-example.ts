// Agent和Handler使用示例
import { Agent } from '../../workflow/base/agent';
import { Handler } from '../../workflow/base/handler';

// 创建Agent实例
const agent = new Agent({
    id: 'agent-001',
    agentname: '测试代理',
    maxcopy: 5,
    state: 'active'
});

// 创建处理器实例 - 参数验证器
const paramValidatorHandler = new Handler({
    id: 'handler-001',
    handler: 'param-validator',
    capability: 'validate',
    state: 'active',
    type: 'validator' // 添加type属性
});

// 创建处理器实例 - 数据库查询
const dbQueryHandler = new Handler({
    id: 'handler-002',
    handler: 'db-query',
    capability: 'query',
    state: 'active',
    type: 'query' // 添加type属性
});

// 设置参数验证器的回调函数
paramValidatorHandler.setCallback(async (result, params) => {
    console.log('参数验证器回调被调用');
    console.log('传入参数:', params);

    // 简单的参数验证逻辑
    if (!params.sid) {
        return { status: 'error', message: '缺少必要参数sid' };
    }

    return { status: 'success', message: '参数验证通过', data: params };
});

// 设置数据库查询的回调函数
dbQueryHandler.setCallback(async (result, params) => {
    console.log('数据库查询回调被调用');
    console.log('传入参数:', params);

    // 模拟数据库查询
    const mockUser = {
        id: 'user-123',
        name: '张三',
        email: 'zhangsan@example.com',
        sid: params.sid
    };

    return { status: 'success', message: '查询成功', data: mockUser };
});

// 将处理器注册到Agent
agent.addHandler(paramValidatorHandler);
agent.addHandler(dbQueryHandler);

// 测试执行处理器的函数
async function testExecuteHandler() {
    console.log('=== 测试参数验证器 ===');
    try {
        // 测试成功的情况
        const validationResult = await agent.executeHandlerByCapability('validator', 'validate', { sid: 'session-123' });
        console.log('验证结果:', validationResult);

        // 测试失败的情况
        const invalidResult = await agent.executeHandlerByCapability('validator', 'validate', {});
        console.log('无效参数结果:', invalidResult);
    } catch (error) {
        console.error('验证错误:', error);
    }

    console.log('\n=== 测试数据库查询 ===');
    try {
        const queryResult = await agent.executeHandlerByCapability('query', 'query', { sid: 'session-123' });
        console.log('查询结果:', queryResult);
    } catch (error) {
        console.error('查询错误:', error);
    }

    console.log('\n=== 测试获取处理器 ===');
    // 根据类型获取处理器
    const validatorHandlers = agent.getHandlersByType('validator');
    console.log('验证类型处理器数量:', validatorHandlers ? validatorHandlers.size : 0);

    const queryHandlers = agent.getHandlersByType('query');
    console.log('查询类型处理器数量:', queryHandlers ? queryHandlers.size : 0);
}

// 运行测试
testExecuteHandler();