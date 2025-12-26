"""
Agent类 - 继承AgentDB实现基本运行时功能
"""

from .agent_db import AgentDB
import asyncio


class Agent(AgentDB):
    """
    Agent类，继承AgentDB，添加基本运行时逻辑
    """
    
    def __init__(self, agentname="", max_tasks=10):
        """
        初始化Agent实例
        
        :param agentname: Agent名称
        :param max_tasks: 最大任务数（运行时参数，非数据库字段）
        """
        # 调用父类的初始化方法
        super().__init__({"agentname": agentname})
        
        # Agent运行时状态（非数据库字段）
        self.current_task_ids = []  # 当前正在执行的任务ID列表
        self.tasknow = 0  # 当前任务数（运行时字段）
        self.copynow = 0  # 当前并发数（运行时字段）
        self.max_tasks = max_tasks  # 最大任务数（运行时字段）
    
    def can_accept_task(self):
        """
        检查是否可以接受新任务
        """
        return self.tasknow < self.max_tasks and self.copynow < self.maxcopy
    
    def assign_task(self, task_id):
        """
        分配任务给此Agent
        返回布尔值表示是否成功分配
        """
        if not self.can_accept_task():
            print(f"Agent {self.agentname} 无法接受新任务")
            return False
        
        self.current_task_ids.append(task_id)
        self.tasknow += 1
        self.copynow += 1
        self.state = "busy" if self.tasknow >= self.max_tasks or self.copynow >= self.maxcopy else "running_with_capacity"
        
        print(f"任务 {task_id} 已分配给 Agent {self.agentname}")
        return True
    
    def complete_task(self, task_id):
        """
        完成任务
        """
        if task_id in self.current_task_ids:
            self.current_task_ids.remove(task_id)
            self.tasknow -= 1
            self.copynow -= 1
            
            # 更新状态
            self.state = "idle" if self.tasknow == 0 and self.copynow == 0 else "running_with_capacity"
            
            print(f"任务 {task_id} 在 Agent {self.agentname} 上完成")
        else:
            print(f"任务 {task_id} 未分配给 Agent {self.agentname}")
    
    def get_status(self):
        """
        获取Agent状态信息
        """
        return {
            "agentname": self.agentname,
            "state": self.state,
            "current_task_ids": self.current_task_ids
        }
    
    async def execute_handler(self, handler_name, *args, **kwargs):
        """
        执行指定名称的handler
        :param handler_name: handler名称（数据库中的主标识）
        :param args: 传递给函数的位置参数
        :param kwargs: 传递给函数的关键字参数
        :return: 执行结果
        """
        print(f"[AGENT] 执行处理器: {handler_name}")
        print(f"[AGENT] 位置参数: {args}")
        print(f"[AGENT] 关键字参数: {kwargs}")
        
        # 从handlers列表中查找指定名称的handler
        target_handler = None
        print(f"[AGENT] 可用处理器列表: {[h.handler for h in self.handlers]}")
        for handler in self.handlers:
            print(f"[AGENT] 检查处理器: {handler.handler}, 状态: {handler.state}")
            if handler.handler == handler_name and handler.state == 'active':
                target_handler = handler
                break
        
        if target_handler is None:
            print(f"[AGENT] 错误: 找不到名为 {handler_name} 的活跃handler")
            raise ValueError(f"找不到名为 {handler_name} 的活跃handler")
        
        print(f"[AGENT] 找到目标处理器: {target_handler.handler}, 能力: {target_handler.capability}")
        
        # 默认实现：仅执行回调函数（如果有）
        result = {"status": "success", "message": "默认处理器执行完成"}
        
        # 如果有回调函数，则异步执行回调
        if target_handler.callback:
            print(f"[AGENT] 执行回调函数...")
            callback_result = await asyncio.to_thread(target_handler.execute_callback, result, *args, **kwargs)
            print(f"[AGENT] 回调函数执行结果: {callback_result}")
            result = callback_result
        
        print(f"[AGENT] 最终执行结果: {result}")
        return {
            'handler': target_handler.handler,
            'capability': target_handler.capability,
            'result': result
        }
    
    def get_handlers_by_capability(self, capability):
        """
        根据capability获取handlers
        :param capability: 功能类型
        :return: 匹配的handlers列表
        """
        return [h for h in self.handlers if h.capability == capability and h.state == 'active']