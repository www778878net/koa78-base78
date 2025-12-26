import "reflect-metadata";

// Copyright 2024 frieda
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// src/TsLog78.ts

import FileLog78 from "./FileLog78";
import ConsoleLog78 from "./ConsoleLog78";
import IConsoleLog78 from "./IConsoleLog78";
import IFileLog78 from "./IFileLog78";
import IServerLog78 from "./IServerLog78";
import  LogEntry  from './LogEntry';
import { injectable } from "inversify";
import * as process from 'process';
import FileLogDetail from "./FileLogDetail";
import * as fs from 'fs';
import * as path from 'path';

/**
 * 日志类 
 *  */
@injectable()
export class TsLog78 {
  /** 用于存储需要调试的特定键 */
  private debugKind: Set<string> = new Set();

  /** 文件日志的最低级别 */
  private levelFile: number = 30;

  /** 控制台日志的最低级别 */
  private levelConsole: number = 60;

  /** API日志的最低级别 */
  private levelApi: number = 50;

  /** 服务器日志记录器 */
  private serverLogger?: IServerLog78;

  /** 控制台日志记录器 */
  private consoleLogger?: IConsoleLog78 = new ConsoleLog78();

  /** 文件日志记录器 */
  private fileLogger?: IFileLog78 = new FileLog78();

  /** 用于特定调试的日志条目 */
  public DebugEntry?: LogEntry;

  /** 单例实例 */
  private static instance?: TsLog78;

  /** 详细日志记录器 */
  private detailLogger?: IFileLog78;

  /**
   * 获取TsLog78的单例实例
   */
  public static get Instance(): TsLog78 {
    if (!TsLog78.instance) {
      TsLog78.instance = new TsLog78();
      TsLog78.instance.setup(undefined, new FileLog78(), new ConsoleLog78());
    }
    return TsLog78.instance;
  }


  constructor() {
    this.setEnvironment();
    // if (this.isDevMode) {
    //   this.setupDetailFile(); // 在开发模式下自动设置详细日志文件
    // }
  }

  /**
   * 设置运行环境并初始化相应的日志级别
   */
  private setEnvironment() {
    const env = process.env.NODE_ENV || 'production';
 
    this.setupLevelByEnv(env);
  }

  /**
   * 根据环境设置日志级别
   * @param env 环境名称
   */
  private setupLevelByEnv(env: string) {
    switch (env) {
      case 'development':
        this.setupLevel(20, 20, 50); // debug以上打印文件，debug以上打印控制台，warn以上打印API
        break;
      case 'test':
        this.setupLevel(20, 60, 50); // debug以上打印文件，error打印控制台，warn以上打印API
        break;
      default: // production
        this.setupLevel(30, 60, 50); // info以上打印文件，error打印控制台，warn以上打印API
    }
  }

  /**
   * 设置各种日志输出的级别
   * @param fileLevel 文件日志级别
   * @param consoleLevel 控制台日志级别
   * @param apiLevel API日志级别
   */
  public setupLevel(fileLevel: number, consoleLevel: number, apiLevel: number) {
    this.levelFile = fileLevel;
    this.levelConsole = consoleLevel;
    this.levelApi = apiLevel;
  }

  /**
   * 设置日志记录器
   * @param serverLogger 服务器日志记录器
   * @param fileLogger 文件日志记录器
   * @param consoleLogger 控制台日志记录器
   */
  public setup(serverLogger?: IServerLog78, fileLogger: IFileLog78 = new FileLog78(), consoleLogger: IConsoleLog78 = new ConsoleLog78()) {
    this.serverLogger = serverLogger;
    this.fileLogger = fileLogger;
    this.consoleLogger = consoleLogger;
  }

  /**
   * 克隆当前日志实例
   */
  public clone(): TsLog78 {
    const cloned = new TsLog78();
    cloned.serverLogger = this.serverLogger;
    cloned.fileLogger = this.fileLogger;
    cloned.consoleLogger = this.consoleLogger;
    cloned.levelApi = this.levelApi;
    cloned.levelConsole = this.levelConsole;
    cloned.levelFile = this.levelFile;
    return cloned;
  }

