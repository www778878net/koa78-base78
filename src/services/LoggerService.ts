import { injectable } from 'inversify';
import { TsLog78, LogstashServerLog78, FileLog78, ConsoleLog78 } from "tslog78";
import { Config } from '../config/Config';

@injectable()
export default class LoggerService {
    private static instance: TsLog78;

    private static initLogger() {
        if (!LoggerService.instance) {
            const logstashConfig = Config.getInstance().get("logstash");
            const isDebug = Config.getInstance().get("isdebug");

            let serverLogger: LogstashServerLog78 | undefined;
            if (logstashConfig && logstashConfig.host && logstashConfig.port) {
                const serverUrl = `http://${logstashConfig.host}:${logstashConfig.port}`;
                serverLogger = new LogstashServerLog78(serverUrl);
            }
            console.log(`LoggerService initLogger`);
            LoggerService.instance = TsLog78.Instance;
            LoggerService.instance.setup(serverLogger, new FileLog78(), new ConsoleLog78());
            if (isDebug) {
                LoggerService.instance.setupLevel(20, 20, 50);
                LoggerService.instance.setupDetailFile("detail.log");
                LoggerService.instance.clearDetailLog();
            }
        }
    }

    public static getLogger(): TsLog78 {
        if (!LoggerService.instance) {
            LoggerService.initLogger();
        }
        return LoggerService.instance;
    }
}

export { LoggerService }

