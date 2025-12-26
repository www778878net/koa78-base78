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

import * as winston from 'winston';
import 'winston-daily-rotate-file';
import DailyRotateFile from 'winston-daily-rotate-file';
import * as fs from 'fs';
import * as path from 'path';
import IFileLog78 from "./IFileLog78";
import LogEntry from './LogEntry';

export default class FileLog78 implements IFileLog78 {

    private menu: string;
    private file: string;
    private logger?: winston.Logger;

    constructor(filename: string = "7788_%DATE%.log", menu: string = "logs") {
        this.file = filename;
        this.menu = menu;

        if (!fs.existsSync(this.menu)) {
            fs.mkdirSync(this.menu, { recursive: true });
        }

        const transport = new DailyRotateFile({
            filename: this.file,
            dirname: this.menu,
            datePattern: 'YYYY-MM-DD-HH',
            maxSize: '5m',
            maxFiles: '24h',
            format: winston.format.json()
        });

        this.logger = winston.createLogger({
            level: 'info',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json()
            ),
            transports: [transport]
        });

        //this.clear(); // 在构造函数中调用clear，与C#版本保持一致

    }

    logToFile(logEntry: LogEntry): void {

        try {
            if (this.logger) {

                this.logger.info(logEntry.toJson());
            } else {
                console.error('Logger is not initialized');
            }
            // const now = new Date();
            // if (now.getMinutes() === 0 && now.getSeconds() < 10) {
            // 	this.clear();
            // }
        } catch (error) {
            console.error(`写入日志文件时出错: ${error}`);
        }

    }



    // 清除日志的方法
    clear(): void {
        // Winston的DailyRotateFile已经处理了日志轮转和清理
        // 如果需要额外的清理逻辑，可以在这里添加
        //console.log('Log rotation and cleanup is handled by Winston DailyRotateFile');
    }

    public close(): void {
        if (this.logger) {
            this.logger.close();
        }
    }






}