# koa78-base78 API 快速入门指南

欢迎使用 koa78-base78 框架！本文档将帮助您快速了解如何使用基于 Base78 控制器的 RESTful API。

---

## 📋 目录

- [快速开始](#快速开始)
- [基础概念](#基础概念)
- [认证说明](#认证说明)
- [核心 API 操作](#核心-api-操作)
- [常见示例](#常见示例)
- [错误处理](#错误处理)
- [最佳实践](#最佳实践)

---

## 🚀 快速开始

### API 端点格式

```
http://your-host:port/:apiver/:apisys/:apiobj/:apifun
```

**示例**：
```bash
http://localhost:3000/apiv1/stock/StockMine/get
```

### 第一个 API 调用

```bash
curl -X POST "http://localhost:3000/apiv1/stock/StockMine/get" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "start": 0,
    "number": 10
  }'
```

**响应**：
```json
{
  "res": 0,
  "errmsg": "",
  "kind": "string",
  "back": [...]
}
```

---

## 📚 基础概念

### URL 参数说明

| 参数 | 位置 | 说明 | 示例 |
|------|------|------|------|
| `apiver` | 路径 | API 版本（必须以 "api" 开头） | `apiv1`, `apitest` |
| `apisys` | 路径 | 系统/模块名称 | `stock`, `user`, `order` |
| `apiobj` | 路径 | 对象/控制器名称（对应类名） | `StockMine`, `UserInfo` |
| `apifun` | 路径 | 方法名称 | `get`, `mAdd`, `mUpdate` |

### 请求体参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `pars` | array | 是 | 方法参数数组 |
| `cols` | array | 否 | 指定操作的列名 |
| `mid` | string | 否 | 记录 ID（用于更新/删除） |
| `midpk` | number | 否 | 记录主键 |
| `order` | string | 否 | 排序方式，如 `"idpk DESC"` |
| `start` | number | 否 | 分页起始位置，默认 0 |
| `number` | number | 否 | 每页数量 |

### 响应结构

```typescript
{
  res: number;      // 0=成功, 负数=失败
  errmsg: string;   // 错误信息
  kind: string;     // 返回类型
  back: any;        // 实际数据
}
```

---

## 🔐 认证说明

所有 API 请求都需要认证。认证方式取决于您的 `AuthService` 实现。

### 常见认证方式

```bash
# 方式 1: Bearer Token
-H "Authorization: Bearer YOUR_TOKEN"

# 方式 2: Cookie
-H "Cookie: session=YOUR_SESSION_ID"

# 方式 3: 自定义 Header
-H "X-Auth-Token: YOUR_TOKEN"
```

---

## ⚡ 核心 API 操作

### 1️⃣ 查询 (get)

根据条件查询记录列表。

```bash
curl -X POST "http://localhost:3000/apiv1/stock/StockMine/get" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "pars": ["000001.SZ"],
    "cols": ["ts_code"],
    "order": "idpk DESC",
    "start": 0,
    "number": 10
  }'
```

### 2️⃣ 新增 (mAdd)

新增一条记录。

```bash
curl -X POST "http://localhost:3000/apiv1/stock/StockMine/mAdd" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "pars": ["000001.SZ", "平安银行", 100.5, "2024-01-01"],
    "cols": ["ts_code", "name", "price", "date"]
  }'
```

### 3️⃣ 更新 (mUpdate)

根据 ID 更新记录。

```bash
curl -X POST "http://localhost:3000/apiv1/stock/StockMine/mUpdate" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "mid": "uuid-12345",
    "pars": [105.8, "2024-01-15"],
    "cols": ["price", "date"]
  }'
```

### 4️⃣ 删除 (mdel)

根据 ID 删除记录。

```bash
curl -X POST "http://localhost:3000/apiv1/stock/StockMine/mdel" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "mid": "uuid-12345"
  }'
```

### 5️⃣ 智能操作 (m / midpk)

自动判断新增或更新。

```bash
# 根据 ID 判断
curl -X POST "http://localhost:3000/apiv1/stock/StockMine/m" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "mid": "uuid-12345",
    "pars": ["000001.SZ", "平安银行", 115.5],
    "cols": ["ts_code", "name", "price"]
  }'

# 根据 IDPK 判断
curl -X POST "http://localhost:3000/apiv1/stock/StockMine/midpk" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "midpk": 123,
    "pars": ["000001.SZ", "平安银行", 115.5],
    "cols": ["ts_code", "name", "price"]
  }'
```

---

## 💡 常见示例

### 批量新增 (mAddMany)

```bash
curl -X POST "http://localhost:3000/apiv1/stock/StockMine/mAddMany" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "pars": [
      "000001.SZ", "平安银行", 100.5,
      "000002.SZ", "万科A", 50.3,
      "600000.SH", "浦发银行", 80.2
    ],
    "cols": ["ts_code", "name", "price"]
  }'
```

### 批量更新 (mUpdateMany)

```bash
curl -X POST "http://localhost:3000/apiv1/stock/StockMine/mUpdateMany" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "pars": [105.5, 1001, 108.2, 1002, 112.8, 1003],
    "cols": ["price"]
  }'
```

**注意**：参数顺序为 `值1, idpk1, 值2, idpk2, ...`

### 批量删除 (mdelmany)

```bash
curl -X POST "http://localhost:3000/apiv1/stock/StockMine/mdelmany" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "pars": [1001, 1002, 1003]
  }'
```

### 分页查询

```bash
curl -X POST "http://localhost:3000/apiv1/stock/StockMine/get" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "start": 20,
    "number": 10,
    "order": "idpk DESC"
  }'
```

---

## ❌ 错误处理

### HTTP 状态码

| 状态码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 400 | 参数错误 |
| 401 | 未授权 |
| 403 | 访问被拒绝 |
| 404 | API 不存在 |
| 429 | 请求过多（防重放） |
| 500 | 服务器错误 |

### 响应码 (res)

| res 值 | 说明 |
|--------|------|
| 0 | 成功 |
| -8888 | 系统错误 |
| -1 | 操作失败 |

### 错误响应示例

```json
{
  "res": -1,
  "errmsg": "err:记录不存在",
  "kind": "string",
  "back": null
}
```

---

## ✨ 最佳实践

### 1. 方法命名规范

- **修改操作**：必须以 `m` 开头（如 `mAdd`, `mUpdate`, `mDel`）
- **查询操作**：不以 `m` 开头（如 `get`）

```typescript
// ✅ 正确
async mAdd() { }
async mUpdate() { }
async mDel() { }
async get() { }

// ❌ 错误
async add() { }        // 缺少 m 前缀
async _mAdd() { }      // 以下划线开头（私有）
```

### 2. 参数校验

```bash
# 确保参数数量与 cols 匹配
pars: [值1, 值2, 值3]
cols: ["字段1", "字段2", "字段3"]
```

### 3. 使用智能操作

当不确定记录是否存在时，使用 `m` 或 `midpk`：

```bash
# 会自动判断新增还是更新
curl -X POST ".../m" -d '{"mid": "xxx", "pars": [...], "cols": [...]}'
```

### 4. 批量操作优化

```bash
# 批量新增比循环单次新增更高效
curl -X POST ".../mAddMany" -d '{"pars": [...]}'
```

### 5. 分表使用

如果启用了分表（日表/月表），框架会自动：
- 根据日期选择正确的表
- 自动创建和清理过期表

---

## 📖 更多文档

- [详细 cURL 使用指南](./CURL_USAGE_GUIDE.md)
- [Base78 控制器源码](../src/controllers/Base78.ts)
- [配置说明](../src/config/Config.ts)

---

## 🔧 开发支持

如有问题或建议，请联系开发团队或提交 Issue。