  /**
   * 处理日志条目并根据设置输出到相应的目标
   * @param logEntry 日志条目
   */
  private async processLog(logEntry: LogEntry): Promise<void> {
 

    if (!logEntry.basic) {
        await this.errorEntry(new LogEntry({ 
            basic: { 
                summary: "Error: LogEntry or LogEntry.basic is null",
                message: "Invalid log entry",
                logLevelNumber: 60, // ERROR level
                timestamp: new Date(),
                logLevel: "ERROR"
            } 
        }));
        return;
    }
   // 始终记录到详细日志文件，不受其他条件限制
   if (this.detailLogger) {
    this.detailLogger.logToFile(logEntry);
  }
    const isDebug = this.isDebugKey(logEntry);

    // 快速检查：如果不满足任何输出条件，直接返回
    if (!isDebug && 
        logEntry.basic.logLevelNumber < this.levelApi && 
        logEntry.basic.logLevelNumber < this.levelFile && 
        logEntry.basic.logLevelNumber < this.levelConsole) {
      return;
    }

    if (isDebug || logEntry.basic.logLevelNumber >= this.levelApi) {
      if (this.serverLogger) {
        await this.serverLogger.logToServer(logEntry);
      }
    }

    if (isDebug || logEntry.basic.logLevelNumber >= this.levelFile) {
      this.fileLogger?.logToFile(logEntry);
    }

    if (isDebug || logEntry.basic.logLevelNumber >= this.levelConsole) {
      this.consoleLogger?.writeLine(logEntry);
    }
  }

  /**
   * 检查日志条目是否匹配调试条件
   * @param logEntry 日志条目
   */
  private isDebugKey(logEntry: LogEntry): boolean {
    if (this.DebugEntry?.basic) {
      return !!(
        (this.DebugEntry.basic.serviceName && logEntry.basic.serviceName && this.DebugEntry.basic.serviceName.toLowerCase() === logEntry.basic.serviceName.toLowerCase()) ||
        (this.DebugEntry.basic.serviceObj && logEntry.basic.serviceObj && this.DebugEntry.basic.serviceObj.toLowerCase() === logEntry.basic.serviceObj.toLowerCase()) ||
        (this.DebugEntry.basic.serviceFun && logEntry.basic.serviceFun && this.DebugEntry.basic.serviceFun.toLowerCase() === logEntry.basic.serviceFun.toLowerCase()) ||
        (this.DebugEntry.basic.userId && logEntry.basic.userId && this.DebugEntry.basic.userId.toLowerCase() === logEntry.basic.userId.toLowerCase()) ||
        (this.DebugEntry.basic.userName && logEntry.basic.userName && this.DebugEntry.basic.userName.toLowerCase() === logEntry.basic.userName.toLowerCase())
      );
    }

    const keysToCheck = [
      logEntry.basic.serviceName,
      logEntry.basic.serviceObj,
      logEntry.basic.serviceFun,
      logEntry.basic.userId,
      logEntry.basic.userName
    ];

    return keysToCheck.some(key => key && this.debugKind.has(key.toLowerCase()));
  }

  /**
   * 记录DEBUG级别的日志
   * @param logEntry 日志条目
   * @param level 日志级别
   */
  public async debugEntry(logEntry: LogEntry, level: number = 20): Promise<void> {
    logEntry.basic.logLevel = "DEBUG";
    logEntry.basic.logLevelNumber = level;
    await this.processLog(logEntry);
  }

