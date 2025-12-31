"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const upinfo_agent_1 = require("../../workflow/agents/upinfo-agent");
const auth_service_agent_1 = require("../../workflow/agents/auth-service-agent");
const config_agent_1 = require("../../workflow/agents/config-agent");
const tslog78_1 = require("tslog78");
const log = tslog78_1.TsLog78.Instance;
function runAgentWorkflowDemo() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        console.log('\n=== Agent工作流演示 ===\n');
        // 创建配置Agent
        const configAgent = new config_agent_1.ConfigAgent();
        configAgent.set('cidmy', 'd4856531-e9d3-20f3-4c22-fe3c65fb009c');
        console.log('✅ 配置Agent创建成功');
        console.log('   配置信息:', configAgent.getAll());
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
                    sid: 'A1B2C3D4-E5F6-7890-1234-567890ABCDEF',
                    uname: 'testuser'
                }
            }
        };
        // 创建UpInfoAgent
        const upInfoAgent = new upinfo_agent_1.UpInfoAgent(mockCtx);
        console.log('✅ UpInfoAgent创建成功');
        console.log('   SID:', upInfoAgent.sid);
        console.log('   用户名:', upInfoAgent.uname);
        // 创建AuthServiceAgent
        const authServiceAgent = new auth_service_agent_1.AuthServiceAgent();
        console.log('✅ 认证服务Agent创建成功');
        // 添加验证SID的处理器到AuthServiceAgent
        authServiceAgent.addHandler({
            type: 'validation',
            capability: 'sid-validation',
            execute: (params) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                console.log('执行SID验证任务...');
                const sid = params.sid;
                if (!sid || sid.length < 32) {
                    throw new Error('SID参数无效或缺失');
                }
                return {
                    valid: true,
                    sid: sid,
                    validatedAt: new Date().toISOString()
                };
            })
        });
        // 添加权限验证的处理器到AuthServiceAgent
        authServiceAgent.addHandler({
            type: 'validation',
            capability: 'permission-validation',
            execute: (params) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                console.log('执行权限验证任务...');
                const userId = params.userId;
                return {
                    authorized: true,
                    userId: userId,
                    permissions: ['read', 'write']
                };
            })
        });
        // 演示使用处理器
        console.log('\n🚀 开始执行Agent任务...');
        console.log('='.repeat(50));
        try {
            // 执行SID验证任务
            console.log('\n📝 执行SID验证任务...');
            const sidValidationResult = yield authServiceAgent.executeHandlerByCapability('validation', 'sid-validation', {
                sid: upInfoAgent.sid
            });
            console.log('   SID验证结果:', sidValidationResult);
            // 执行权限验证任务
            console.log('\n📝 执行权限验证任务...');
            const permissionResult = yield authServiceAgent.executeHandlerByCapability('validation', 'permission-validation', {
                userId: 'test_user'
            });
            console.log('   权限验证结果:', permissionResult);
            console.log('\n' + '='.repeat(50));
            console.log('🎉 Agent任务执行成功');
            // 检查各Agent的状态
            console.log('\n📊 Agent状态:');
            console.log('   ConfigAgent状态:', configAgent.get_status());
            console.log('   UpInfoAgent状态:', upInfoAgent.get_status());
            console.log('   AuthServiceAgent状态:', authServiceAgent.get_status());
        }
        catch (error) {
            console.log('\n❌ Agent任务执行失败:', error);
        }
        console.log('\n' + '='.repeat(60));
        console.log('🎬 Agent工作流演示完成');
        console.log('='.repeat(60));
    });
}
// 主函数
function main() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        console.log('📦 Agent工作流演示程序启动');
        console.log('='.repeat(60));
        yield runAgentWorkflowDemo();
        console.log('\n演示结束');
    });
}
// 启动演示
main().catch(console.error);
//# sourceMappingURL=agent-workflow-demo.js.map