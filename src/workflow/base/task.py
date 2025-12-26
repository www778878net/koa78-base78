"""
工作流系统的任务类
继承自TaskDB，实现工作流任务的核心功能
"""

import json
import asyncio
from datetime import datetime
from .task_db import TaskDB


class Task(TaskDB):
    """
    任务类，实现工作流任务的核心功能，支持条件流转
    """
    
    def __init__(self, task_id, task_name, task_function=None, handler_name=None, input_data=None, next_tasks=None, conditions=None, transitions=None, **kwargs):
        """
        初始化任务
        
        :param task_id: 任务ID
        :param task_name: 任务名称
        :param task_function: 任务执行的函数
        :param handler_name: 要执行的Handler名称（与Agent配合使用）
        :param input_data: 任务输入数据
        :param next_tasks: 下一个可能执行的任务ID列表
        :param conditions: 条件表达式字典，key为下一个任务ID，value为条件表达式字符串
        :param transitions: 状态转换映射，可直接从外部输入（如flowschema）
        :param kwargs: 其他TaskDB所需的参数
        """
        # 构建初始化JSON数据
        json_data = {
            'id': task_id,
            'taskname': task_name,
            'handler': handler_name
        }
        
        # 处理输入数据
        if input_data is not None:
            json_data['inputdata'] = json.dumps(input_data) if isinstance(input_data, dict) else input_data
        
        # 添加其他参数
        json_data.update(kwargs)
        
        # 调用父类TaskDB的初始化方法
        super().__init__(json_data)
        
        # 运行时状态（非数据库字段）
        self.status = "created"  # created, running, completed, failed
        self.result = None
        self.error = None
        self.task_function = task_function
        self.handler_name = handler_name  # 保持向后兼容的属性
        
        # 支持条件流转的属性
        # 现在直接使用transitions属性作为唯一的条件流转机制
        # 直接使用transitions属性的示例（推荐）：
        # task.transitions = { 
        #     "task_success": { 
        #         "condition": "result['status'] == 'success'", 
        #         "task_id": "task_success" 
        #     }, 
        #     "task_failure": { 
        #         "condition": "result['status'] == 'failure'", 
        #         "task_id": "task_failure" 
        #     } 
        # }
        
        # 如果提供了transitions，则直接使用
        # 否则从next_tasks和conditions参数构建（向后兼容）
        if transitions:
            self.transitions = transitions
        else:
            self.transitions = self._build_transitions(next_tasks, conditions)
            
    @property
    def transitions(self):
        """
        获取状态转换映射
        """
        return getattr(self, '_transitions', {})
        
    @transitions.setter
    def transitions(self, value):
        """
        设置状态转换映射
        """
        self._transitions = value if value else {}
        
    @property
    def next_tasks(self):
        """
        获取下一个可能执行的任务ID列表（向后兼容）
        """
        return [transition['task_id'] for transition in self.transitions.values()]
        
    @next_tasks.setter
    def next_tasks(self, value):
        """
        设置下一个可能执行的任务ID列表，并更新状态转换映射（向后兼容）
        """
        value = value if value else []
        # 保存现有条件
        existing_conditions = {}
        for transition in self.transitions.values():
            if transition['condition']:
                existing_conditions[transition['task_id']] = transition['condition']
        
        # 重建transitions
        new_transitions = {}
        for task_id in value:
            new_transitions[task_id] = {
                'condition': existing_conditions.get(task_id, None),
                'task_id': task_id
            }
        self.transitions = new_transitions
        
    @property
    def conditions(self):
        """
        获取条件表达式字典（向后兼容）
        """
        conditions = {}
        for transition in self.transitions.values():
            if transition['condition']:
                conditions[transition['task_id']] = transition['condition']
        return conditions
        
    @conditions.setter
    def conditions(self, value):
        """
        设置条件表达式字典，并更新状态转换映射（向后兼容）
        """
        value = value if value else {}
        # 更新现有transitions的条件
        for task_id, condition in value.items():
            if task_id in self.transitions:
                self.transitions[task_id]['condition'] = condition
            else:
                # 如果任务ID不在transitions中，添加它
                self.transitions[task_id] = {
                    'condition': condition,
                    'task_id': task_id
                }
    
    async def execute(self, agent=None):
        """
        执行任务
        
        :param agent: 执行任务的Agent实例（可选）
        :return: 执行结果
        """
        print(f"执行任务: {self.taskname} (ID: {self.id})")
        self.status = "running"
        
        try:
            # 支持两种执行方式：通过Agent执行Handler或直接执行函数
            if agent and self.handler:
                print(f"通过Agent执行Handler {self.handler}")
                # 获取输入数据
                input_data = json.loads(self.inputdata) if isinstance(self.inputdata, str) else self.inputdata
                self.result = await agent.execute_handler(self.handler, **input_data)
            elif self.task_function:
                print(f"直接执行任务函数")
                # 获取输入数据
                input_data = json.loads(self.inputdata) if isinstance(self.inputdata, str) else self.inputdata
                # 将输入数据传递给任务函数
                # 如果task_function是协程函数，则等待执行
                if asyncio.iscoroutinefunction(self.task_function):
                    self.result = await self.task_function(input_data)
                else:
                    self.result = self.task_function(input_data)
            else:
                print(f"任务 {self.taskname} 没有执行逻辑，标记为完成")
                self.result = None
            
            self.status = "completed"
            # 更新数据库状态
            self.state = "completed"
            self.endtime = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            self.outputdata = json.dumps(self.result) if self.result is not None else json.dumps({})
            print(f"任务 {self.taskname} 执行完成")
            
        except Exception as e:
            self.status = "failed"
            self.error = str(e)
            # 更新数据库状态
            self.state = "failed"
            self.endtime = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            self.lasterrinfo = str(e)
            print(f"任务 {self.taskname} 执行失败: {str(e)}")
            self.result = None
        
        return self.result
    
    def get_status(self):
        """
        获取任务状态信息
        
        :return: 任务状态字典
        """
        return {
            "task_id": self.id,
            "task_name": self.taskname,
            "status": self.status,
            "db_state": self.state,
            "progress": self.progress,
            "result": self.result,
            "error": self.error
        }
    
    def _build_transitions(self, next_tasks=None, conditions=None):
        """
        构建状态转换映射，解析条件表达式
        
        :param next_tasks: 下一个可能执行的任务ID列表
        :param conditions: 条件表达式字典
        :return: 转换映射字典
        """
        next_tasks = next_tasks if next_tasks else []
        conditions = conditions if conditions else {}
        
        transitions = {}
        for next_task_id in next_tasks:
            # 如果有条件表达式，添加到映射中
            if next_task_id in conditions:
                transitions[next_task_id] = {
                    'condition': conditions[next_task_id],
                    'task_id': next_task_id
                }
            else:
                # 没有条件的默认转换
                transitions[next_task_id] = {
                    'condition': None,
                    'task_id': next_task_id
                }
        return transitions
        
    def evaluate_conditions(self, workflow_data=None):
        """
        评估条件，确定下一个要执行的任务ID列表
        
        :param workflow_data: 工作流数据上下文，用于条件表达式的评估
        :return: 满足条件的下一个任务ID列表
        """
        if not self.transitions:
            return []  # 没有下一个任务
            
        # 评估条件表达式
        result = []
        for transition_info in self.transitions.values():
            next_task_id = transition_info['task_id']
            condition = transition_info['condition']
            
            try:
                # 使用工作流数据作为上下文评估条件表达式
                # 确保condition不为None
                if condition:
                    if workflow_data:
                        if eval(condition, {}, workflow_data):
                            result.append(next_task_id)
                    else:
                        # 如果没有工作流数据，只有当条件表达式本身为True时才执行
                        if eval(condition):
                            result.append(next_task_id)
                else:
                    # 条件为空，默认执行
                    result.append(next_task_id)
            except Exception as e:
                # 条件表达式评估失败，默认不执行该任务
                print(f"条件表达式评估失败: {condition}, 错误: {e}")
                continue
                
        return result
    
    def __str__(self):
        """
        返回任务的字符串表示
        """
        return f"Task({self.id}: {self.taskname}, status={self.status}, db_state={self.state})"