"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
// 工作流测试，用于测试ConfigAgent的环境变量加载功能
const workflow_1 = require("./workflow/base/workflow");
const agent_1 = require("./workflow/base/agent");
const config_agent_1 = require("./workflow/agents/config-agent");
const tslog78_1 = require("tslog78");
const log = tslog78_1.TsLog78.Instance;
// 创建一个包含ConfigAgent测试的Agent
class ConfigTestAgent extends agent_1.Agent {
    constructor() {
        super();
        this.configAgent = new config_agent_1.ConfigAgent();
        // 注册处理器
        this.registerHandler({
            type: 'task',
            capability: 'initConfig',
            execute: (params) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                // 初始化配置（会加载环境变量）
                yield this.configAgent.init();
                log.info('ConfigAgent初始化完成');
                return { success: true, message: 'ConfigAgent初始化成功' };
            })
        });
        this.registerHandler({
            type: 'task',
            capability: 'getConfig',
            execute: (params) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                // 获取配置信息
                const config = this.configAgent.getAll();
                const port = this.configAgent.get('port');
                const dbType = this.configAgent.get('dbtype');
                log.info('获取到的配置:');
                log.info('端口:', port);
                log.info('数据库类型:', dbType);
                log.info('Redis配置:', config.redis);
                // 检查是否成功加载了表配置
                if (config.tables && Object.keys(config.tables).length > 0) {
                    log.info('表配置数量:', Object.keys(config.tables).length);
                    log.info('表配置示例:', Object.keys(config.tables)[0]);
                }
                else {
                    log.warn('未加载到表配置');
                }
                return {
                    success: true,
                    config: {
                        port,
                        dbType,
                        redis: config.redis,
                        tablesCount: config.tables ? Object.keys(config.tables).length : 0
                    }
                };
            })
        });
        this.registerHandler({
            type: 'task',
            capability: 'testEnvVar',
            execute: (params) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                // 测试环境变量是否正确加载
                const envConfig = this.configAgent.getAll();
                const env = process.env.NODE_ENV;
                log.info('当前环境:', env);
                log.info('配置文件位置:', envConfig.location);
                log.info('是否为开发环境配置:', envConfig.location.includes('development'));
                return {
                    success: true,
                    env: env,
                    configLocation: envConfig.location,
                    isDevConfig: envConfig.location.includes('development')
                };
            })
        });
    }
}
// 创建并执行测试工作流
function runWorkflowTest() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        log.info('=== 开始工作流测试 (ConfigAgent环境变量加载) ===');
        try {
            // 1. 创建工作流定义
            const workflowDefinition = {
                wfname: 'ConfigAgent测试工作流',
                description: '用于测试ConfigAgent环境变量加载功能的工作流',
                version: '1.0.0',
                state: 'active',
                starttask: 'initConfigTask',
                // 定义工作流结构
                flowschema: JSON.stringify({
                    tasks: [
                        {
                            id: 'initConfigTask',
                            name: '初始化ConfigAgent',
                            handler: 'task:initConfig',
                            transitions: {
                                'getConfigTask': 'task_result.success'
                            }
                        },
                        {
                            id: 'getConfigTask',
                            name: '获取配置信息',
                            handler: 'task:getConfig',
                            transitions: {
                                'testEnvTask': 'task_result.success'
                            }
                        },
                        {
                            id: 'testEnvTask',
                            name: '测试环境变量',
                            handler: 'task:testEnvVar',
                            transitions: {}
                        }
                    ]
                })
            };
            // 2. 创建工作流实例
            const workflow = new workflow_1.Workflow(workflowDefinition);
            // 3. 创建Agent实例
            const agent = new ConfigTestAgent();
            // 4. 执行工作流
            log.info('开始执行工作流...');
            const result = yield workflow.execute(agent);
            // 5. 输出执行结果
            log.info(`工作流执行结果: ${result}`);
            log.info('工作流状态:', workflow.status);
            log.info('任务执行结果:', JSON.stringify(workflow.get_task_results(), null, 2));
            if (workflow.errors.length > 0) {
                log.error('执行过程中出现的错误:', workflow.errors);
                return false;
            }
            log.info('=== 工作流测试 (ConfigAgent环境变量加载) 成功 ===');
            return true;
        }
        catch (error) {
            log.error('工作流测试失败:', error);
            return false;
        }
    });
}
// 运行测试
runWorkflowTest();
//# sourceMappingURL=sta.js.map