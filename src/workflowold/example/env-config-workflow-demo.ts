import { UpInfoAgent } from '../../workflow/agents/upinfo-agent';
import { AuthServiceAgent } from '../../workflow/agents/auth-service-agent';
import { ConfigAgent } from '../../workflow/agents/config-agent';
import { MysqlDatabaseAgent } from '../../workflow/agents/mysql-database-agent';
import { CacheServiceAgent } from '../../workflow/agents/cache-service-agent';
import { SidValidationWorkflow } from '../wf/sid-validation-wf';
import { TsLog78 } from 'tslog78';

const log = TsLog78.Instance;

async function runEnvConfigWorkflowDemo() {
    console.log('\n=== 环境配置工作流演示 ===\n');

    // 创建配置Agent，将从环境变量和配置文件自动加载配置
    const configAgent = new ConfigAgent();
    console.log('✅ 配置Agent创建成功');
    console.log('   配置信息:', configAgent.getAll());

    // 创建MySQL数据库服务Agent，传入配置Agent
    const mysqlAgent = new MysqlDatabaseAgent(configAgent);
    await mysqlAgent.initializeConnection('default'); // 使用配置中的默认连接
    console.log('✅ MySQL数据库服务Agent创建并初始化成功');

    // 创建缓存服务Agent
    const cacheServiceAgent = new CacheServiceAgent();
    console.log('✅ 缓存服务Agent创建成功');

    // 创建模拟的Koa上下文
    const mockCtx = {
        params: {
            apiver: 'api/v1',
            apisys: 'user',
            apiobj: 'profile',
            apifun: 'get'
        },
        request: {
            method: 'GET',
            path: '/api/v1/user/profile/get',
            query: {
                sid: 'GUEST888-8888-8888-8888-GUEST88GUEST', // 使用数据库中存在的SID
                uname: 'guest'
            }
        }
    };

    // 创建UpInfoAgent
    const upInfoAgent = new UpInfoAgent(mockCtx);
    console.log('✅ UpInfoAgent创建成功');
    console.log('   SID:', upInfoAgent.sid);
    console.log('   用户名:', upInfoAgent.uname);

    // 创建AuthServiceAgent
    const authServiceAgent = new AuthServiceAgent();
    // 初始化AuthServiceAgent
    authServiceAgent.init(mysqlAgent, cacheServiceAgent);
    console.log('✅ 认证服务Agent创建并初始化成功');

    // 创建SID验证工作流
    const sidValidationWorkflow = new SidValidationWorkflow(
        upInfoAgent,
        authServiceAgent,
        configAgent
    );

    console.log('✅ SID验证工作流创建成功');
    console.log('   工作流名称:', sidValidationWorkflow.constructor.name);

    // 执行工作流
    console.log('\n🚀 开始执行SID验证工作流...');
    console.log('='.repeat(50));

    try {
        // 定义需要验证的列
        const colsToCheck = ['id', 'uname', 'email', 'created_at'];

        // 执行工作流
        const result = await sidValidationWorkflow.execute(colsToCheck);

        console.log('\n' + '='.repeat(50));
        console.log('🎉 工作流执行成功');
        console.log('   结果:', result);

        console.log('\n演示完成 - 所有Agent协同工作正常，使用环境配置');

    } catch (error) {
        console.log('\n❌ 工作流执行失败:', error);
    }

    console.log('\n' + '='.repeat(60));
    console.log('🎬 环境配置工作流演示完成');
    console.log('='.repeat(60));
}

// 主函数
async function main() {
    console.log('📦 环境配置工作流演示程序启动');
    console.log('='.repeat(60));

    await runEnvConfigWorkflowDemo();

    console.log('\n演示结束');
}

// 启动演示
main().catch(console.error);