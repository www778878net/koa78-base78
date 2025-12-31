"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
// 简单工作流测试示例
const workflow_1 = require("../../workflow/base/workflow");
const task_1 = require("../../workflow/base/task");
const agent_1 = require("../../workflow/base/agent");
const handler_1 = require("../../workflow/base/handler");
// 创建一个简单的工作流
function runSimpleWorkflow() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        console.log('=== 简单工作流测试 ===\n');
        // 创建工作流实例
        const workflow = new workflow_1.Workflow({
            wfname: 'SimpleTestWorkflow',
            version: '1.0',
            state: 'active',
            flowschema: JSON.stringify({
                tasks: [
                    { id: 'task1', taskname: '任务1', handler: '', next_tasks: ['task2'] },
                    { id: 'task2', taskname: '任务2', handler: '', next_tasks: ['task3'] },
                    { id: 'task3', taskname: '任务3', handler: '', next_tasks: [] }
                ]
            })
        });
        console.log(`创建工作流: ${workflow.getName()} (版本: ${workflow.getVersion()})`);
        console.log(`工作流状态: ${workflow.state}`);
        // 创建任务实例
        const task1 = new task_1.Task({
            id: 'task1',
            taskname: '任务1',
            state: 'pending',
            priority: 1
        });
        const task2 = new task_1.Task({
            id: 'task2',
            taskname: '任务2',
            state: 'pending',
            priority: 2
        });
        const task3 = new task_1.Task({
            id: 'task3',
            taskname: '任务3',
            state: 'pending',
            priority: 3
        });
        // 为任务添加执行函数
        task1.taskFunction = (input) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            console.log('  执行任务1...');
            return { result: '任务1完成', value: 100 };
        });
        task2.taskFunction = (input) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            console.log('  执行任务2...');
            return { result: '任务2完成', value: 200 };
        });
        task3.taskFunction = (input) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            console.log('  执行任务3...');
            return { result: '任务3完成', value: 300 };
        });
        // 添加任务到工作流
        workflow.add_task(task1);
        workflow.add_task(task2);
        workflow.add_task(task3);
        // 设置任务流转
        task1.nextTaskId = 'task2';
        task1.nextTaskCondition = null;
        task2.nextTaskId = 'task3';
        task2.nextTaskCondition = null;
        console.log(`\n工作流任务数量: ${workflow.tasks.length}`);
        console.log('任务列表:', workflow.tasks.map(t => t.taskname));
        // 执行工作流
        console.log('\n开始执行工作流...');
        const result = yield workflow.execute();
        console.log(`\n工作流执行结果: ${result}`);
        console.log('任务执行结果:', JSON.stringify(workflow.task_results, null, 2));
        console.log('工作流输出数据:', workflow.outputdata);
        return result;
    });
}
// 执行带Agent的工作流
function runWorkflowWithAgent() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        console.log('\n\n=== 带Agent的工作流测试 ===\n');
        // 创建Agent
        const agent = new agent_1.Agent({
            agentname: 'TestAgent',
            description: '测试Agent',
            state: 'active',
            maxcopy: 5
        });
        // 创建Handler
        const testHandler = new handler_1.Handler({
            type: 'test',
            capability: 'process',
            description: '测试处理器',
            state: 'active'
        });
        // 设置处理器执行函数
        testHandler.setCallback((params) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            console.log('  处理器执行:', params);
            return {
                success: true,
                data: params,
                message: `处理完成: ${params.action}`
            };
        }));
        // 注册处理器到Agent
        agent.registerHandler(testHandler);
        console.log(`创建Agent: ${agent.name}`);
        console.log(`Agent状态: ${agent.state}`);
        console.log(`注册的处理器: ${Array.from(agent.getAllHandlers().keys()).join(', ')}`);
        // 创建工作流
        const workflow = new workflow_1.Workflow({
            wfname: 'WorkflowWithAgent',
            version: '1.0',
            state: 'active'
        });
        // 创建使用Agent处理器的任务
        const agentTask = new task_1.Task({
            id: 'agent_task',
            taskname: 'Agent任务',
            state: 'pending',
            handler: 'test:process' // 使用"type:capability"格式
        });
        // 添加任务到工作流
        workflow.add_task(agentTask);
        console.log(`\n创建工作流: ${workflow.getName()}`);
        console.log(`任务: ${agentTask.taskname}, Handler: ${agentTask.handler}`);
        // 执行工作流
        console.log('\n开始执行带Agent的工作流...');
        const result = yield workflow.execute(agent);
        console.log(`\n工作流执行结果: ${result}`);
        console.log('任务执行结果:', JSON.stringify(workflow.task_results, null, 2));
        return result;
    });
}
// 运行所有测试
function main() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        try {
            // 运行简单工作流
            const result1 = yield runSimpleWorkflow();
            console.log(`\n简单工作流测试${result1 === 'completed' ? '成功' : '失败'}`);
            // 运行带Agent的工作流
            const result2 = yield runWorkflowWithAgent();
            console.log(`\n带Agent的工作流测试${result2 === 'completed' ? '成功' : '失败'}`);
            console.log('\n=== 所有测试完成 ===');
        }
        catch (error) {
            console.error('测试过程中发生错误:', error);
        }
    });
}
// 执行主函数
main();
//# sourceMappingURL=simple-workflow-demo.js.map