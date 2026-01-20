# MyLogger TypeScript 版本

## 概述

这是 [mylogger.py](./mylogger.py) 的 TypeScript 版本，功能完全一致。

## 功能特性

1. **统一日志管理**：所有日志通过此类记录
2. **动态调整日志级别**：通过环境变量动态调整，避免打日志又删除
3. **日志隔离**：每个工作流有独立的日志文件
4. **单例模式**：相同 `workflow_id` 自动复用同一实例
5. **自动日志清理**：保留指定天数的日志，默认 3 天
6. **环境适配**：生产/开发/测试环境不同日志级别
7. **DETAIL 级别**：只写入文件，不输出到控制台

## 日志级别

| 级别 | 值 | 说明 |
|------|---|------|
| DETAIL | 5 | 最详细日志，仅写入文件 |
| DEBUG | 10 | 调试信息 |
| INFO | 20 | 一般信息 |
| WARN | 30 | 警告信息 |
| ERROR | 40 | 错误信息 |

## 环境配置

通过 `APP_ENV` 环境变量控制：

| 环境 | 控制台级别 | 文件级别 | Detail 日志 |
|------|-----------|----------|-------------|
| production | INFO | INFO | 关闭 |
| development | DEBUG | DETAIL | 自动开启 |
| test | DEBUG | DEBUG | 关闭 |

## 使用方法

### 基本使用

```typescript
import { getLogger } from './src/wfbase/mylogger';

// 创建日志器实例
const logger = getLogger("workflow_id", 3); // 3天保留期

// 记录不同级别的日志
logger.detail("详细调试信息");  // 只写入文件
logger.debug("调试信息");
logger.info("一般信息");
logger.warn("警告信息");
logger.error("错误信息");
```

### 单例模式

```typescript
import { MyLogger } from './src/wfbase/mylogger';

// 相同 workflow_id 返回同一实例
const logger1 = MyLogger.getInstance("myapp");
const logger2 = MyLogger.getInstance("myapp");
console.log(logger1 === logger2); // true
```

### 异常记录

```typescript
try {
    // 一些可能出错的操作
    JSON.parse invalid json");
} catch (e) {
    logger.exception(e as Error);
}
```

### 手动设置日志级别

```typescript
const logger = getLogger("myapp");

// 设置文件日志级别为 DETAIL，控制台为 INFO
logger.setupLevel(LogLevel.DETAIL, LogLevel.INFO);
```

### 手动切换环境

```typescript
const logger = getLogger("myapp");

// 切换到开发环境
logger.setEnvironment(Environment.DEVELOPMENT);

// 切换到生产环境
logger.setEnvironment(Environment.PRODUCTION);
```

### 清空 Detail 日志

```typescript
const logger = getLogger("myapp");
logger.clearDetailLog();
```

## 日志文件结构

```
logs/
└── workflow_id/
    ├── workflow_id_2026-01-19.log    # 按日期归档的日志
    ├── workflow_id_2026-01-18.log
    ├── detail.log                     # Detail 级别日志
    └── workflow_id.log               # 当前日志文件
```

## 与 Python 版本的差异

TypeScript 版本在功能上与 Python 版本完全一致，主要差异在于：

1. **实例获取方式**：使用 `getInstance()` 静态方法而非 `__new__`
2. **文件写入锁**：使用 Promise 链而非 threading.Lock
3. **异步方法**：文件写入是异步的，但日志方法是同步的（内部处理）

## API 参考

### 类：MyLogger

#### 静态方法

- `getInstance(myname: string, logRetentionDays?: number, wfname?: string): MyLogger` - 获取单例实例

#### 实例方法

- `detail(message: string): void` - 记录 DETAIL 级别日志
- `debug(message: string): void` - 记录 DEBUG 级别日志
- `info(message: string): void` - 记录 INFO 级别日志
- `warn(message: string): void` - 记录 WARN 级别日志
- `warning(message: string): void` - 记录 WARN 级别日志（别名）
- `error(message: string): void` - 记录 ERROR 级别日志
- `critical(message: string): void` - 记录 CRITICAL 级别日志（等同于 ERROR）
- `exception(exc: Error, level?: LogLevel): void` - 记录异常日志
- `setEnvironment(env: Environment): void` - 设置环境
- `setupLevel(fileLevel: number, consoleLevel: number): void` - 手动设置日志级别
- `clearDetailLog(): void` - 清空 detail 日志
- `formatException(exc: Error): string` - 格式化异常信息

### 枚举：LogLevel

- `DETAIL = 5`
- `DEBUG = 10`
- `INFO = 20`
- `WARN = 30`
- `ERROR = 40`

### 枚举：Environment

- `PRODUCTION = "production"`
- `DEVELOPMENT = "development"`
- `TEST = "test"`

### 函数：getLogger

便捷函数，用于快速创建日志器实例：

```typescript
getLogger(myname: string, logRetentionDays?: number, wfname?: string): MyLogger
```
