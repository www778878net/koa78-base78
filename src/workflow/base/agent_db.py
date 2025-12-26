"""
AgentDB类 - 用于映射workflow_agent表的字段
"""


class AgentDB:
    """
    Agent数据库模型类，映射workflow_agent表的字段
    """
    
    def __init__(self, json_data=None):
        """
        初始化AgentDB实例
        严格按照workflow_agent表结构映射
        
        :param json_data: 可选的JSON字典数据，用于初始化实例
        """
        # 基本信息字段（数据库中必须的字段）
        self.cid = ""
        self.apiv = ""
        self.apisys = ""
        self.apiobj = ""
        self.agentname = ""
        self.description = ""
        self.maxcopy = 1      # 最大并发数
        self.version = "1.0.0"
        self.errsec = 86400   # 多少秒没成功才算失败
        
        # 状态和时间字段
        self.state = "active"  # 状态：active(启用), inactive(禁用)
        self.lastheartbeat = None  # 最后心跳时间，用于监控代理存活状态
        self.currentcopy = 0      # 当前并发数
        
        # 时间和统计字段
        self.lastoktime = None      # 最后成功时间
        self.lastokinfo = ""      # 成功信息
        self.starttime = None
        self.endtime = None
        self.lasterrinfo = ""    # 错误信息
        
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
        self.costdescription = ""  # 成本描述
        self.pricedescription = ""  # 价格描述
        
        # 系统字段
        self.upby = ""
        self.uptime = None  # 由数据库自动更新
        self.idpk = None  # 由数据库自动生成
        self.id = None  # 唯一标识符
        
        # 备注字段
        self.remark = ""
        self.remark2 = ""
        self.remark3 = ""
        self.remark4 = ""
        self.remark5 = ""
        self.remark6 = ""
        
        # 运行时动态字段（不存储在数据库中）
        self.handlers = []  # 存储此Agent支持的handlers
        
        # 检查jsobj字段是否存在，如果不存在则初始化
        if not hasattr(self, 'jsobj'):
            self.jsobj = {}
        if not hasattr(self, 'inputdata'):
            self.inputdata = {}
        if not hasattr(self, 'outputdata'):
            self.outputdata = {}
        
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
        
        # 如果jsobj被更新，也更新inputdata和outputdata
        if 'jsobj' in json_data and isinstance(json_data['jsobj'], dict):
            self.jsobj = json_data['jsobj']
            self.inputdata = self.jsobj.get('inputdata', {})
            self.outputdata = self.jsobj.get('outputdata', {})
        
        return self
        
    def get_from_json(self):
        """
        将对象转换为JSON格式
        确保inputdata和outputdata正确保存到jsobj中
        """
        # 创建当前对象的属性副本
        result = {}
        
        # 获取所有属性
        for key, value in self.__dict__.items():
            # 跳过一些动态计算的属性
            if key not in ['inputdata', 'outputdata']:
                result[key] = value
        
        # 将inputdata和outputdata合并到jsobj中
        self.jsobj['inputdata'] = self.inputdata
        self.jsobj['outputdata'] = self.outputdata
        result['jsobj'] = self.jsobj
        
        return result
    
    def add_handler(self, handler):
        """
        添加一个handler到此Agent
        :param handler: Handler对象
        """
        from .handler import Handler
        if isinstance(handler, Handler):
            # 确保handler的idagent与此agent的id匹配
            handler.idagent = self.id or self.agentname
            self.handlers.append(handler)
        else:
            raise TypeError("handler必须是Handler类的实例")
    
    def get_handlers_by_capability(self, capability):
        """
        根据capability获取handlers
        :param capability: 功能类型
        :return: 匹配的handlers列表
        """
        return [h for h in self.handlers if h.capability == capability and h.state == 'active']
    
    def can_handle(self, capability):
        """
        检查Agent是否能处理特定capability
        :param capability: 功能类型
        :return: 是否能处理
        """
        return len(self.get_handlers_by_capability(capability)) > 0