  /**
   * 记录DEBUG级别的日志
   * @param summaryOrLogEntry 日志摘要或日志条目
   * @param messageOrLevelOrObject 日志消息或日志级别或对象
   * @param level 日志级别
   */
  public async debug(summaryOrLogEntry: string | LogEntry, messageOrLevelOrObject?: any, level: number = 20): Promise<void> {
    let logEntry: LogEntry;

    if (summaryOrLogEntry instanceof LogEntry) {
      logEntry = summaryOrLogEntry;
      logEntry.basic.logLevel = "DEBUG";
      logEntry.basic.logLevelNumber = typeof messageOrLevelOrObject === 'number' ? messageOrLevelOrObject : level;
    } else {
      logEntry = new LogEntry({
        basic: {
          summary: summaryOrLogEntry,
          message: messageOrLevelOrObject, // 不进行 JSON 转换
          logLevel: "DEBUG",
          logLevelNumber: typeof messageOrLevelOrObject === 'number' ? messageOrLevelOrObject : level
        }
      });
    }

    await this.processLog(logEntry);
  }

  /**
   * 记录INFO级别的日志
   * @param logEntry 日志条目
   * @param level 日志级别
   */
  public async infoEntry(logEntry: LogEntry, level: number = 30): Promise<void> {
    logEntry.basic.logLevel = "INFO";
    logEntry.basic.logLevelNumber = level;
    await this.processLog(logEntry);
  }

  /**
   * 记录INFO级别的日志
   * @param summaryOrLogEntry 日志摘要或日志条目
   * @param messageOrLevelOrObject 日志消息或日志级别或对象
   * @param level 日志级别
   */
  public async info(summaryOrLogEntry: string | LogEntry, messageOrLevelOrObject?: any, level: number = 30): Promise<void> {
    let logEntry: LogEntry;

    if (summaryOrLogEntry instanceof LogEntry) {
      logEntry = summaryOrLogEntry;
      logEntry.basic.logLevel = "INFO";
      logEntry.basic.logLevelNumber = typeof messageOrLevelOrObject === 'number' ? messageOrLevelOrObject : level;
    } else {
      logEntry = new LogEntry({
        basic: {
          summary: summaryOrLogEntry,
          message: messageOrLevelOrObject, // 不进行 JSON 转换
          logLevel: "INFO",
          logLevelNumber: typeof messageOrLevelOrObject === 'number' ? messageOrLevelOrObject : level
        }
      });
    }

    await this.processLog(logEntry);
  }

  /**
   * 记录WARN级别的日志
   * @param logEntry 日志条目
   * @param level 日志级别
   */
  public async warnEntry(logEntry: LogEntry, level: number = 50): Promise<void> {
    logEntry.basic.logLevel = "WARN";
    logEntry.basic.logLevelNumber = level;
    await this.processLog(logEntry);
  }

  /**
   * 记录WARN级别的日志
   * @param summaryOrLogEntry 日志摘要或日志条目
   * @param messageOrLevelOrObject 日志消息或日志级别或对象
   * @param level 日志级别
   */
  public async warn(summaryOrLogEntry: string | LogEntry, messageOrLevelOrObject?: any, level: number = 50): Promise<void> {
    let logEntry: LogEntry;

    if (summaryOrLogEntry instanceof LogEntry) {
      logEntry = summaryOrLogEntry;
      logEntry.basic.logLevel = "WARN";
      logEntry.basic.logLevelNumber = typeof messageOrLevelOrObject === 'number' ? messageOrLevelOrObject : level;
    } else {
      logEntry = new LogEntry({
        basic: {
          summary: summaryOrLogEntry,
          message: messageOrLevelOrObject, // 不进行 JSON 转换
          logLevel: "WARN",
          logLevelNumber: typeof messageOrLevelOrObject === 'number' ? messageOrLevelOrObject : level
        }
      });
    }

    await this.processLog(logEntry);
  }

  /**
   * 记录ERROR级别的日志
   * @param logEntry 日志条目
   * @param level 日志级别
   */
  public async errorEntry(logEntry: LogEntry, level: number = 60): Promise<void> {
    logEntry.basic.logLevel = "ERROR";
    logEntry.basic.logLevelNumber = level;
    await this.processLog(logEntry);
  }

