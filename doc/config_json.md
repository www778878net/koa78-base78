# 配置文件说明

koa78-base78 支持多种环境配置，每种环境可以使用不同的配置文件。系统会根据 `NODE_ENV` 环境变量来决定加载哪个配置文件。

## 环境配置文件

根据不同环境，系统会加载对应的配置文件：

- `config.json` - 默认环境配置文件
- `configtest.json` - 测试环境配置文件 (`NODE_ENV=test`)
- `configdev.json` - 开发环境配置文件 (`NODE_ENV=development`)
- `configprod.json` - 生产环境配置文件 (`NODE_ENV=production`)

如果没有找到对应环境的配置文件，系统会回退到默认的 `config.json`。

## 配置项说明

### location
- 类型: 字符串
- 说明: 标识应用程序部署的位置，例如 "ali" 表示部署在阿里云

### host
- 类型: 字符串
- 说明: 应用程序主机地址

### nodejslog
Node.js 日志相关配置:
- `issave`: 是否保存日志
- `redis`: 是否使用 Redis 存储日志

### iplog
- 类型: 布尔值
- 说明: 是否记录 IP 日志

### mysql / mysql2
MySQL 数据库配置:
- `host`: 数据库主机地址
- `port`: 数据库端口号
- `password`: 数据库密码
- `database`: 数据库名称
- `user`: 数据库用户名
- `isLog`: 是否记录数据库操作日志
- `isCount`: 是否统计数据

### apiqq
微信公众号相关配置:
- `appid`: 微信公众号 AppID
- `secret`: 微信公众号密钥
- `encodingAESKey`: 消息加解密密钥
- `token`: 微信公众号 Token
- `myuserid`: 微信公众号原始ID
- `mch_id`: 微信支付商户号
- `mch_key`: 微信支付商户密钥
- `apppayid`: APP支付 AppID
- `apppaySecrect`: APP支付密钥
- `host`: 支付回调主机地址

### memcached
Memcached 缓存配置:
- `host`: Memcached 主机地址
- `port`: Memcached 端口号
- `max`: 最大连接数
- `local`: 本地缓存路径

### redis
Redis 缓存配置:
- `host`: Redis 主机地址
- `port`: Redis 端口号
- `pwd`: Redis 密码
- `max`: 最大连接数
- `local`: 本地缓存路径

## 使用说明

根据不同环境设置 `NODE_ENV` 环境变量来加载对应配置文件：

```bash
# 使用测试环境配置
export NODE_ENV=test
node app.js

# 使用生产环境配置
export NODE_ENV=production
node app.js

# 使用开发环境配置
export NODE_ENV=development
node app.js

# 使用默认配置
node app.js
```

你也可以在应用中通过 `config.get(key)` 方法获取配置项的值。