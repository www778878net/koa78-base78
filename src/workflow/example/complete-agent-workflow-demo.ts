import { UpInfoAgent } from '../agents/upinfo-agent';
import { AuthServiceAgent } from '../agents/auth-service-agent';
import { ConfigAgent } from '../agents/config-agent';
import { MysqlDatabaseAgent } from '../agents/mysql-database-agent';
import { CacheServiceAgent } from '../agents/cache-service-agent';
import { TsLog78 } from 'tslog78';
import UpInfo from 'koa78-upinfo';

const log = TsLog78.Instance;

async function runCompleteAgentWorkflowDemo() {
  console.log('\n=== 完整Agent工作流演示 ===\n');

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

  // 创建模拟的完整Koa上下文
  const mockCtx: any = {
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
      },
      fields: null,
      body: null,
      header: {
        'x-forwarded-for': '127.0.0.1',
        'v': '24',
        'uname': 'guest',
        'sid': 'GUEST888-8888-8888-8888-GUEST88GUEST',
        'cache': 'cache_value'
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

  // 执行完整的工作流步骤
  console.log('\n🚀 开始执行完整工作流...');
  console.log('='.repeat(50));

  try {
    // 1. 参数验证
    console.log('🔍 步骤1: 验证SID参数');
    if (!upInfoAgent.sid || upInfoAgent.sid.length < 32 || upInfoAgent.sid.length > 64) {
      throw new Error('SID参数验证失败');
    }
    console.log('✅ SID参数验证成功');

    // 2. 创建完整的UpInfo实例用于后续操作
    console.log('🔍 步骤2: 创建完整的UpInfo实例');
    const upInfo = new UpInfo(mockCtx);
    console.log('✅ UpInfo实例创建成功');

    // 3. 用户权限验证
    console.log('🔍 步骤3: 验证用户权限');
    const colsToCheck = ['id', 'uname', 'email', 'truename', 'mobile'];
    
    const authResult = await authServiceAgent.upcheck(upInfo, colsToCheck, 'default');
    console.log('✅ 用户权限验证成功:', authResult);

    // 4. 查询用户信息
    console.log('🔍 步骤4: 查询用户信息');
    const userInfoQuery = `
      SELECT l.id, l.uname, l.email, l.truename, l.mobile, la.sid_web, c.coname
      FROM lovers l
      JOIN lovers_auth la ON l.idpk = la.ikuser
      LEFT JOIN companys c ON l.idcodef = c.id
      WHERE l.id = ? AND la.sid = ?
    `;
    
    // 使用UpInfo实例进行查询
    const userInfo = await mysqlAgent.query(
      userInfoQuery,
      [upInfo.uid || upInfo.idpk, upInfo.sid],
      upInfo
    );
    console.log('✅ 用户信息查询成功:', userInfo);

    // 5. 缓存用户信息
    console.log('🔍 步骤5: 缓存用户信息');
    const cacheKey = `user_info_${upInfo.uid || upInfo.idpk}`;
    await cacheServiceAgent.tbset(cacheKey, userInfo, 3600); // 1小时过期
    console.log('✅ 用户信息缓存成功');

    console.log('\n' + '='.repeat(50));
    console.log('🎉 完整工作流执行成功');
    console.log('   最终结果:', {
      sid: upInfo.sid,
      uid: upInfo.uid,
      uname: upInfo.uname,
      userInfo: userInfo[0] || null
    });

    console.log('\n演示完成 - 所有Agent协同工作正常');

  } catch (error) {
    console.log('\n❌ 工作流执行失败:', error);
  }

  console.log('\n' + '='.repeat(60));
  console.log('🎬 完整Agent工作流演示完成');
  console.log('='.repeat(60));
}

// 主函数
async function main() {
  console.log('📦 完整Agent工作流演示程序启动');
  console.log('='.repeat(60));

  await runCompleteAgentWorkflowDemo();

  console.log('\n演示结束');
}

// 启动演示
main().catch(console.error);