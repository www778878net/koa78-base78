FROM node:20-slim

WORKDIR /app

# 先复制依赖声明文件
COPY package.json ./

# 安装所有依赖（包括开发依赖）以支持编译
RUN npm install -g pnpm \
    && pnpm install

# 复制其余源代码
COPY . .

# 编译TypeScript
RUN pnpm run build

# 移除开发依赖，只保留生产依赖
RUN pnpm install --prod

# 暴露端口
EXPOSE 88

# 容器启动时运行的命令，支持通过环境变量指定配置文件
CMD ["sh", "-c", "node ./dist/index.js"]