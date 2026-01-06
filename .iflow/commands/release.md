---
name: release
description: "自动发布流程：git提交、合并到main、版本更新"
workflow_trigger: /release
agent_path: .iflow/agents/release
---

# 发布流程指令

请执行以下发布流程：

## 步骤1: Git 提交
1. 检查当前分支是否为 develop
2. 查看是否有未提交的更改
3. 如果有更改，添加所有文件并提交（提交信息从用户输入获取，会自动添加 "ai" 前缀）

## 步骤2: 合并到 main 分支
1. 执行 `npm run dev:main` 合并 develop 到 main
2. 推送到远程 main 分支

## 步骤3: 版本更新
1. 执行 `npm version patch` 更新版本号
2. postversion hook 会自动：
   - 推送标签到远程
   - 同步版本号到 develop 分支

## 注意事项
- 确保在 develop 分支上执行
- TypeScript 编译必须通过
- 提交信息会自动添加 "ai" 前缀，要清晰描述更改内容

用户的具体需求：
{{user_input}}