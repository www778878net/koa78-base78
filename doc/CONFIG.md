# 配置文件使用说明

## 概述

koa78-base78 支持通过外部配置文件来自定义表格配置。用户可以通过配置文件中的 `tableconfigfile` 字段指定外部配置文件路径来覆盖默认配置。

## 使用方法

### 1. 创建自定义配置文件

创建一个 JSON 文件，例如 `my-table-config.json`：

```json
{
  "my_table": {
    "colsImp": ["field1", "field2", "field3"],
    "uidcid": "cid",
    "apiver": "apiv1",
    "apisys": "mysystem"
  },
  "another_table": {
    "colsImp": ["name", "description"],
    "uidcid": "uid",
    "apiver": "apiv2",
    "apisys": "anothersys"
  }
}
```

### 2. 配置 tableconfigfile 字段

在你的环境配置文件（如 configtest.json）中设置 `tableconfigfile` 字段：

```json
{
  "tableconfigfile": "/path/to/my-table-config.json"
  // 其他配置...
}
```

如果 `tableconfigfile` 字段为空或者指定的文件不存在，则会使用系统内置的默认配置。

### 3. 配置项说明

每个表的配置包含以下几个必要字段：

- `colsImp`: 字符串数组，定义表的核心字段
- `uidcid`: 字符串，值为 "uid" 或 "cid"，决定用户标识类型
- `apiver`: 字符串，API 版本
- `apisys`: 字符串，API 系统分类

## 示例

假设你有一个名为 `product` 的表，可以这样配置：

```json
{
  "product": {
    "colsImp": ["name", "price", "category", "stock"],
    "uidcid": "cid",
    "apiver": "apishop",
    "apisys": "ecommerce"
  }
}
```

这样就可以在代码中通过 `config.getTable('product')` 获取到这个配置。