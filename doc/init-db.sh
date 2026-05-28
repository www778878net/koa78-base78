#!/bin/bash

# 检查是否已经初始化过数据库
if mysql -uroot -prootpassword -e "USE testdb; SELECT COUNT(*) FROM companys;" > /dev/null 2>&1; then
    echo "✅ 数据库已经初始化过了，跳过初始化步骤"
    exit 0
fi

# 启动MariaDB服务
echo "🚀 启动MariaDB服务..."
service mariadb start
sleep 5

# 设置root密码
echo "🔐 设置root密码..."
mysql_secure_installation <<EOF

y
rootpassword
rootpassword
y
y
y
y
EOF
 
# 修改MariaDB配置以允许远程连接
echo "🔧 修改MariaDB配置以允许远程连接..."
# 注释掉原来的bind-address并设置为0.0.0.0
sed -i 's/bind-address\s*=\s*127.0.0.1/#bind-address = 127.0.0.1\nbind-address = 0.0.0.0/' /etc/mysql/mariadb.conf.d/50-server.cnf
# 启用skip-name-resolve以提高连接速度
sed -i 's/#skip-name-resolve/skip-name-resolve/' /etc/mysql/mariadb.conf.d/50-server.cnf

# 重启MariaDB服务使配置生效
echo "🔄 重启MariaDB服务以应用配置..."
service mariadb restart
sleep 5

# 创建数据库
echo "📊 创建testdb数据库..."
mysql -uroot -prootpassword -e "CREATE DATABASE IF NOT EXISTS testdb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 授权用户
echo "🔑 授权root用户访问..."
mysql -uroot -prootpassword -e "GRANT ALL PRIVILEGES ON testdb.* TO 'root'@'%' IDENTIFIED BY 'rootpassword'; FLUSH PRIVILEGES;"

# 为root用户创建可以从任意主机连接的账户
mysql -S /run/mysqld/mysqld.sock -u root -prootpassword -e "CREATE USER IF NOT EXISTS 'root'@'%' IDENTIFIED BY 'rootpassword'; GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' WITH GRANT OPTION; FLUSH PRIVILEGES;"

# 修改testdb.sql文件中的collation以兼容当前版本的MariaDB
echo "🔄 修改SQL文件以兼容当前数据库版本..."
sed -i 's/utf8mb4_0900_ai_ci/utf8mb4_unicode_ci/g' /workspace/other/koa78base/doc/testdb.sql

# 导入数据库结构和数据
echo "💾 导入数据库结构和数据..."
mysql -uroot -prootpassword testdb < /workspace/other/koa78base/doc/testdb.sql

echo "✅ 数据库初始化完成！"
echo "🔗 连接信息："
echo "   Host: localhost"
echo "   Port: 3306"
echo "   User: root"
echo "   Password: rootpassword"
echo "   Database: testdb"