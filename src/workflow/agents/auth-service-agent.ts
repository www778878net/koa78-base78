import { Agent } from '../base/agent';
import { Config } from '../../config/Config';
import { TsLog78 } from 'tslog78';

const log = TsLog78.Instance;

export class AuthServiceAgent extends Agent {
    private static _CID_MY: string | null = null;
    public static readonly CID_GUEST: string = "GUEST000-8888-8888-8888-GUEST00GUEST";

    constructor() {
        super(); // 调用父类的构造函数
    }

    public static get CID_MY(): string {
        if (AuthServiceAgent._CID_MY === null) {
            AuthServiceAgent._CID_MY = AuthServiceAgent.getCidMyFromConfig();
        }
        return AuthServiceAgent._CID_MY;
    }

    private static getCidMyFromConfig(): string {
        try {
            // 检查全局容器是否存在
            const globalAny: any = global as any;
            if (globalAny.appContainer) {
                // 通过容器获取Config实例
                const config = globalAny.appContainer.get(Config);
                const cidMyFromConfig = config.get('cidmy');

                // 如果配置中有cidmy且不为空，则使用配置中的值
                if (cidMyFromConfig && typeof cidMyFromConfig === 'string' && cidMyFromConfig.length > 0) {
                    return cidMyFromConfig;
                }
            }
        } catch (error) {
            // 获取配置失败时使用默认值
            console.warn('Failed to get cidmy from config, using default value:', error);
        }

        // 默认值
        return "d4856531-e9d3-20f3-4c22-fe3c65fb009c";
    }
}