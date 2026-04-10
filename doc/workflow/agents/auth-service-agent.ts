import UpInfo from '../../UpInfo';
import { Agent } from '../base/agent';
import { MysqlDatabaseAgent } from './mysql-database-agent';
import { CacheServiceAgent } from './cache-service-agent';
import { z } from 'zod';
import { Config } from '../../config/Config';
import { TsLog78 } from 'tslog78';

const log = TsLog78.Instance;

export class AuthServiceAgent extends Agent {
    private static _CID_MY: string | null = null;
    public static readonly CID_GUEST: string = "GUEST000-8888-8888-8888-GUEST00GUEST";
    private databaseAgent: MysqlDatabaseAgent | null = null;
    private cacheServiceAgent: CacheServiceAgent | null = null;

    constructor() {
        super(); // 调用父类的构造函数
    }

    // 初始化方法，用于设置依赖项
    public init(databaseAgent: MysqlDatabaseAgent, cacheServiceAgent: CacheServiceAgent): void {
        this.databaseAgent = databaseAgent;
        this.cacheServiceAgent = cacheServiceAgent;
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

    async upcheck(up: UpInfo | any, cols: string[], dbname: string): Promise<string> {
        if (up.errmsg === "ok") {
            return "ok";
        }

        const sidSchema = z.string().length(36);
        const bcidSchema = z.string().length(36).refine(val => val.indexOf("-") === 8 && val.indexOf("-", 19) === 23);
        const midSchema = z.string().length(36);
        const numericSchema = z.string().regex(/^\d+$/);
        //console.log(`upcheck sid: ${JSON.stringify(up)}`);

        try {
            sidSchema.parse(up.sid);
        } catch (error) {
            throw new Error(`sid 参数验证失败: ${up.sid}, ${(error as Error).message}`);
        }

        if (up.bcid) {
            try {
                bcidSchema.parse(up.bcid);
            } catch (error) {
                throw new Error(`bcid 参数验证失败: ${up.bcid}, ${(error as Error).message}`);
            }
        }

        try {
            midSchema.parse(up.mid);
        } catch (error) {
            throw new Error(`mid 参数验证失败: ${up.mid}, ${(error as Error).message}`);
        }

        try {
            numericSchema.parse(up.getstart.toString());
        } catch (error) {
            throw new Error(`getstart 参数验证失败: ${up.getstart}, ${(error as Error).message}`);
        }

        try {
            numericSchema.parse(up.getnumber.toString());
        } catch (error) {
            throw new Error(`getnumber 参数验证失败: ${up.getnumber}, ${(error as Error).message}`);
        }

        if (!up.inOrder(cols)) {
            throw new Error("up order err:" + up.order);
        }

        const checkColsResult = up.checkCols(cols);
        if (checkColsResult !== "checkcolsallok") {
            throw new Error("checkCols err:" + checkColsResult + JSON.stringify(up.cols));
        }

        if (!up.cols || up.cols.length === 0 || (up.cols.length === 1 && (up.cols[0] === "all" || up.cols[0] === "")))
            up.cols = cols;

        let mem_sid = "lovers_sid2_";
        // 使用CacheServiceAgent
        let tmp = await this.cacheServiceAgent?.tbget(mem_sid + dbname + up.sid, up.debug) || null;

        if (tmp === "pool null") tmp = "";

        if (!tmp) {
            let cmdtext = `
                SELECT l.*, la.sid_web_date, la.sid, la.sid_web, c.coname, c.uid as idceo, c.id as cid 
                FROM lovers l
                JOIN lovers_auth la ON l.idpk = la.ikuser
                LEFT JOIN companysuser cu ON cu.uid = l.id AND cu.cid = l.idcodef
                LEFT JOIN companys c ON l.idcodef = c.id
                WHERE la.sid = ? OR la.sid_web = ?
            `;
            if (dbname != "default")
                cmdtext = "select t1.* ,companys.coname,companys.uid as idceo,companys.id as cid  from    (SELECT uname,pwd,id,upby,uptime,sid_web_date,  " +
                    "  idcoDef,openweixin ,truename,idpk   FROM lovers Where sid=? or sid_web=?)as t1 LEFT JOIN `companysuser` as t2 on" +
                    " t2.uid=t1.id and t2.cid=t1.idcodef left join companys    on t2.cid=companys.id";
            const values = [up.sid, up.sid];
            // 使用MysqlDatabaseAgent
            const result = await this.databaseAgent?.query(cmdtext, values, up, dbname) || [];
            console.log("upcheck result:", result);
            if (result?.length === 0) tmp = "";
            else {
                tmp = result[0];
                await this.cacheServiceAgent?.tbset(mem_sid + dbname + up.sid, tmp);
            }
        }

        if (tmp) {
            up.uid = tmp["id"];
            up.uname = tmp["uname"];
            up.cid = tmp["cid"] || tmp["id"];  // 当 cid 为 null 时使用 uid (id) 作为后备值
            up.coname = tmp["coname"];
            up.idceo = tmp["idceo"];
            up.weixin = tmp["openweixin"];
            up.truename = tmp["truename"];
            up.idpk = tmp["idpk"];
            up.mobile = tmp["mobile"];


            if (up.uname === "sysadmin") {
                up.debug = true;
            }


            up.bcid = up.bcid || up.cid;
            up.errmsg = "ok";

            return "ok";
        } else {
            throw new Error("err:get u info err3" + dbname + " " + up.sid);
        }
    }

    async preventReplayAttack(up: UpInfo): Promise<void> {
        const cacheKey = up.ctx.request.path + up.cache;
        const existingCache = await this.cacheServiceAgent?.get(cacheKey) || null;
        if (existingCache) {
            throw new Error("防止重放攻击" + cacheKey);
        }
        await this.cacheServiceAgent?.set(cacheKey, 1, 2);
    }
}