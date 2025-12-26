"""
WorkflowDB类 - 用于映射workflow_instance表的字段
"""

import json
from datetime import datetime


class WorkflowDB:
    """
    WorkflowDB数据库模型类，严格映射workflow_instance表的字段
    用于定义工作流实例的数据库模型
    """
    
    def __init__(self, json_data=None):
        """
        初始化WorkflowDB实例
        严格按照workflow_instance表结构进行字段映射
        
        :param json_data: 可选的JSON字典数据，用于初始化实例
        """
        # 初始化所有字段为默认值
        
        # 插入时必须的字段
        self.cid = ""  # 公司/组织ID
        self.uid = ""  # 用户ID
        self.idworkflow = ""  # 工作流定义ID
        self.apiv = ""  # API版本
        self.apisys = ""  # API系统目录
        self.apiobj = ""  # API对象
        self.state = "running"  # 实例状态: running运行中, completed已完成, failed失败, cancelled已取消
        self.priority = 0  # 优先级，数字越小优先级越高
        
        # 时间信息
        self.starttime = datetime.now().strftime("%Y-%m-%d %H:%M:%S")  # 开始时间
        self.endtime = "1900-01-01 00:00:00"  # 结束时间
        self.lastruntime = "1900-01-01 00:00:00"  # 最后运行时间
        self.lasterrortime = "1900-01-01 00:00:00"  # 最后错误时间
        self.lastoktime = "1900-01-01 00:00:00"  # 最后成功时间
        
        # 数据
        self.inputdata = json.dumps({})  # 输入数据，JSON格式
        self.outputdata = json.dumps({})  # 输出数据，JSON格式
        
        # 执行信息
        self.currenttask = ""  # 当前任务
        self.currenttaskindex = 0  # 当前任务索引
        self.runningstatus = ""  # 运行状态
        self.maxcopy = 1  # 最大并发数
        self.currentcopy = 0  # 当前并发数
        
        # 错误信息
        self.lasterrinfo = ""  # 错误信息
        self.lastokinfo = ""  # 成功信息
        self.errsec = 0  # 错误秒数
        
        # 统计
        self.successcount = 0  # 成功次数
        self.runcount = 0  # 总运行次数
        self.successrate = 0.0  # 成功率
        self.errorcount = 0  # 错误次数
        
        # 财务
        self.actualcost = 0.0  # 实际成本
        self.actualrevenue = 0.0  # 实际收入
        self.actualprofit = 0.0  # 实际利润
        self.executiontime = 0.0  # 执行时间
        
        # 工作流定义字段
        self.flowschema = json.dumps({})  # 工作流定义，JSON格式
        
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
            "idworkflow": self.idworkflow,
            "apiv": self.apiv,
            "apisys": self.apisys,
            "apiobj": self.apiobj,
            "state": self.state,
            "priority": self.priority,
            
            # 时间信息
            "starttime": self.starttime,
            "endtime": self.endtime,
            "lastruntime": self.lastruntime,
            "lasterrortime": self.lasterrortime,
            "lastoktime": self.lastoktime,
            
            # 数据
            "inputdata": self.inputdata,
            "outputdata": self.outputdata,
            
            # 执行信息
            "currenttask": self.currenttask,
            "currenttaskindex": self.currenttaskindex,
            "runningstatus": self.runningstatus,
            "maxcopy": self.maxcopy,
            "currentcopy": self.currentcopy,
            
            # 错误信息
            "lasterrinfo": self.lasterrinfo,
            "lastokinfo": self.lastokinfo,
            "errsec": self.errsec,
            
            # 统计
            "successcount": self.successcount,
            "runcount": self.runcount,
            "successrate": self.successrate,
            "errorcount": self.errorcount,
            
            # 财务
            "actualcost": self.actualcost,
            "actualrevenue": self.actualrevenue,
            "actualprofit": self.actualprofit,
            "executiontime": self.executiontime,
            
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
            "remark6": self.remark6,
            "flowschema": self.flowschema
        }
    
    def update_status(self, new_state, execution_time=0.0, error_info="", success_info=""):
        """
        更新工作流实例状态
        
        :param new_state: 新的状态
        :param execution_time: 执行时间(秒)
        :param error_info: 错误信息
        :param success_info: 成功信息
        """
        self.state = new_state
        self.uptime = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        self.lastruntime = self.uptime
        
        if execution_time > 0:
            self.executiontime += execution_time
            self.runcount += 1
        
        if new_state == "completed":
            self.endtime = self.uptime
            self.lastoktime = self.uptime
            self.successcount += 1
            if error_info:
                self.lasterrinfo = error_info
            if success_info:
                self.lastokinfo = success_info
        elif new_state == "failed":
            self.endtime = self.uptime
            self.lasterrortime = self.uptime
            self.errorcount += 1
            if error_info:
                self.lasterrinfo = error_info
        elif new_state == "cancelled":
            self.endtime = self.uptime
        
        # 更新成功率
        if self.runcount > 0:
            self.successrate = round(self.successcount / self.runcount, 4)
    
    def update_current_task(self, task_name, task_index):
        """
        更新当前执行的任务信息
        
        :param task_name: 任务名称
        :param task_index: 任务索引
        """
        self.currenttask = task_name
        self.currenttaskindex = task_index
        self.runningstatus = f"executing_task_{task_index}"
        self.uptime = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        self.lastruntime = self.uptime
    
    def get_tasks_from_flowschema(self):
        """
        从flowschema字段解析出工作流的所有任务
        
        :return: 任务列表，每个任务包含任务ID、名称、处理器等信息
        """
        try:
            schema = json.loads(self.flowschema)
            tasks = schema.get('tasks', [])
            return tasks
        except json.JSONDecodeError:
            return []
    
    def __str__(self):
        """
        返回对象的字符串表示
        """
        return f"WorkflowDB(id={self.id}, workflow_id={self.idworkflow}, state={self.state}, priority={self.priority})"