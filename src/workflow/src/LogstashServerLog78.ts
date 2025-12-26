import axios from 'axios';
import IServerLog78 from "./IServerLog78";
import LogEntry from './LogEntry';
import TsLog78 from './TsLog78';

export default class LogstashServerLog78 implements IServerLog78 {
    serverUrl: string;
    private logger: TsLog78;

    constructor(serverUrl: string, levelFile: number = 50) {
        this.serverUrl = serverUrl;
        this.logger = new TsLog78();
        this.logger.setupLevel(levelFile,levelFile,99999);
     
    }

    async logToServer(logEntry: LogEntry): Promise<Response> {
        try {
            const jsonContent = logEntry.toJson();
            const response = await axios.post(this.serverUrl, jsonContent, {
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.status >= 200 && response.status < 300) {
                await this.logger.debugEntry(new LogEntry({
                    basic: {
                        summary: "Logstash log sent successfully",
                        message: "Logstash Success",
                        logLevel: "DEBUG",
                        logLevelNumber: 10,
                        timestamp: new Date()
                    }
                }));
            } else {
                const errorMessage = `Failed to send log to Logstash. Status code: ${response.status}`;
                await this.logger.errorEntry(new LogEntry({
                    basic: {
                        summary: errorMessage,
                        message: "Logstash Error",
                        logLevel: "ERROR",
                        logLevelNumber: 60,
                        timestamp: new Date()
                    }
                }));
                throw new Error(errorMessage);
            }

            return new Response(JSON.stringify(response.data), {
                status: response.status,
                statusText: response.statusText,
                headers: response.headers as any
            });
        } catch (ex: unknown) {
            const errorMessage = `Error sending log to Logstash: ${ex instanceof Error ? ex.message : 'Unknown error'}`;
            await this.logger.errorEntry(new LogEntry({
                basic: {
                    summary: errorMessage,
                    message: "Logstash Exception",
                    logLevel: "ERROR",
                    logLevelNumber: 60,
                    timestamp: new Date()
                },
                error: {
                    errorType: ex instanceof Error ? ex.name : 'Unknown',
                    errorMessage: ex instanceof Error ? ex.message : 'Unknown error',
                    errorStackTrace: ex instanceof Error ? ex.stack : undefined
                }
            }));
            throw ex;
        }
    }
}