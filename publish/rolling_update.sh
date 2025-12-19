#!/bin/bash

# 滚动更新脚本 - 实现类似K8S的滚动更新效果
# 该脚本会逐个更新服务实例，确保始终有一个实例在运行

set -e

echo "开始执行滚动更新..."

# 更新第一个服务实例
echo "正在停止并更新 nodejs-app-1..."
docker-compose stop nodejs-app-1
sleep 5
docker-compose pull nodejs-app-1
docker-compose up -d nodejs-app-1

echo "等待 nodejs-app-1 启动并健康检查通过..."
until curl -sf http://localhost:8081/Api7822/TestMenu/Test78/test; do
    echo "等待 nodejs-app-1 启动..."
    sleep 5
done

echo "nodejs-app-1 已经准备就绪"

# 等待一段时间确保服务稳定
sleep 10

# 更新第二个服务实例
echo "正在停止并更新 nodejs-app-2..."
docker-compose stop nodejs-app-2
sleep 5
docker-compose pull nodejs-app-2
docker-compose up -d nodejs-app-2

echo "等待 nodejs-app-2 启动并健康检查通过..."
until curl -sf http://localhost:8082/Api7822/TestMenu/Test78/test; do
    echo "等待 nodejs-app-2 启动..."
    sleep 5
done

echo "nodejs-app-2 已经准备就绪"

echo "滚动更新完成！所有服务均已更新并运行中。"