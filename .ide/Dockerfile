# 可将 node 替换为需要的基础镜像
FROM node:24

RUN curl -fsSL https://code-server.dev/install.sh | sh \
  && code-server --install-extension cnbcool.cnb-welcome \
  && code-server --install-extension anthropic.claude-code \
  && code-server --install-extension marscode.marscode-extension \  
  && echo done  

# 安装 ssh 服务，用于支持 VSCode 等客户端通过 Remote-SSH 访问开发环境（也可按需安装其他软件）
RUN apt-get update && apt-get install -y git wget unzip openssh-server build-essential

# 安装 typescript 和 pnpm
RUN npm install -g typescript pnpm ts-node cross-env nodemon node-gyp  

# 安装 MariaDB 客户端和服务端（替代MySQL）
RUN apt-get update && apt-get install -y mariadb-client mariadb-server

# 安装 Memcached
RUN apt-get update && apt-get install -y memcached

# 安装 Redis
RUN apt-get update && apt-get install -y redis-server

RUN npm install -g @anthropic-ai/claude-code 

WORKDIR /workspace

# 创建Claude Code上下文存储目录（项目内.claude，云环境重启后通过Git恢复）
RUN mkdir -p /workspace/.claude/{cache,config,history,project_cache}

# 设置环境变量：重定向Claude Code上下文路径到 /workspace/.claude（云环境唯一可写目录）
ENV CLAUDE_HOME="/workspace/.claude" \
    # 配置文件路径（含安装方式、主题等，非敏感）
    CLAUDE_CONFIG_PATH="/workspace/.claude/config.json" \
    # 对话历史路径（记录用户指令和AI回复）
    CLAUDE_HISTORY_PATH="/workspace/.claude/history.json" \
    # 项目上下文缓存（自动扫描的项目结构、代码风格等）
    CLAUDE_PROJECT_CACHE="/workspace/.claude/project_cache" \
    # 强制使用XDG标准路径（覆盖默认~/.claude）
    XDG_CONFIG_HOME="/workspace/.claude" \
    # 字符集支持中文输入（保留原配置）
    LANG=C.UTF-8 \
    LANGUAGE=C.UTF-8
# ==============================================
# 6. 配置国产大模型API（以月之暗面Kimi为例，免官方订阅费）
# ==============================================
# API Key通过云环境启动时注入（避免硬编码泄露），这里仅配置端点和模型
ENV ANTHROPIC_BASE_URL="https://api.xiaomimimo.com/anthropic" \
    ANTHROPIC_MODEL="mimo-v2-flash" \
    ANTHROPIC_AUTH_TOKEN=""

# ==============================================
# 7. 初始化Claude Code配置（避免首次启动弹窗）
# ==============================================
# 提前写入配置文件（安装方式、主题、终端设置），跳过交互式配置
RUN echo '{"installationMethod": "npm-global","theme": "dark","terminalSetup": {"shiftEnterNewline": true},"lastUsedModel": "kimi-k2-0905-preview"}' > ${CLAUDE_CONFIG_PATH}


# 指定字符集支持命令行输入中文（根据需要选择字符集）
ENV LANG C.UTF-8
ENV LANGUAGE C.UTF-8