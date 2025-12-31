// 工作流演示示例 - 展示完整的工作流执行流程和条件流转
import { Workflow } from '../../workflow/base/workflow';
import { Task } from '../../workflow/base/task';
import { Agent } from '../../workflow/base/agent';
import { Handler } from '../../workflow/base/handler';

// 模拟用户数据
const mockUsers = [
    { id: '1', username: 'alice', email: 'alice@example.com', status: 1 },
    { id: '2', username: 'bob', email: 'bob@example.com', status: 1 },
    { id: '3', username: 'charlie', email: 'charlie@example.com', status: 0 }
];

// 模拟数据库查询函数
async function mockDbQuery(query: string, params: any[]) {
    console.log(`  [数据库] 执行查询: ${query}`);
    console.log(`  [数据库] 参数: ${JSON.stringify(params)}`);

    // 模拟查询延迟
    await new Promise(resolve => setTimeout(resolve, 500));

    // 模拟用户查询结果
    if (query.includes('SELECT') && query.includes('users')) {
        const userId = params[0];
        return mockUsers.filter(user => user.id === userId && user.status === 1);
    }

    return [];
}

// 演示工作流 - 用户信息查询流程
async function runUserQueryWorkflowDemo() {
    console.log('\n=== 工作流演示: 用户信息查询流程 ===\n');

    // 创建工作流实例
    const workflow = new Workflow({
        wfname: 'UserQueryWorkflow',
        version: '1.0.0',
        state: 'active',
        description: '演示用户信息查询的工作流',
        inputdata: JSON.stringify({ sid: 'test-sid-12345', requestId: 'req-67890' })
    });

    console.log(`📋 工作流信息`);
    console.log(`   名称: ${workflow.getName()}`);
    console.log(`   版本: ${workflow.getVersion()}`);
    console.log(`   状态: ${workflow.state}`);
    console.log(`   输入数据: ${workflow.inputdata}`);

    // 创建任务1: 参数验证
    const validateSidTask = new Task({
        id: 'validate-sid',
        taskname: '验证SID参数',
        state: 'pending',
        priority: 1
    });

    validateSidTask.taskFunction = async (input) => {
        console.log('\n🔍 执行任务: 验证SID参数');
        const { sid } = input;

        if (!sid) {
            throw new Error('SID参数不能为空');
        }

        if (typeof sid !== 'string' || sid.length < 10) {
            throw new Error('SID格式无效');
        }

        console.log(`   ✅ SID验证通过: ${sid}`);
        return { valid: true, sid, message: 'SID验证成功' };
    };

    // 创建任务2: SID转换为用户信息
    const convertSidTask = new Task({
        id: 'convert-sid-to-user',
        taskname: 'SID转换为用户信息',
        state: 'pending',
        priority: 2
    });

    convertSidTask.taskFunction = async (input) => {
        console.log('\n🔄 执行任务: SID转换为用户信息');
        const { sid } = input;

        // 模拟SID转换逻辑
        await new Promise(resolve => setTimeout(resolve, 300));

        // 模拟转换结果
        const userInfo = {
            userId: '1',
            sid: sid,
            requestId: input.requestId,
            timestamp: new Date().toISOString()
        };

        console.log(`   ✅ SID转换完成: ${JSON.stringify(userInfo)}`);
        return userInfo;
    };

    // 创建任务3: 权限验证
    const validatePermissionTask = new Task({
        id: 'validate-permission',
        taskname: '验证用户权限',
        state: 'pending',
        priority: 3
    });

    validatePermissionTask.taskFunction = async (input) => {
        console.log('\n🛡️  执行任务: 验证用户权限');
        const { userId } = input;

        // 模拟权限验证逻辑
        await new Promise(resolve => setTimeout(resolve, 200));

        // 模拟权限检查结果
        const permissions = {
            readProfile: true,
            writeProfile: false,
            adminAccess: false
        };

        console.log(`   ✅ 权限验证完成: 用户ID=${userId}, 权限=${JSON.stringify(permissions)}`);
        return { userId, permissions, authorized: true };
    };

    // 创建任务4: 数据库查询
    const dbQueryTask = new Task({
        id: 'query-user-info',
        taskname: '查询用户信息',
        state: 'pending',
        priority: 4
    });

    dbQueryTask.taskFunction = async (input) => {
        console.log('\n🗄️  执行任务: 查询用户信息');
        const { userId } = input;

        // 使用模拟数据库查询
        const userData = await mockDbQuery(
            'SELECT id, username, email FROM users WHERE id = ? AND status = 1',
            [userId]
        );

        if (userData.length === 0) {
            throw new Error(`用户不存在: ${userId}`);
        }

        console.log(`   ✅ 查询完成: ${JSON.stringify(userData[0])}`);
        return userData[0];
    };

    // 创建任务5: 结果格式化
    const formatResultTask = new Task({
        id: 'format-result',
        taskname: '格式化结果',
        state: 'pending',
        priority: 5
    });

    formatResultTask.taskFunction = async (input) => {
        console.log('\n📝 执行任务: 格式化结果');

        // 格式化输出，排除敏感信息
        const formattedResult = {
            id: input.id,
            username: input.username,
            email: input.email,
            formattedAt: new Date().toISOString()
        };

        console.log(`   ✅ 结果格式化完成: ${JSON.stringify(formattedResult)}`);
        return formattedResult;
    };

    // 创建任务6: 错误处理
    const errorHandlerTask = new Task({
        id: 'error-handler',
        taskname: '错误处理',
        state: 'pending',
        priority: 10
    });

    errorHandlerTask.taskFunction = async (input) => {
        console.log('\n❌ 执行任务: 错误处理');
        console.log(`   错误信息: ${input.error}`);

        // 模拟错误日志记录
        await new Promise(resolve => setTimeout(resolve, 200));

        return {
            handled: true,
            error: input.error,
            timestamp: new Date().toISOString()
        };
    };

    // 添加任务到工作流
    workflow.add_task(validateSidTask);
    workflow.add_task(convertSidTask);
    workflow.add_task(validatePermissionTask);
    workflow.add_task(dbQueryTask);
    workflow.add_task(formatResultTask);
    workflow.add_task(errorHandlerTask);

    // 设置任务流转关系
    // 验证成功 → 转换SID (失败则终止)
    validateSidTask.nextTaskId = 'convert-sid-to-user';
    validateSidTask.nextTaskCondition = 'task_result.valid === true';

    // 转换成功 → 权限验证
    convertSidTask.nextTaskId = 'validate-permission';
    convertSidTask.nextTaskCondition = 'task_result.userId';

    // 权限验证通过 → 数据库查询
    validatePermissionTask.nextTaskId = 'query-user-info';
    validatePermissionTask.nextTaskCondition = 'task_result.authorized';

    // 查询成功 → 结果格式化
    dbQueryTask.nextTaskId = 'format-result';
    dbQueryTask.nextTaskCondition = 'task_result.id';

    console.log('\n📋 工作流任务列表');
    workflow.tasks.forEach((task, index) => {
        console.log(`   ${index + 1}. ${task.taskname} (ID: ${task.id}, 状态: ${task.state}, 优先级: ${task.priority})`);
    });

    // 执行工作流
    console.log('\n🚀 开始执行工作流...');
    console.log('='.repeat(50));

    try {
        const result = await workflow.execute();

        console.log('\n' + '='.repeat(50));
        console.log(`🎉 工作流执行完成`);
        console.log(`   结果状态: ${result}`);
        console.log(`   执行状态: ${workflow.status}`);

        if (workflow.status === 'completed') {
            console.log('\n📊 工作流执行结果');
            console.log('   任务执行结果:');
            for (const [taskId, taskResult] of Object.entries(workflow.task_results)) {
                const task = workflow.tasks.find(t => t.id === taskId);
                if (task) {
                    console.log(`   - ${task.taskname}: ${taskResult ? '✅ 成功' : '❌ 失败'}`);
                }
            }

            console.log('\n📤 最终输出数据');
            console.log(JSON.stringify(JSON.parse(workflow.outputdata), null, 2));
        } else {
            console.log('\n❌ 工作流执行失败');
            console.log('   错误信息:', workflow.errors);
        }

    } catch (error) {
        console.log('\n' + '='.repeat(50));
        console.log('❌ 工作流执行出错:', error);
    }
}

