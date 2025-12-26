"""
Handler类 - 用于映射workflow_handler表的字段
"""


class Handler:
    """
    Handler数据库模型类，映射workflow_handler表的字段
    用于定义Agent支持的具体处理函数
    """
    
    def __init__(self, json_data=None):
        """
        初始化Handler实例
        
        :param json_data: 可选的JSON字典数据，用于初始化实例
        """
        # 基本信息字段
        self.cid = ""
        self.apiv = ""
        self.apisys = ""
        self.apiobj = ""
        
        # 关联字段
        self.idagent = ""  # 关联到workflow_agent表的id
        self.idworkflow = ""  # 工作流ID，关联工作流表
        self.handler = ""  # 处理器函数名
        self.capability = ""  # 能力名称，如"文件保存"
        self.description = ""  # 功能描述
        self.state = "active"  # 状态：active(启用), inactive(禁用)
        
        # 价格成本相关字段
        self.pricebase = 1.0  # 基础价格
        self.price = 1.0  # 当前价格
        self.costunit = 0.0  # 单位成本
        self.profittarget = 0.2  # 目标利润率
        self.profittotal = 0.0  # 总利润
        self.costtotal = 0.0  # 总成本
        self.revenuetotal = 0.0  # 总收入
        self.roi = 0.0  # 投资回报率
        
        # 执行统计相关字段
        self.successcount = 0  # 成功执行次数
        self.runcount = 0  # 总执行次数
        self.successrate = 0.0  # 成功率
        self.errorcount = 0  # 错误次数
        
        # 描述信息
        self.costdescription = ""  # 成本描述，如"每万条日志1元"
        self.pricedescription = ""  # 价格描述
        
        # 系统字段
        self.upby = ""
        self.uptime = None  # 这个由数据库自动更新
        self.idpk = None  # 由数据库自动生成
        self.id = None  # 唯一标识符
        
        # 备注字段
        self.remark = ""
        self.remark2 = ""
        self.remark3 = ""
        self.remark4 = ""
        self.remark5 = ""
        self.remark6 = ""
        
        # 回调函数（非数据库字段）
        self.callback = None  # 可选的回调函数
        
        # 如果提供了JSON数据，则使用它初始化实例
        if json_data is not None:
            self.set_from_json(json_data)

    def set_from_json(self, json_data):
        """
        从JSON数据设置属性
        """
        for key, value in json_data.items():
            if hasattr(self, key):
                setattr(self, key, value)
        return self
        
    def get_from_json(self):
        """
        将对象转换为JSON格式
        """
        return {key: value for key, value in self.__dict__.items()}
    
    def set_callback(self, callback_func):
        """
        设置回调函数
        :param callback_func: 回调函数
        """
        self.callback = callback_func
    
    def execute_callback(self, result, *args, **kwargs):
        """
        执行回调函数
        :param result: 前置处理的结果
        :param args: 传递给回调函数的位置参数
        :param kwargs: 传递给回调函数的关键字参数
        :return: 回调函数的执行结果
        """
        if self.callback is not None:
            return self.callback(result, *args, **kwargs)
        return result