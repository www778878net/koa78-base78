"""
工作流系统的工作流类
继承自WorkflowDB，实现工作流的核心功能
"""

import json
from datetime import datetime
from .workflow_db import WorkflowDB


class Workflow(WorkflowDB):
    """
    工作流类，实现工作流的核心功能
    """
    
    def __init__(self, workflow_id, instance_id, workflow_name, input_data=None, flowschema=None, **kwargs):
        """
        初始化工作流
        
        :param workflow_id: 工作流定义ID
        :param instance_id: 工作流实例ID
        :param workflow_name: 工作流名称
         :param input_data: 工作流输入数据 
        :param flowschema: 工作流定义JSON（可选）
        :param kwargs: 其他WorkflowDB所需的参数
        """
        # 构建初始化JSON数据
        json_data = {
            'id': instance_id,
            'idworkflow': workflow_id,
            'state': 'running'
        }
        
        # 处理输入数据
        if input_data is not None:
            json_data['inputdata'] = json.dumps(input_data) if isinstance(input_data, dict) else input_data
        
        # 处理工作流定义
        if flowschema is not None:
            json_data['flowschema'] = json.dumps(flowschema) if isinstance(flowschema, dict) else flowschema
        
        # 添加其他参数
        json_data.update(kwargs)
        
        # 调用父类WorkflowDB的初始化方法
        super().__init__(json_data)
        
        # 运行时状态（非数据库字段）
        self.status = "created"  # created, running, completed, failed, cancelled
        self.tasks = []  # 任务列表
        self.current_task = None  # 当前执行的任务实例
        self.task_results = {}  # 任务执行结果
        self.errors = []  # 执行错误列表
        
        # 如果提供了flowschema，自动加载任务
        if flowschema:
            self.load_tasks_from_flowschema()
    
    def add_task(self, task):
        """
    添加任务到工作流
    
    :param task: Task实例
    """
        self.tasks.append(task)
        # 设置任务的工作流实例ID
        task.idworkflowinstance = self.id
    
    def execute(self, agent=None):
        """
    执行工作流，支持条件任务流转
    
    :param agent: 执行任务的Agent实例（可选）
    :return: 执行结果
    """
        print(f"执行工作流: {self.idworkflow} (ID: {self.id})")
        self.status = "running"
        
        try:
            # 更新状态到数据库
            self.update_status("running")
            
            # 创建任务ID到任务对象的映射
            task_map = {task.id: task for task in self.tasks}
            
            # 创建已执行任务集合
            executed_tasks = set()
            
            # 创建任务队列，初始包含所有没有前置任务的任务
            task_queue = []
            
            # 简单实现：假设第一个任务是初始任务
            # 更复杂的实现需要检测任务的依赖关系
            if self.tasks:
                task_queue.append(self.tasks[0])
            
            # 执行任务直到队列为空
            while task_queue:
                # 获取当前任务
                task = task_queue.pop(0)
                
                # 如果任务已经执行过，跳过
                if task.id in executed_tasks:
                    continue
                    
                print(f"\n执行任务: {task.taskname} (ID: {task.id})")
                
                # 更新当前任务信息
                self.update_current_task(task.taskname, list(task_map.keys()).index(task.id))
                
                # 执行任务
                result = task.execute(agent)
                
                # 保存任务结果
                self.task_results[task.id] = result
                
                # 标记任务为已执行
                executed_tasks.add(task.id)
                
                # 检查任务执行状态
                if task.status == "failed":
                    self.status = "failed"
                    self.errors.append(f"任务 {task.taskname} 执行失败: {task.error}")
                    # 更新状态到数据库
                    self.update_status("failed", error_info=f"任务 {task.taskname} 执行失败")
                    break
                
                # 根据条件表达式确定下一个要执行的任务
                # 构建上下文数据
                context_data = {
                    'task_result': result,
                    'task_results': self.task_results,
                    # 'workflow': self
                }
                next_task_ids = task.evaluate_conditions(context_data)
                
                # 将符合条件的下一个任务添加到队列
                for next_task_id in next_task_ids:
                    if next_task_id in task_map and next_task_id not in executed_tasks:
                        next_task = task_map[next_task_id]
                        task_queue.append(next_task)
                        print(f"任务 {task.taskname} 完成，根据条件流转到任务 {next_task.taskname}")
            
            # 如果所有任务都成功完成
            if self.status == "running":
                self.status = "completed"
                # 更新输出数据
                self.outputdata = json.dumps(self.task_results)
                # 更新状态到数据库
                self.update_status("completed", success_info="所有任务执行完成")
            
            print(f"\n工作流 {self.idworkflow} (ID: {self.id}) 执行{self.status}")
            
        except Exception as e:
            self.status = "failed"
            error_msg = str(e)
            self.errors.append(error_msg)
            # 更新状态到数据库
            self.update_status("failed", error_info=error_msg)
            print(f"\n工作流 {self.idworkflow} (ID: {self.id}) 执行失败: {error_msg}")
        
        return self.status
    
    def cancel(self):
        """
    取消工作流
    """
        self.status = "cancelled"
        # 更新状态到数据库
        self.update_status("cancelled")
        print(f"工作流 {self.idworkflow} (ID: {self.id}) 已取消")
    
    def get_status(self):
        """
    获取工作流状态信息
    
    :return: 工作流状态字典
    """
        return {
            "id": self.id,
            "workflow_id": self.idworkflow,
            "state": self.state,
            "status": self.status,
            "current_task": self.currenttask,
            "current_task_index": self.currenttaskindex,
            "running_status": self.runningstatus,
            "tasks_count": len(self.tasks),
            "start_time": self.starttime,
            "end_time": self.endtime if self.endtime != "1900-01-01 00:00:00" else None,
            "errors": self.errors
        }
    
    def get_task_results(self):
        """
        获取所有任务的执行结果
        
        :return: 任务结果字典
        """
        return self.task_results
    
    def load_tasks_from_flowschema(self):
        """
        从flowschema字段加载工作流任务
        
        :return: 加载的任务数量
        """
        from .task import Task
        
        try:
            # 解析flowschema
            schema = json.loads(self.flowschema)
            tasks_data = schema.get('tasks', [])
            
            # 清空现有任务列表
            self.tasks = []
            
            # 创建每个任务
            for task_data in tasks_data:
                # 构建任务参数
                task_params = {
                    'task_id': task_data.get('id'),
                    'task_name': task_data.get('name'),
                    'handler_name': task_data.get('handler'),
                    'input_data': task_data.get('input_data', {})
                }
                
                # 添加条件流转信息
                if 'next_tasks' in task_data:
                    task_params['next_tasks'] = task_data['next_tasks']
                if 'conditions' in task_data:
                    task_params['conditions'] = task_data['conditions']
                # 支持直接加载transitions配置
                if 'transitions' in task_data:
                    task_params['transitions'] = task_data['transitions']
                
                # 创建Task实例
                task = Task(**task_params)
                
                # 添加到工作流
                self.add_task(task)
            
            print(f"从flowschema加载了 {len(self.tasks)} 个任务")
            return len(self.tasks)
            
        except json.JSONDecodeError as e:
            print(f"解析flowschema失败: {e}")
            return 0
        except Exception as e:
            print(f"从flowschema加载任务失败: {e}")
            return 0
    
    def __str__(self):
        """
        返回对象的字符串表示
        """
        return f"Workflow(id={self.id}, workflow_id={self.idworkflow}, state={self.state}, tasks={len(self.tasks)})"