// 工作流测试示例
import { Workflow } from '../base/workflow';
import { Task } from '../base/task';
import { Agent } from '../base/agent';
import { TsLog78 } from '../src/TsLog78';

const log = TsLog78.Instance;

// 创建一个简单的Agent用于执行任务
class SimpleAgent extends Agent {
    constructor() {
        super();
    }

    // 实现一个简单的处理函数
    public async processTask(task: Task): Promise<any> {
        log.info(`Agent执行任务: ${task.getName()}`);

        const inputData = task.getInput();
        const handler = task.handler;

        // 根据不同的handler执行不同的逻辑
        switch (handler) {
            case 'startTask':
                return { message: '工作流开始', result: 'success' };
            case 'processData':
                return { data: inputData, processed: true, value: inputData.value * 2 };
            case 'sendNotification':
                log.info(`发送通知: ${inputData.message}`);
                return { notificationSent: true };
            case 'errorHandler':
                log.error(`处理错误: ${inputData.error}`);
                return { errorHandled: true, message: '错误已处理' };
            default:
                log.warn(`未知的任务处理器: ${handler}`);
                return { result: 'unknown handler' };
        }
    }
}

// 创建并执行测试工作流
async function runWorkflowTest() {
    log.info('=== 开始工作流测试 ===');

    try {
        // 1. 创建工作流定义
        const workflowDefinition = {
            wfname: '测试工作流',
            description: '一个用于演示工作流基本功能的测试用例',
            version: '1.0.0',
            state: 'active',
            starttask: 'task1',
            // 定义工作流结构
            flowschema: JSON.stringify({
                tasks: [
                    {
                        id: 'task1',
                        name: '开始任务',
                        handler: 'startTask',
                        input_data: { value: 10 },
                        transitions: {
                            'task2': 'true'  // 无条件流转到task2
                        }
                    },
                    {
                        id: 'task2',
                        name: '处理数据',
                        handler: 'processData',
                        transitions: {
                            'task3': 'task_result.processed && task_result.value > 15',  // 条件流转
                            'errorTask': '!task_result.processed'
                        }
                    },
                    {
                        id: 'task3',
                        name: '发送通知',
                        handler: 'sendNotification',
                        input_data: { message: '数据处理完成' },
                        transitions: {}
                    },
                    {
                        id: 'errorTask',
                        name: '错误处理',
                        handler: 'errorHandler',
                        transitions: {}
                    }
                ]
            })
        };

        // 2. 创建工作流实例
        const workflow = new Workflow(workflowDefinition);

        // 3. 创建Agent实例
        const agent = new SimpleAgent();

        // 4. 执行工作流
        log.info('开始执行工作流...');
        const result = await workflow.execute(agent);

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
            flowschema: JSON.stringify({
                tasks: [
                    {
                        id: 'errorTestTask',
                        name: '触发错误的任务',
                        handler: 'nonExistentHandler',  // 不存在的处理器
                        transitions: {
                            'task2': 'true'
                        }
                    },
                    {
                        id: 'task2',
                        name: '正常任务',
                        handler: 'processData',
                        transitions: {}
                    }
                ]
            })
        };

        const errorWorkflow = new Workflow(errorWorkflowDefinition);
        const errorResult = await errorWorkflow.execute(agent);

        log.info(`错误测试工作流执行结果: ${errorResult}`);
        log.info('工作流状态:', errorWorkflow.status);
        log.info('错误信息:', errorWorkflow.errors);

    } catch (error) {
        log.error('工作流测试失败:', error);
    }

    log.info('=== 工作流测试结束 ===');
}

// 运行测试
runWorkflowTest();