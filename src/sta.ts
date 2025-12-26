// ConfigAgent环境变量加载测试
import { ConfigAgent } from './workflow/agents/config-agent';
import { TsLog78 } from 'tslog78';

const log = TsLog78.Instance;

// 测试ConfigAgent的环境变量加载功能
async function testConfigAgent() {
    log.info('=== 开始ConfigAgent环境变量加载测试 ===');

    try {
        // 创建ConfigAgent实例
        const configAgent = new ConfigAgent();

        // 显示当前环境变量
        log.info('当前NODE_ENV:', process.env.NODE_ENV);

        // 初始化配置（会加载环境变量）
        await configAgent.init();

        // 获取并显示加载的配置
        const config = configAgent.getAll();
        log.info('成功加载的配置:');
        log.info('端口:', configAgent.get('port'));
        log.info('数据库类型:', configAgent.get('dbtype'));
        log.info('MySQL配置:', config.mysql);
        log.info('Redis配置:', config.redis);

        // 检查是否成功加载了表配置
        if (config.tables && Object.keys(config.tables).length > 0) {
            log.info('表配置数量:', Object.keys(config.tables).length);
            log.info('表配置示例:', Object.keys(config.tables)[0]);
        } else {
            log.warn('未加载到表配置');
        }

        log.info('=== ConfigAgent环境变量加载测试成功 ===');

    } catch (error) {
        log.error('ConfigAgent测试失败:', error);
        return false;
    }

    return true;
}

// 运行测试
testConfigAgent();