// 演示带Agent的工作流
async function runAgentWorkflowDemo() {
    console.log('\n\n' + '='.repeat(60));
    console.log('=== 工作流演示: 带Agent的工作流执行 ===');
    console.log('='.repeat(60));

    // 创建Agent
    const agent = new Agent({
        agentname: 'UserServiceAgent',
        description: '用户服务Agent',
        state: 'active',
        maxcopy: 5
    });

    // 创建用户查询处理器
    const userQueryHandler = new Handler({
        type: 'user',
        capability: 'query',
        description: '用户查询处理器',
        state: 'active'
    });

    // 设置处理器逻辑
    userQueryHandler.setCallback(async (params) => {
        console.log('\n🤖 Agent处理器执行: 用户查询');
        console.log(`   参数: ${JSON.stringify(params)}`);

        // 模拟用户查询
        await new Promise(resolve => setTimeout(resolve, 400));

        const { userId } = params;
        const user = mockUsers.find(u => u.id === userId);

        if (!user) {
            return { success: false, error: `用户不存在: ${userId}` };
        }

        console.log(`   ✅ 查询成功: ${user.username}`);
        return {
            success: true,
            data: user,
            message: '用户查询成功'
        };
    });

    // 注册处理器到Agent
    agent.registerHandler(userQueryHandler);

    console.log(`\n🤖 创建Agent: ${agent.name}`);
    console.log(`   状态: ${agent.state}`);
    console.log(`   注册的处理器类型: ${Array.from(agent.getAllHandlers().keys()).join(', ')}`);

    // 创建工作流
    const agentWorkflow = new Workflow({
        wfname: 'AgentUserWorkflow',
        version: '1.0.0',
        state: 'active',
        inputdata: JSON.stringify({ userId: '1' })
    });

    // 创建使用Agent的任务
    const agentTask = new Task({
        id: 'agent-user-query',
        taskname: 'Agent用户查询',
        state: 'pending',
        handler: 'user:query'  // 使用格式: type:capability
    });

    // 添加任务到工作流
    agentWorkflow.add_task(agentTask);

    // 执行工作流
    console.log('\n🚀 开始执行带Agent的工作流...');
    console.log('='.repeat(50));

    try {
        const inputData = JSON.parse(agentWorkflow.inputdata);

        // 将输入数据设置到Agent任务
        agentTask.setInput(inputData);

        const result = await agentWorkflow.execute(agent);

        console.log('\n' + '='.repeat(50));
        console.log(`🎉 Agent工作流执行完成`);
        console.log(`   结果状态: ${result}`);
        console.log(`   执行状态: ${agentWorkflow.status}`);

        if (agentWorkflow.status === 'completed') {
            console.log('\n📊 Agent工作流结果');
            console.log(JSON.stringify(JSON.parse(agentWorkflow.outputdata), null, 2));
        }

    } catch (error) {
        console.log('\n' + '='.repeat(50));
        console.log('❌ Agent工作流执行出错:', error);
    }
}

// 主函数
async function main() {
    console.log('📦 工作流演示程序启动');
    console.log('='.repeat(60));

    // 执行工作流演示
    await runUserQueryWorkflowDemo();

    // 执行带Agent的工作流演示
    await runAgentWorkflowDemo();

    console.log('\n' + '='.repeat(60));
    console.log('🎬 所有演示完成');
    console.log('='.repeat(60));
}

// 启动演示
main().catch(console.error);