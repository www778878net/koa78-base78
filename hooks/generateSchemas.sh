#!/bin/bash

echo "Starting schema generation..."

# 定义配置文件路径
TABLE_CONFIG="src/config/tabledef.ts"

# 检查配置文件是否存在
if [ ! -f "$TABLE_CONFIG" ]; then
    echo "Error: $TABLE_CONFIG not found!"
    exit 1
fi

echo "Found config file: $TABLE_CONFIG"

# 提取表名
echo "=== Extracting table information ==="
TABLES=$(grep -E '^[[:space:]]+[a-zA-Z_][a-zA-Z0-9_]*:' "$TABLE_CONFIG" | grep -v "colsImp\|uidcid\|apisys\|apimicro" | sed 's/[[:space:]]*\([a-zA-Z_][a-zA-Z0-9_]*\).*/\1/')

echo "Found tables:"
echo "$TABLES"

# 为每个表提取详细信息并创建文件
echo ""
echo "=== Creating files for tables ==="
for tableName in $TABLES; do
    echo "Processing table: $tableName"
    
    # 获取表定义的起始行号
    startLine=$(grep -n "^    $tableName:" "$TABLE_CONFIG" | cut -d: -f1)
    
    if [ -z "$startLine" ]; then
        echo "  Could not find definition for $tableName"
        echo ""
        continue
    fi
    
    # 找到表定义结束行号（下一个表开始或文件结尾）
    nextTableLine=$(tail -n +$((startLine + 1)) "$TABLE_CONFIG" | grep -n "^    [a-zA-Z_][a-zA-Z0-9_]*:" | head -1 | cut -d: -f1)
    if [ -n "$nextTableLine" ]; then
        endLine=$((startLine + nextTableLine - 1))
    else
        endLine=$(wc -l < "$TABLE_CONFIG")
    fi
    
    # 提取表定义块
    tableDefinition=$(sed -n "${startLine},${endLine}p" "$TABLE_CONFIG")
    
    # 提取apisys
    apisys=$(echo "$tableDefinition" | grep "apisys:" | sed -n "s/.*apisys:[[:space:]]*'\([^']*\)'.*/\1/p" | head -1)
    echo "  apisys: $apisys"
    
    # 提取apimicro
    apimicro=$(echo "$tableDefinition" | grep "apimicro:" | sed -n "s/.*apimicro:[[:space:]]*'\([^']*\)'.*/\1/p" | head -1)
    echo "  apimicro: $apimicro"
    
    # 提取uidcid
    uidcid=$(echo "$tableDefinition" | grep "uidcid:" | sed -n "s/.*uidcid:[[:space:]]*'\([^']*\)'.*/\1/p" | head -1)
    if [ -z "$uidcid" ]; then
        uidcid="uid"
    fi
    echo "  uidcid: $uidcid"
    
    # 提取colsImp字段（处理两种格式）
    colsImp=""
    
    # 检查是否有数组格式的colsImp定义 ['field1', 'field2', ...]
    arrayFormat=$(echo "$tableDefinition" | grep -E "colsImp:[[:space:]]*\[" | grep "'")
    if [ -n "$arrayFormat" ]; then
        # 处理数组格式
        colsImp=$(echo "$arrayFormat" | grep -oE "'[a-zA-Z0-9_]+'" | sed "s/'//g" | tr '\n' ',' | sed 's/,$//')
    else
        # 处理多行格式
        in_colsImp=false
        while IFS= read -r line; do
            # 检查是否进入colsImp定义
            if echo "$line" | grep -q "colsImp:"; then
                in_colsImp=true
                continue
            fi
            
            # 检查是否离开colsImp定义
            if $in_colsImp && echo "$line" | grep -q "];"; then
                in_colsImp=false
                break
            fi
            
            # 如果在colsImp定义中，提取字段名
            if $in_colsImp && echo "$line" | grep -q '"[a-zA-Z0-9_]*"'; then
                field=$(echo "$line" | sed -n 's/.*"\([a-zA-Z0-9_]*\)".*/\1/p')
                if [ -n "$colsImp" ]; then
                    colsImp="${colsImp},${field}"
                else
                    colsImp="$field"
                fi
            fi
        done <<< "$tableDefinition"
    fi
    
    echo "  colsImp: $colsImp"
    
    # 构造目录和文件路径
    TS_DIR="src/$apisys/$apimicro"
    PROTO_DIR="src/proto/$apisys/$apimicro"
    TS_FILE="$TS_DIR/${tableName}.ts"
    PROTO_FILE="$PROTO_DIR/${tableName}.proto"
    
    echo "  Target TS path: $TS_FILE"
    echo "  Target Proto path: $PROTO_FILE"
    
    # 创建目录（如果不存在）
    if [ ! -d "$TS_DIR" ]; then
        echo "  Creating TS directory: $TS_DIR"
        mkdir -p "$TS_DIR"
    fi
    
    if [ ! -d "$PROTO_DIR" ]; then
        echo "  Creating Proto directory: $PROTO_DIR"
        mkdir -p "$PROTO_DIR"
    fi
    
    # 创建TypeScript文件（如果不存在）
    if [ ! -f "$TS_FILE" ]; then
        echo "  Creating TypeScript file: $TS_FILE"
        BASE_CLASS="UidBase78"
        if [ "$uidcid" = "cid" ]; then
            BASE_CLASS="CidBase78"
        fi
        
        cat > "$TS_FILE" << EOF
import { $BASE_CLASS, ApiMethod, Elasticsearch78, QueryBuilder, TableSchemas } from 'koa78-base78';
import dayjs from 'dayjs';

export default class $tableName extends $BASE_CLASS<TableSchemas['$tableName']> {

}
EOF
        echo "  ✓ Created $TS_FILE"
    else
        echo "  TypeScript file already exists: $TS_FILE"
    fi
    
    # 创建Protocol Buffer文件（如果不存在）
    if [ ! -f "$PROTO_FILE" ]; then
        echo "  Creating Protocol Buffer file: $PROTO_FILE"
        PACKAGE_NAME="${apisys}_${apimicro}"
        
        # 将colsImp转换为数组
        IFS=',' read -ra COLS <<< "$colsImp"
        
        # 添加固定字段到Item消息（按指定顺序）
        cat > "$PROTO_FILE" << EOF
syntax = "proto3";

package $PACKAGE_NAME;

// 定义单项数据结构
message ${tableName}Item {
  // 固定字段放在前面
  string id = 1;
  int32 idpk = 2;
  string $uidcid = 3;
EOF
        # 添加colsImp字段（从索引4开始）
        index=4
        for col in "${COLS[@]}"; do
            if [ -n "$col" ]; then
                echo "  string $col = $index;" >> "$PROTO_FILE"
                index=$((index + 1))
            fi
        done
        
        echo "}" >> "$PROTO_FILE"
        
        # 添加主消息类型（包含重复项）
        echo "" >> "$PROTO_FILE"
        echo "// 定义包含多项的数据结构" >> "$PROTO_FILE"
        echo "message $tableName {" >> "$PROTO_FILE"
        echo "  repeated ${tableName}Item items = 1;" >> "$PROTO_FILE"
        echo "}" >> "$PROTO_FILE"
        
        echo "  ✓ Created $PROTO_FILE"
    else
        echo "  Protocol Buffer file already exists: $PROTO_FILE"
    fi
    
    echo ""
done

# 复制整个proto目录到dist目录
echo "Copying proto directory to dist..."
cp -r src/proto dist/
echo "Proto directory copied to dist/"

echo "Schema files generation completed."