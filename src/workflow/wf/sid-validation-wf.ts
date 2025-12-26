import { UpInfoAgent } from '../agents/upinfo-agent';
import { AuthServiceAgent } from '../agents/auth-service-agent';
import { ConfigAgent } from '../agents/config-agent';
import { TsLog78 } from 'tslog78';

const log = TsLog78.Instance;

export class SidValidationWorkflow {
  private upInfoAgent: UpInfoAgent;
  private authServiceAgent: AuthServiceAgent;
  private configAgent: ConfigAgent;
  private workflowName: string;
  
  constructor(
    upInfoAgent: UpInfoAgent, 
    authServiceAgent: AuthServiceAgent,
    configAgent: ConfigAgent,
    workflowName: string = 'SID Validation Workflow'
  ) {
    this.upInfoAgent = upInfoAgent;
    this.authServiceAgent = authServiceAgent;
    this.configAgent = configAgent;
    this.workflowName = workflowName;
  }
  
  async execute(cols: string[], dbname: string = 'default'): Promise<any> {
    log.info(`开始执行工作流: ${this.workflowName}`);
    
    try {
      // 使用真实的upcheck方法
      log.info('执行SID验证...');
      const result = await this.authServiceAgent.upcheck(this.upInfoAgent, cols, dbname);
      
      log.info('SID验证成功', result);
      
      return {
        success: true,
        message: 'SID验证工作流执行成功',
        sid: this.upInfoAgent.sid,
        uid: this.upInfoAgent.uid,
        uname: this.upInfoAgent.uname
      };
    } catch (error) {
      log.error(`工作流执行失败: ${this.workflowName}`, error);
      throw error;
    }
  }
}