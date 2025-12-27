// 条件流转工作流演示 - 测试更复杂的条件评估
import { Workflow } from '../../workflow/base/workflow';
import { Task } from '../../workflow/base/task';

async function runConditionalWorkflowDemo() {
    console.log('\n=== 条件流转工作流演示 ===\n');

    // 创建工作流实例
    const workflow = new Workflow({
        wfname: 'ConditionalWorkflow',
        version: '1.0.0',
        state: 'active',
        description: '演示条件流转的工作流',
        inputdata: JSON.stringify({ value: 10 })  // 改回大数值
    });

    // 任务1: 检查数值
    const checkValueTask = new Task({
        id: 'check-value',
        taskname: '检查数值',
        state: 'pending',
        priority: 1
    });

    checkValueTask.taskFunction = async (input) => {
        const { value } = input;
        console.log(`\n🔍 检查数值: ${value}`);

        if (value > 5) {
            return {
                value,
                isGreater: true,
                category: 'large'
            };
        } else {
            return {
                value,
                isGreater: false,
                category: 'small'
            };
        }
    };

    // 任务2: 大数值处理
    const largeValueTask = new Task({
        id: 'process-large',
        taskname: '处理大数值',
        state: 'pending',
        priority: 2
    });

    largeValueTask.taskFunction = async (input) => {
        console.log(`\n📈 处理大数值: ${input.value}`);
        return { ...input, processed: true, handler: 'large' };
    };

    // 任务3: 小数值处理
    const smallValueTask = new Task({
        id: 'process-small',
        taskname: '处理小数值',
        state: 'pending',
        priority: 2
    });

    smallValueTask.taskFunction = async (input) => {
        console.log(`\n📉 处理小数值: ${input.value}`);
        return { ...input, processed: true, handler: 'small' };
    };

    // 任务4: 平方计算
    const squareTask = new Task({
        id: 'calculate-square',
        taskname: '计算平方',
        state: 'pending',
        priority: 3
    });

    squareTask.taskFunction = async (input) => {
        console.log(`\n🔢 计算平方: ${input.value}² = ${input.value * input.value}`);
        return {
            ...input,
            squared: input.value * input.value
        };
    };

    // 任务5: 结果格式化
    const formatResultTask = new Task({
        id: 'format-result',
        taskname: '格式化结果',
        state: 'pending',
        priority: 4
    });

    formatResultTask.taskFunction = async (input) => {
        console.log(`\n📝 格式化结果: ${JSON.stringify(input)}`);
        return {
            original: input.value,
            processed: input.processed,
            handler: input.handler,
            squared: input.squared,
            category: input.category,
            timestamp: new Date().toISOString()
        };
    };

    // 添加任务到工作流
    workflow.add_task(checkValueTask);
    workflow.add_task(largeValueTask);
    workflow.add_task(smallValueTask);
    workflow.add_task(squareTask);
    workflow.add_task(formatResultTask);

    // 设置条件流转关系 - 新API只支持一个下一个任务
    // 重新设计逻辑：检查数值后直接处理，不再分支
    checkValueTask.nextTaskId = 'calculate-square';
    checkValueTask.nextTaskCondition = null;

    squareTask.nextTaskId = 'format-result';
    squareTask.nextTaskCondition = 'task_result.squared';

    // 将处理逻辑合并到检查任务中
    checkValueTask.taskFunction = async (input) => {
        const { value } = input;
        console.log(`\n🔍 检查数值: ${value}`);

        if (value > 5) {
            console.log(`📈 处理大数值: ${value}`);
            return {
                value,
                isGreater: true,
                category: 'large',
                processed: true,
                handler: 'large'
            };
        } else {
            console.log(`📉 处理小数值: ${value}`);
            return {
                value,
                isGreater: false,
                category: 'small',
                processed: true,
                handler: 'small'
            };
        }
    };

    console.log('📋 工作流任务列表');
    workflow.tasks.forEach((task, index) => {
        console.log(`   ${index + 1}. ${task.taskname} (ID: ${task.id})`);
    });

    console.log('\n🚀 开始执行条件流转工作流...');
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
        }
    } catch (error) {
        console.log('\n❌ 工作流执行出错:', error);
    }
}

// 主函数
async function main() {
    console.log('📦 条件流转工作流演示程序启动');
    console.log('='.repeat(60));

    await runConditionalWorkflowDemo();

    console.log('\n' + '='.repeat(60));
    console.log('🎬 条件流转演示完成');
    console.log('='.repeat(60));
}

// 启动演示
main().catch(console.error);