  /**
   * 记录ERROR级别的日志
   * @param errorOrSummary 错误对象或日志摘要
   * @param messageOrLevelOrObject 日志消息或日志级别或对象
   * @param level 日志级别
   */
  public async error(errorOrSummary: Error | string, messageOrLevelOrObject?: any, level: number = 60): Promise<void> {
    let logEntry: LogEntry;

    if (errorOrSummary instanceof Error) {
      logEntry = new LogEntry({
        basic: {
          summary: errorOrSummary.message,
          message: messageOrLevelOrObject, // 不进行 JSON 转换
          logLevel: "ERROR",
          logLevelNumber: typeof messageOrLevelOrObject === 'number' ? messageOrLevelOrObject : level
        },
        error: {
          errorType: errorOrSummary.name,
          errorMessage: errorOrSummary.message,
          errorStackTrace: errorOrSummary.stack
        }
      });
    } else {
      logEntry = new LogEntry({
        basic: {
          summary: errorOrSummary,
          message: messageOrLevelOrObject, // 不进行 JSON 转换
          logLevel: "ERROR",
          logLevelNumber: typeof messageOrLevelOrObject === 'number' ? messageOrLevelOrObject : level
        }
      });
    }

    await this.processLog(logEntry);
  }

  /**
   * 使用 LogEntry 对象的方法
   * @param logEntry 日志条目
   */
  public async logEntry(logEntry: LogEntry): Promise<void> {
    await this.processLog(logEntry);
  }

  /**
   * 记录DETAIL级别的日志
   * @param logEntry 日志条目
   * @param level 日志级别
   */
  public async detailEntry(logEntry: LogEntry, level: number = 10): Promise<void> {
    logEntry.basic.logLevel = "DETAIL";
    logEntry.basic.logLevelNumber = level;
    await this.processLog(logEntry);
  }

  /**
   * 记录DETAIL级别的日志
   * @param summaryOrLogEntry 日志摘要或日志条目
   * @param messageOrLevelOrObject 日志消息或日志级别或对象
   * @param level 日志级别
   */
  public async detail(summaryOrLogEntry: string | LogEntry, messageOrLevelOrObject?: any, level: number = 10): Promise<void> {
    let logEntry: LogEntry;

    if (summaryOrLogEntry instanceof LogEntry) {
      logEntry = summaryOrLogEntry;
      logEntry.basic.logLevel = "DETAIL";
      logEntry.basic.logLevelNumber = typeof messageOrLevelOrObject === 'number' ? messageOrLevelOrObject : level;
    } else {
      logEntry = new LogEntry({
        basic: {
          summary: summaryOrLogEntry,
          message: messageOrLevelOrObject, // 不进行 JSON 转换
          logLevel: "DETAIL",
          logLevelNumber: typeof messageOrLevelOrObject === 'number' ? messageOrLevelOrObject : level
        }
      });
    }

    await this.processLog(logEntry);
  }

  /**
   * 设置详细日志文件
   * @param filename 文件名
   * @param menu 目录
   */
  public setupDetailFile(filename: string = "detail.log", menu: string = "logs"): void {
      const fullPath = path.join(process.cwd(), menu, filename);
      console.log(`正在设置详细日志文件: ${fullPath}`);
      try {
          const logDir = path.dirname(fullPath);
          if (!fs.existsSync(logDir)) {
              console.log(`创建目录: ${logDir}`);
              fs.mkdirSync(logDir, { recursive: true });
          }
          this.detailLogger = new FileLogDetail(filename, menu);
          console.log('详细日志文件设置成功');
   
      } catch (error) {
          console.error('设置详细日志文件时出错:', error);
      }
  }

  /**
   * 关闭所有日志记录器
   */
  public close(): void {
    if (this.fileLogger instanceof FileLog78) {
      this.fileLogger.close();
    }
    if (this.detailLogger instanceof FileLogDetail) {
      this.detailLogger.close();
    }
    // 如果有其他需要关闭的日志记录器，也在这里添加
  }

  /**
   * 清空详细日志文件
   */
  public clearDetailLog(): void {
    this.detailLogger?.clear();
  }
} // 类定义结束

// 将默认导出移到类定义的外部
export default TsLog78;
