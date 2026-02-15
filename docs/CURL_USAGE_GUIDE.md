# Base78 控制器 API 使用指南 (cURL 示例)

## 目录
- [API 路由格式](#api-路由格式)
- [认证机制](#认证机制)
- [通用请求格式](#通用请求格式)
- [API 方法示例](#api-方法示例)
- [错误处理](#错误处理)
- [分表支持](#分表支持)

---

## API 路由格式

所有 API 请求遵循统一的 URL 模式：

```
http://your-host:port/:apisys/:apimicro/:apiobj/:apifun
```

### 参数说明

| 参数       | 说明                          | 示例                     |
| ---------- | ----------------------------- | ------------------------ |
| `apisys`   | API 版本，必须以 "api" 开头   | `apisys1`, `apitest`     |
| `apimicro` | API 系统/模块名               | `stock`, `user`, `order` |
| `apiobj`   | API 对象/控制器名（对应类名） | `StockMine`, `UserInfo`  |
| `apifun`   | API 方法名                    | `mAdd`, `get`, `mUpdate` |

**注意**：
- `apifun` 不能以下划线 `_` 开头（私有方法）
- `apimicro` 不能以 "dll" 开头

---

## 认证机制

所有请求都需要包含认证信息。认证通常通过以下 HTTP 头传递：

```bash
# 常见的认证头（具体取决于你的 AuthService 实现）
Authorization: Bearer <token>
# 或
Cookie: session=<session_id>
# 或自定义头
X-Auth-Token: <token>
```

---

## 通用请求格式

### 请求方法
- 主要使用 **POST** 方法（即使是查询操作）
- Content-Type: `application/json`

### 请求体结构

```json
{
  "pars": [...],           // 方法参数数组
  "cols": ["field1","field2"], // 可选：指定列名
  "mid": "record-id",      // 可选：记录ID（用于更新/删除）
  "midpk": 123,            // 可选：记录主键
  "order": "idpk DESC",    // 可选：排序方式
  "start": 0,              // 可选：分页起始
  "number": 10             // 可选：每页数量
}
```

### 响应格式

```json
{
  "res": 0,                // 结果码（0=成功，负数=失败）
  "errmsg": "",            // 错误信息
  "kind": "string",        // 返回类型
  "back": <result_data>    // 实际返回数据
}
```

---

## API 方法示例

### 1. mAdd - 新增单条记录

新增一条记录，自动生成 `id`, `upby`, `uptime` 等系统字段。

```bash
curl -X POST "http://localhost:3000/apisys1/stock/StockMine/mAdd" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-token-here" \
  -d '{
    "pars": [
      "000001.SZ",           // 第1个字段值
      "平安银行",              // 第2个字段值
      100.5,                 // 第3个字段值
      "2024-01-01"           // 第N个字段值
    ],
    "cols": ["ts_code", "name", "price", "date"]
  }'
```

**响应示例**：
```json
{
  "res": 0,
  "errmsg": "",
  "kind": "string",
  "back": "INSERT INTO `stock_mine` (`ts_code`,`name`,`price`,`date`,`id`,`upby`,`uptime`,`cid`) VALUES ('000001.SZ','平安银行',100.5,'2024-01-01','uuid-12345','admin',1704067200000,'100')"
}
```

---

### 2. mAddMany - 批量新增

批量新增多条记录。

```bash
curl -X POST "http://localhost:3000/apisys1/stock/StockMine/mAddMany" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-token-here" \
  -d '{
    "pars": [
      "000001.SZ", "平安银行", 100.5, "2024-01-01",
      "000002.SZ", "万科A", 50.3, "2024-01-02",
      "600000.SH", "浦发银行", 80.2, "2024-01-03"
    ],
    "cols": ["ts_code", "name", "price", "date"]
  }'
```

**响应示例**：
```json
{
  "res": 0,
  "errmsg": "",
  "kind": "string",
  "back": 3
}
```

---

### 3. mUpdate - 更新记录（通过id）

根据 `id` 字段更新记录。

```bash
curl -X POST "http://localhost:3000/apisys1/stock/StockMine/mUpdate" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-token-here" \
  -d '{
    "mid": "uuid-12345",
    "pars": [105.8, "2024-01-15"],
    "cols": ["price", "date"]
  }'
```

**响应示例**：
```json
{
  "res": 0,
  "errmsg": "",
  "kind": "string",
  "back": "uuid-12345"
}
```

---

### 4. mUpdateIdpk - 更新记录（通过idpk）

根据 `idpk` 主键更新记录。

```bash
curl -X POST "http://localhost:3000/apisys1/stock/StockMine/mUpdateIdpk" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-token-here" \
  -d '{
    "midpk": 123,
    "pars": [110.5, "2024-01-20"],
    "cols": ["price", "date"]
  }'
```

**响应示例**：
```json
{
  "res": 0,
  "errmsg": "",
  "kind": "string",
  "back": "123"
}
```

---

### 5. mUpdateMany - 批量更新

批量更新多条记录，使用 CASE WHEN 语句。

```bash
curl -X POST "http://localhost:3000/apisys1/stock/StockMine/mUpdateMany" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-token-here" \
  -d '{
    "pars": [
      105.5, 1001,
      108.2, 1002,
      112.8, 1003
    ],
    "cols": ["price"]
  }'
```

**说明**：参数顺序为 `值1, idpk1, 值2, idpk2, ...`，每条记录占用 `(列数 + 1)` 个参数。

---

### 6. m - 智能新增或更新

根据 `id` 查询记录，存在则更新，不存在则新增。

```bash
curl -X POST "http://localhost:3000/apisys1/stock/StockMine/m" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-token-here" \
  -d '{
    "mid": "uuid-12345",
    "pars": ["000001.SZ", "平安银行", 115.5, "2024-01-25"],
    "cols": ["ts_code", "name", "price", "date"]
  }'
```

---

### 7. midpk - 智能新增或更新（通过idpk）

根据 `idpk` 查询记录，存在则更新，不存在则新增。

```bash
curl -X POST "http://localhost:3000/apisys1/stock/StockMine/midpk" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-token-here" \
  -d '{
    "midpk": 123,
    "pars": ["000001.SZ", "平安银行", 120.5, "2024-01-28"],
    "cols": ["ts_code", "name", "price", "date"]
  }'
```

---

### 8. mdel - 删除单条记录

根据 `id` 删除记录。

```bash
curl -X POST "http://localhost:3000/apisys1/stock/StockMine/mdel" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-token-here" \
  -d '{
    "mid": "uuid-12345"
  }'
```

**响应示例**：
```json
{
  "res": 0,
  "errmsg": "",
  "kind": "string",
  "back": "uuid-12345"
}
```

---

### 9. mdelmany - 批量删除

根据 `idpk` 列表批量删除记录。

```bash
curl -X POST "http://localhost:3000/apisys1/stock/StockMine/mdelmany" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-token-here" \
  -d '{
    "pars": [1001, 1002, 1003]
  }'
```

---

### 10. get - 查询记录

根据条件查询记录，支持分页和排序。

```bash
curl -X POST "http://localhost:3000/apisys1/stock/StockMine/get" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-token-here" \
  -d '{
    "pars": ["000001.SZ"],
    "cols": ["ts_code"],
    "order": "idpk DESC",
    "start": 0,
    "number": 10
  }'
```

**响应示例**：
```json
{
  "res": 0,
  "errmsg": "",
  "kind": "string",
  "back": [
    {
      "idpk": 123,
      "id": "uuid-12345",
      "ts_code": "000001.SZ",
      "name": "平安银行",
      "price": 115.5,
      "date": "2024-01-25"
    }
  ]
}
```

---

### 11. mByFirstField - 通过第一个字段新增或更新

当第一个字段为唯一键时使用。

```bash
curl -X POST "http://localhost:3000/apisys1/stock/StockMine/mByFirstField" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-token-here" \
  -d '{
    "pars": ["000001.SZ", "平安银行", 125.5, "2024-02-01"],
    "cols": ["ts_code", "name", "price", "date"]
  }'
```

---

## 错误处理

### 常见错误码

| HTTP 状态码 | res 值       | 说明                         |
| ----------- | ------------ | ---------------------------- |
| 200         | 0            | 成功                         |
| 400         | -8888 或其他 | 参数验证失败                 |
| 401         | -            | 未授权（认证失败）           |
| 403         | -            | 访问被拒绝（方法或权限问题） |
| 404         | -            | API 方法未找到               |
| 429         | -            | 请求过多（防重放攻击）       |
| 500         | -8888 或其他 | 服务器内部错误               |

### 错误响应示例

```json
{
  "res": -1,
  "errmsg": "err:记录不存在",
  "kind": "string",
  "back": "err:记录不存在"
}
```

---

## 分表支持

如果控制器配置了分表（`ShardingConfig`），系统会自动：

1. **动态表名**：根据日期自动选择表名
   - 日表：`{table_name}_YYYYMMDD`
   - 月表：`{table_name}_YYYYMM`

2. **自动维护**：每天执行一次维护任务
   - 删除 `retentionDays` 天前的旧表
   - 创建未来 `retentionDays` 天的表

**示例**：如果表名为 `sys_log`，配置为日表，今天为 2024-01-15
- 实际使用的表：`sys_log_20240115`
- 系统会自动维护从 `sys_log_20240110` 到 `sys_log_20240120` 的表

---

## 管理员权限

某些操作（标记为 `isadmin: true`）会检查管理员权限：

```typescript
protected checkAdminPermission(): void {
    if (this.isadmin) {
        if ((up.cid !== this.config.get('cidvps') &&
             up.cid !== this.config.get('cidmy')) &&
            !up.uname?.indexOf("sys")) {
            throw new Error("err:只有管理员可以操作");
        }
    }
}
```

管理员条件（满足其一即可）：
- `cid` 等于配置中的 `cidvps`
- `cid` 等于配置中的 `cidmy`
- `uname` 包含 "sys"

---

## 完整示例脚本

### Bash 脚本示例

```bash
#!/bin/bash

BASE_URL="http://localhost:3000"
TOKEN="your-auth-token"

# 1. 新增记录
echo "=== 新增记录 ==="
curl -X POST "${BASE_URL}/apisys1/stock/StockMine/mAdd" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{
    "pars": ["000001.SZ", "平安银行", 100.5, "2024-01-01"],
    "cols": ["ts_code", "name", "price", "date"]
  }' | jq '.'

# 2. 查询记录
echo -e "\n=== 查询记录 ==="
curl -X POST "${BASE_URL}/apisys1/stock/StockMine/get" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{
    "pars": ["000001.SZ"],
    "cols": ["ts_code"],
    "order": "idpk DESC",
    "start": 0,
    "number": 10
  }' | jq '.'
```

---

## 注意事项

1. **所有修改操作必须以 'm' 开头**：`mAdd`, `mUpdate`, `mDel` 等（防浏览器重放攻击）
2. **查询方法不以 'm' 开头**：如 `get`
3. **参数顺序必须与 `cols` 顺序一致**
4. **批量操作参数数量必须正确**：
   - `mAddMany`: `pars.length` 必须是 `cols.length` 的整数倍
   - `mUpdateMany`: `pars.length` 必须是 `(cols.length + 1)` 的整数倍
5. **认证信息必须包含**：否则会返回 401 错误

---

## 相关文档

- [Base78 控制器源码](../src/controllers/Base78.ts)
- [路由配置](../src/routers/httpServer.ts)
- [配置说明](../src/config/Config.ts)
