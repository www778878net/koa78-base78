"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
// 工作流测试示例
const workflow_1 = require("../base/workflow");
const agent_1 = require("../base/agent");
const tslog78_1 = require("tslog78");
const log = tslog78_1.TsLog78.Instance;
// 创建一个简单的Agent用于执行任务
class SimpleAgent extends agent_1.Agent {
    constructor() {
        super();
        // 注册处理器
        this.registerHandler({
            type: 'task',
            capability: 'startTask',
            execute: (params) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                log.info('执行开始任务，输入参数:', params);
                return Object.assign({ message: '工作流开始', result: 'success' }, params);
            })
        });
        this.registerHandler({
            type: 'task',
            capability: 'processData',
            execute: (params) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                log.info('执行数据处理任务，输入参数:', params);
                return { data: params, processed: true, value: (params.value || 0) * 2 };
            })
        });
        this.registerHandler({
            type: 'task',
            capability: 'sendNotification',
            execute: (params) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                log.info(`发送通知: ${params.message}`);
                return { notificationSent: true };
            })
        });
        this.registerHandler({
            type: 'task',
            capability: 'errorHandler',
            execute: (params) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                log.error(`处理错误: ${params.error}`);
                return { errorHandled: true, message: '错误已处理' };
            })
        });
        this.registerHandler({
            type: 'task',
            capability: 'nonExistentHandler',
            execute: (params) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                log.info('执行不存在的处理器任务，输入参数:', params);
                return Object.assign({ message: '处理器不存在但已处理', result: 'success' }, params);
            })
        });
    }
}
// 创建并执行测试工作流
function runWorkflowTest() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        log.info('=== 开始工作流测试 ===');
        try {
            // 1. 创建工作流定义
            const workflowDefinition = {
                wfname: '测试工作流',
                description: '一个用于演示工作流基本功能的测试用例',
                version: '1.0.0',
                state: 'active',
                starttask: 'task1',
                // 添加工作流级别的输入数据
                inputdata: JSON.stringify({ workflowParam: 'test', globalValue: 100 }),
                // 定义工作流结构
                flowschema: JSON.stringify({
                    tasks: [
                        {
                            id: 'task1',
                            name: '开始任务',
                            handler: 'task:startTask',
                            input_data: { value: 10, taskParam: 'task1' },
                            transitions: {
                                'task2': { condition: 'task_result.result === "success"', task_id: 'task2' } // 修改条件表达式
                            }
                        },
                        {
                            id: 'task2',
                            name: '处理数据',
                            handler: 'task:processData',
                            transitions: {
                                'task3': { condition: 'task_result.processed && task_result.value > 15', task_id: 'task3' },
                                'errorTask': { condition: '!task_result.processed', task_id: 'errorTask' }
                            }
                        },
                        {
                            id: 'task3',
                            name: '发送通知',
                            handler: 'task:sendNotification',
                            input_data: { message: '数据处理完成' },
                            transitions: {}
                        },
                        {
                            id: 'errorTask',
                            name: '错误处理',
                            handler: 'task:errorHandler',
                            transitions: {}
                        }
                    ]
                })
            };
            // 2. 创建工作流实例
            const workflow = new workflow_1.Workflow(workflowDefinition);
            // 3. 创建Agent实例
            const agent = new SimpleAgent();
            // 4. 执行工作流
            log.info('开始执行工作流...');
            const result = yield workflow.execute(agent);
            // 5. 输出执行结果
            log.info(`工作流执行结果: ${result}`);
            log.info('工作流状态:', workflow.status);
            log.info('任务执行结果:', JSON.stringify(workflow.get_task_results(), null, 2));
            if (workflow.errors.length > 0) {
                log.error('执行过程中出现的错误:', workflow.errors);
            }
            // 6. 创建一个包含错误的测试用例
            log.info('\n=== 测试错误处理流程 ===');
            const errorWorkflowDefinition = {
                wfname: '错误处理测试工作流',
                description: '测试工作流错误处理功能',
                version: '1.0.0',
                state: 'active',
                starttask: 'errorTestTask',
                // 添加工作流级别的输入数据
                inputdata: JSON.stringify({ workflowParam: 'error-test', globalValue: 200 }),
                flowschema: JSON.stringify({
                    tasks: [
                        {
                            id: 'errorTestTask',
                            name: '触发错误的任务',
                            handler: 'task:nonExistentHandler',
                            input_data: { taskParam: 'errorTask', localValue: 50 },
                            transitions: {
                                'task2': { condition: 'task_result.result === "success"', task_id: 'task2' }
                            }
                        },
                        {
                            id: 'task2',
                            name: '正常任务',
                            handler: 'task:processData',
                            transitions: {}
                        }
                    ]
                })
            };
            const errorWorkflow = new workflow_1.Workflow(errorWorkflowDefinition);
            const errorResult = yield errorWorkflow.execute(agent);
            log.info(`错误测试工作流执行结果: ${errorResult}`);
            log.info('工作流状态:', errorWorkflow.status);
            log.info('错误信息:', errorWorkflow.errors);
        }
        catch (error) {
            log.error('工作流测试失败:', error);
        }
        log.info('=== 工作流测试结束 ===');
    });
}
// 运行测试
runWorkflowTest();
//# sourceMappingURL=workflow-test.js.map