#!/bin/bash

# 启动MariaDB服务
echo "🚀 启动MariaDB服务..."
service mariadb start
sleep 5

# 检查服务状态
if service mariadb status > /dev/null; then
    echo "✅ MariaDB服务启动成功"
else
    echo "❌ MariaDB服务启动失败"
    exit 1
fi

# 启动Memcached服务
echo "🚀 启动Memcached服务..."
service memcached start
sleep 2

if service memcached status > /dev/null; then
    echo "✅ Memcached服务启动成功"
else
    echo "❌ Memcached服务启动失败"
    exit 1
fi

# 启动Redis服务
echo "🚀 启动Redis服务..."
service redis-server start
sleep 2

if service redis-server status > /dev/null; then
    echo "✅ Redis服务启动成功"
else
    echo "❌ Redis服务启动失败"
    exit 1
fi

echo "🎉 所有服务均已启动完成！"