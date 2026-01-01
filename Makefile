# 变量定义
SHELL := powershell.exe
.SHELLFLAGS := -NoProfile -Command
NODE := node
NPX := npx
PNPM := pnpm
TSC := tsc
APP_ENV ?= development

# 伪目标
.PHONY: help install build run debug test clean gen

# 帮助信息
help:
	@echo "可用命令:"
	@echo "  make help                - 显示此帮助信息"
	@echo "  make run                - 运行开发环境"
	@echo "  make debug              - 调试开发环境"
	@echo "  make test               - 运行测试"
	@echo "  make clean              - 清理构建文件"
	@echo "  make gen                - 生成Schemas数据结构"
	@echo "  make diskspace          - 查看磁盘空间使用情况"
logsvc:
	ssh root@47.110.76.160
logsvc3:
	& '.\ssh.ps1'
logsvc4:
	bash ./ssh.sh

# 查看磁盘空间使用情况
diskspace:
	df -h
	du -h --max-depth=1 /
	du -h --max-depth=1 /7788
	du -h --max-depth=1 /var/lib/docker


debug-shell:
	@echo Using shell: $(SHELL)
tset1:
	npm run test:dev -- --test/apiwf/basic/demoinit.test.ts