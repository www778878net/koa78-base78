# 可将 node 替换为需要的基础镜像
FROM node:24

RUN curl -fsSL https://code-server.dev/install.sh | sh \
  && code-server --install-extension cnbcool.cnb-welcome \
  && code-server --install-extension Alibaba-Cloud.tongyi-lingma \
  && echo done  

# 安装 ssh 服务，用于支持 VSCode 等客户端通过 Remote-SSH 访问开发环境（也可按需安装其他软件）
RUN apt-get update && apt-get install -y git wget unzip openssh-server build-essential

# 安装 typescript 和 pnpm
RUN npm install -g typescript pnpm

# 安装 MariaDB 客户端和服务端（替代MySQL）
RUN apt-get update && apt-get install -y mariadb-client mariadb-server

# 安装 Memcached
RUN apt-get update && apt-get install -y memcached

# 安装 Redis
RUN apt-get update && apt-get install -y redis-server

# 指定字符集支持命令行输入中文（根据需要选择字符集）
ENV LANG C.UTF-8
ENV LANGUAGE C.UTF-8