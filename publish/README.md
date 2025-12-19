# Node.js 应用滚动更新部署方案

此方案实现了类似 Kubernetes 的滚动更新功能，确保在应用更新过程中服务不中断。

## 目录结构

```
publish/
├── docker-compose.yml     # Docker Compose 配置文件
├── nginx.conf             # NGINX 负载均衡配置（基于原有的完整配置）
├── rolling_update.sh      # 滚动更新脚本
└── README.md              # 部署说明文档
```

## 部署架构

- 2个 Node.js 应用实例 (nodejs-app-1 和 nodejs-app-2)，使用镜像 docker.cnb.cool/778878/logsvc
- 1个 NGINX 负载均衡器
- 健康检查机制确保服务可用性

## 部署步骤

### 初始部署

```bash
# 进入 publish 目录
cd publish

# 启动所有服务
docker-compose up -d
```

### 滚动更新

```bash
# 执行滚动更新脚本
./rolling_update.sh
```

脚本会按以下顺序执行更新：
1. 停止第一个应用实例 (nodejs-app-1)
2. 拉取最新镜像并启动新的应用实例
3. 等待健康检查通过
4. 停止第二个应用实例 (nodejs-app-2)
5. 拉取最新镜像并启动新的应用实例
6. 等待健康检查通过

## 配置说明

### docker-compose.yml
- 配置了两个 Node.js 应用实例，使用指定的 docker 镜像
- 每个实例都有健康检查机制，通过调用 `/Api7822/TestMenu/Test78/test` 接口进行检查
- 使用 bridge 网络确保容器间通信
- NGINX 挂载了自定义配置文件和静态资源目录

### nginx.conf
- 基于您原有的完整 nginx 配置进行修改
- 保留了所有的 `proxy_set_header` 配置，包括 `proxy_set_header x-forwarded-for $clientRealIp;`
- 配置 upstream 负载均衡指向两个 Node.js 容器服务
- 添加了健康检查端点 `/health`，该端点会代理到应用的 `/Api7822/TestMenu/Test78/test` 接口

### rolling_update.sh
- 实现滚动更新逻辑
- 确保每次只更新一个实例
- 等待新实例完全启动并通过健康检查后再更新下一个

## 健康检查端点

应用提供了健康检查功能:
- http://localhost:8081/Api7822/TestMenu/Test78/test (nodejs-app-1)
- http://localhost:8082/Api7822/TestMenu/Test78/test (nodejs-app-2)
- http://localhost/health (通过 NGINX 负载均衡访问任一健康的应用实例)

## 优势

1. **零停机时间**: 在更新过程中始终有一个应用实例在运行
2. **故障恢复**: 如果更新失败，另一个实例仍在运行
3. **渐进式更新**: 可以逐步更新应用，降低风险
4. **保留原配置**: nginx.conf 基于您现有的完整配置，未做不必要的简化
5. **隔离性**: 发布文件与源代码分离，保持项目整洁