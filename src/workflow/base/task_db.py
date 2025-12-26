"""
TaskDB类 - 用于映射workflow_task表的字段
"""

import json
from datetime import datetime


class TaskDB:
    """
    TaskDB数据库模型类，严格映射workflow_task表的字段
    用于定义工作流任务实例的数据库模型
    """
    
    def __init__(self, json_data=None):
        """
        初始化TaskDB实例
        严格按照workflow_task表结构进行字段映射
        
        :param json_data: 可选的JSON字典数据，用于初始化实例
        """
        # 初始化所有字段为默认值
        
        # 插入时必须的字段
        self.cid = ""  # 公司/组织ID
        self.uid = ""  # 用户ID
        self.idworkflowinstance = ""  # 工作流实例ID
        self.idworkflowdefinition = ""  # 工作流定义ID
        self.idtaskdefinition = ""  # 任务定义ID
        self.taskname = ""  # 任务名称
        self.handler = ""  # 处理器函数名
        self.idagent = ""  # 执行的Agent ID
        self.state = "pending"  # 任务状态: pending待处理, running运行中, completed已完成, failed失败, cancelled已取消
        self.priority = 99  # 优先级，数字越小优先级越高
        
        # 时间信息
        self.starttime = datetime.now().strftime("%Y-%m-%d %H:%M:%S")  # 开始时间
        self.endtime = "1900-01-01 00:00:00"  # 结束时间
        self.lastruntime = "1900-01-01 00:00:00"  # 最后运行时间
        self.lasterrortime = "1900-01-01 00:00:00"  # 最后错误时间
        self.lastoktime = "1900-01-01 00:00:00"  # 最后成功时间
        self.timeout = "1900-01-01 00:00:00"  # 超时时间
        
        # 数据
        self.inputdata = json.dumps({})  # 输入数据，JSON格式
        self.outputdata = json.dumps({})  # 输出数据，JSON格式
        
        # 执行信息
        self.runningstatus = "idle"  # 运行状态
        self.maxcopy = 1  # 最大并发数
        self.currentcopy = 0  # 当前并发数
        self.progress = 0  # 任务进度（百分比）
        self.retrytimes = 0  # 重试次数
        self.retrylimit = 3  # 最大重试次数
        self.retryinterval = 60  # 重试间隔时间（秒）
        self.maxruntime = 3600  # 最大运行时间（秒）
        
        # 依赖关系
        self.dependencies = json.dumps({})  # 依赖关系，JSON格式
        self.prevtask = ""  # 上一个任务ID
        self.nexttask = ""  # 下一个任务ID
        
        # 错误信息
        self.lasterrinfo = ""  # 错误信息
        self.lastokinfo = ""  # 成功信息
        self.errsec = 0  # 错误秒数
        
        # 统计
        self.successcount = 0  # 成功次数
        self.errorcount = 0  # 错误次数
        self.runcount = 0  # 运行次数
        
        # 财务
        self.actualcost = 0.0  # 实际成本
        self.actualrevenue = 0.0  # 实际收入
        self.actualprofit = 0.0  # 实际利润
        self.executiontime = 0.0  # 执行时间（秒）
        
        # 资源需求
        self.resourcereq = json.dumps({})  # 资源需求，JSON格式
        
        # 系统字段
        self.upby = ""  # 更新人
        self.uptime = datetime.now().strftime("%Y-%m-%d %H:%M:%S")  # 更新时间
        self.idpk = None  # 自增主键
        self.id = ""  # 全局唯一ID
        self.remark = ""  # 备注1
        self.remark2 = ""  # 备注2
        self.remark3 = ""  # 备注3
        self.remark4 = ""  # 备注4
        self.remark5 = ""  # 备注5
        self.remark6 = ""  # 备注6
        
        # 如果提供了JSON数据，则使用它初始化实例
        if json_data is not None:
            self.set_from_json(json_data)
    
    def set_from_json(self, json_data):
        """
        从JSON数据设置实例属性
        :param json_data: JSON字典数据
        :return: self实例（支持链式调用）
        """
        for key, value in json_data.items():
            if hasattr(self, key):
                setattr(self, key, value)
        return self
    
    def get_from_json(self):
        """
        将实例属性转换为JSON字典
        :return: JSON字典
        """
        return {
            # 插入时必须的字段
            "cid": self.cid,
            "uid": self.uid,
            "idworkflowinstance": self.idworkflowinstance,
            "idworkflowdefinition": self.idworkflowdefinition,
            "idtaskdefinition": self.idtaskdefinition,
            "taskname": self.taskname,
            "handler": self.handler,
            "idagent": self.idagent,
            "state": self.state,
            "priority": self.priority,
            
            # 时间信息
            "starttime": self.starttime,
            "endtime": self.endtime,
            "lastruntime": self.lastruntime,
            "lasterrortime": self.lasterrortime,
            "lastoktime": self.lastoktime,
            "timeout": self.timeout,
            
            # 数据
            "inputdata": self.inputdata,
            "outputdata": self.outputdata,
            
            # 执行信息
            "runningstatus": self.runningstatus,
            "maxcopy": self.maxcopy,
            "currentcopy": self.currentcopy,
            "progress": self.progress,
            "retrytimes": self.retrytimes,
            "retrylimit": self.retrylimit,
            "retryinterval": self.retryinterval,
            "maxruntime": self.maxruntime,
            
            # 依赖关系
            "dependencies": self.dependencies,
            "prevtask": self.prevtask,
            "nexttask": self.nexttask,
            
            # 错误信息
            "lasterrinfo": self.lasterrinfo,
            "lastokinfo": self.lastokinfo,
            "errsec": self.errsec,
            
            # 统计
            "successcount": self.successcount,
            "errorcount": self.errorcount,
            "runcount": self.runcount,
            
            # 财务
            "actualcost": self.actualcost,
            "actualrevenue": self.actualrevenue,
            "actualprofit": self.actualprofit,
            "executiontime": self.executiontime,
            
            # 资源需求
            "resourcereq": self.resourcereq,
            
            # 系统字段
            "upby": self.upby,
            "uptime": self.uptime,
            "idpk": self.idpk,
            "id": self.id,
            "remark": self.remark,
            "remark2": self.remark2,
            "remark3": self.remark3,
            "remark4": self.remark4,
            "remark5": self.remark5,
            "remark6": self.remark6
        }
    
    def update_statistics(self, success=True, execution_time=0.0, cost=0.0, revenue=0.0):
        """
        更新任务执行统计信息
        
        :param success: 是否执行成功
        :param execution_time: 执行时间(秒)
        :param cost: 执行成本
        :param revenue: 执行收入
        """
        # 更新执行计数
        self.runcount += 1
        self.executiontime += execution_time
        
        # 更新财务统计
        self.actualcost += cost
        self.actualrevenue += revenue
        self.actualprofit = self.actualrevenue - self.actualcost
        
        # 更新时间信息
        current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        self.lastruntime = current_time
        
        if success:
            # 更新成功统计
            self.successcount += 1
            self.lastoktime = current_time
            self.lastokinfo = f"执行成功，耗时: {execution_time:.2f}秒"
        else:
            # 更新失败统计
            self.errorcount += 1
            self.lasterrortime = current_time
            self.lasterrinfo = f"执行失败，耗时: {execution_time:.2f}秒"
    
    def to_task_instance(self):
        """
        将TaskDB实例转换为Task运行时实例
        
        :return: Task实例
        """
        from .task import Task
        
        # 创建Task实例，传递必要的运行时参数
        task = Task(
            task_id=self.id or self.taskname,
            task_name=self.taskname,
            handler_name=self.handler,
            input_data=json.loads(self.inputdata) if isinstance(self.inputdata, str) else self.inputdata
        )
        
        return task
    
    def __str__(self):
        """
        返回任务实例的字符串表示
        """
        return f"TaskDB(id={self.id}, name={self.taskname}, workflow_instance={self.idworkflowinstance}, state={self.state})"