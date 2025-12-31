"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
// 条件工作流示例
const agent_1 = require("../base/agent");
const handler_1 = require("../base/handler");
const workflow_1 = require("../base/workflow");
// 创建Agent实例
const agent = new agent_1.Agent();
// 1. 定义工作流处理函数
// 数据校验Handler
const dataValidationHandler = new handler_1.Handler();
dataValidationHandler.name = 'data-validation';
dataValidationHandler.type = 'validator';
dataValidationHandler.capability = 'validate';
dataValidationHandler.state = 'active';
dataValidationHandler.setCallback((inputData) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    console.log('数据校验回调被调用');
    console.log('输入数据:', inputData);
    // 验证基本字段
    const validations = {
        hasName: !!inputData.name,
        hasAge: !!inputData.age,
        ageValid: typeof inputData.age === 'number' && inputData.age >= 0
    };
    return {
        handler: 'data-validation',
        capability: 'validate',
        result: {
            status: 'success',
            message: '数据校验完成',
            data: Object.assign(Object.assign({}, inputData), { validations })
        }
    };
}));
// 成人处理Handler
const adultHandler = new handler_1.Handler();
adultHandler.name = 'adult-handler';
adultHandler.type = 'action';
adultHandler.capability = 'process';
adultHandler.state = 'active';
adultHandler.setCallback((inputData) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    console.log('成人处理回调被调用');
    console.log('输入数据:', inputData);
    return {
        handler: 'adult-handler',
        capability: 'process',
        result: {
            status: 'success',
            message: '成人处理完成',
            data: Object.assign(Object.assign({}, inputData), { category: 'adult', accessLevel: 'full' })
        }
    };
}));
// 儿童处理Handler
const childHandler = new handler_1.Handler();
childHandler.name = 'child-handler';
childHandler.type = 'action';
childHandler.capability = 'process';
childHandler.state = 'active';
childHandler.setCallback((inputData) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    console.log('儿童处理回调被调用');
    console.log('输入数据:', inputData);
    return {
        handler: 'child-handler',
        capability: 'process',
        result: {
            status: 'success',
            message: '儿童处理完成',
            data: Object.assign(Object.assign({}, inputData), { category: 'child', accessLevel: 'restricted', needsParentalConsent: true })
        }
    };
}));
// 结果合并Handler
const resultMergeHandler = new handler_1.Handler();
resultMergeHandler.name = 'result-merge';
resultMergeHandler.type = 'formatter';
resultMergeHandler.capability = 'merge';
resultMergeHandler.state = 'active';
resultMergeHandler.setCallback((inputData) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    console.log('结果合并回调被调用');
    console.log('输入数据:', inputData);
    return {
        handler: 'result-merge',
        capability: 'merge',
        result: {
            status: 'success',
            message: '结果合并完成',
            finalResult: Object.assign(Object.assign({}, inputData), { processed: true, timestamp: new Date().toISOString() })
        }
    };
}));
// 注册所有Handler到Agent
agent.addHandler(dataValidationHandler);
agent.addHandler(adultHandler);
agent.addHandler(childHandler);
agent.addHandler(resultMergeHandler);
// 2. 定义条件工作流结构
const conditionalWorkflowSchema = {
    tasks: [
        {
            id: 'task-validate',
            name: '数据校验',
            handler: 'data-validation',
            input_data: {},
            transitions: {
                'to-adult': {
                    condition: 'task_result.result.data.age >= 18',
                    task_id: 'task-adult'
                },
                'to-child': {
                    condition: 'task_result.result.data.age < 18',
                    task_id: 'task-child'
                }
            }
        },
        {
            id: 'task-adult',
            name: '成人处理流程',
            handler: 'adult-handler',
            input_data: {},
            transitions: {
                'to-merge': {
                    condition: null,
                    task_id: 'task-merge'
                }
            }
        },
        {
            id: 'task-child',
            name: '儿童处理流程',
            handler: 'child-handler',
            input_data: {},
            transitions: {
                'to-merge': {
                    condition: null,
                    task_id: 'task-merge'
                }
            }
        },
        {
            id: 'task-merge',
            name: '结果合并',
            handler: 'result-merge',
            input_data: {},
            transitions: {}
        }
    ]
};
// 3. 创建工作流实例并执行
function runWorkflowTest(userData) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        console.log('\n========================================');
        console.log(`测试用户数据:`, userData);
        console.log('========================================');
        // 4. 创建工作流实例
        const workflow = new workflow_1.Workflow();
        workflow.id = `wf-${Date.now()}`;
        workflow.wfname = '条件流转工作流';
        workflow.state = 'active';
        workflow.inputdata = JSON.stringify(userData);
        workflow.setFlowSchema(conditionalWorkflowSchema);
        // 执行工作流
        const result = yield workflow.execute(agent);
        console.log('\n=== 工作流执行结果 ===');
        console.log('执行状态:', result);
        console.log('工作流状态:', JSON.stringify(workflow.get_status(), null, 2));
        console.log('任务执行结果:', JSON.stringify(workflow.get_task_results(), null, 2));
        // 获取最终结果
        const finalResult = Object.values(workflow.get_task_results())
            .filter(result => { var _a; return (_a = result === null || result === void 0 ? void 0 : result.result) === null || _a === void 0 ? void 0 : _a.finalResult; })
            .map(result => result.result.finalResult)[0];
        if (finalResult) {
            console.log('\n=== 最终处理结果 ===');
            console.log('用户:', finalResult.name);
            console.log('年龄:', finalResult.age);
            console.log('类别:', finalResult.category);
            console.log('访问级别:', finalResult.accessLevel);
            if (finalResult.needsParentalConsent) {
                console.log('需要家长同意:', finalResult.needsParentalConsent);
            }
        }
        return result;
    });
}
// 4. 测试不同的条件分支
(() => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    // 测试成人分支
    yield runWorkflowTest({ name: '张三', age: 25 });
    // 测试儿童分支
    yield runWorkflowTest({ name: '李四', age: 12 });
    // 测试边界情况
    yield runWorkflowTest({ name: '王五', age: 18 });
}))();
//# sourceMappingURL=conditional-workflow-example.js.map