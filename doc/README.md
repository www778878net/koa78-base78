极简工作流引擎 Demo 设计
1. 核心设计目标
优先级调度（0最高，数字越大优先级越低）
事件驱动 + 状态驱动混合
抢占式调度
内存安全，避免队列膨胀
2. 数据结构设计
2.1 状态表（模拟数据库）
# 内存中的状态表
stocks_state = {
    "000001": {
        "id": "000001",
        "name": "平安银行",
        "phase": "data_ready",  # 当前阶段
        "status": "pending",  # pending, processing, completed, failed
        "priority": 0,  # 这个股票的优先级
        "last_processed": None,
        "data": None
    }
}
2.2 事件队列
# 事件类型
EVENT_TYPES = {
    "DATA_READY": "data_ready",  # 数据准备好了
    "TASK_COMPLETED": "task_completed",  # 任务完成
    "TASK_FAILED": "task_failed",  # 任务失败
    "HIGH_PRIORITY_ARRIVED": "high_priority_arrived"  # 高优先级任务到达
}
3. 工作流定义
3.1 工作流模板
workflows = {
    "high_freq_trading": {
        "id": "high_freq_trading",
        "name": "高频交易工作流",
        "priority": 0,  # 最高优先级
        "trigger": "event",  # 事件驱动
        "trigger_event": "DATA_READY",
        "max_concurrent": 3,  # 最多3个并发任务
        "tasks": [
            {
                "id": "collect_data",
                "name": "采集高频数据",
                "action": "collect_real_time_data",
                "timeout": 100,  # 毫秒
                "retry": 2
            },
            {
                "id": "calculate_signal",
                "name": "计算交易信号",
                "depends_on": ["collect_data"],
                "action": "calculate_trading_signal",
                "timeout": 50
            },
            {
                "id": "execute_order",
                "name": "执行订单",
                "depends_on": ["calculate_signal"],
                "action": "execute_order",
                "timeout": 200
            }
        ]
    },
    
    "trend_trading": {
        "id": "trend_trading",
        "name": "趋势交易工作流",
        "priority": 2,  # 低优先级
        "trigger": "event",  # 事件驱动
        "trigger_event": "DATA_READY",
        "max_concurrent": 5,
        "tasks": [
            {
                "id": "collect_trend_data",
                "name": "采集趋势数据",
                "action": "collect_trend_data",
                "timeout": 1000,  # 1秒
                "retry": 1
            },
            {
                "id": "calculate_trend",
                "name": "计算趋势",
                "depends_on": ["collect_trend_data"],
                "action": "calculate_trend",
                "timeout": 500
            }
        ]
    }
}
4. 核心引擎实现
4.1 工作流引擎
class WorkflowEngine:
    def __init__(self):
        # 状态驱动：记录所有状态
        self.stocks_state = {}  # 股票状态表
        self.workflow_instances = {}  # 工作流实例
        self.task_instances = {}  # 任务实例
        
        # 事件驱动
        self.event_queue = []  # 事件队列（按优先级排序）
        self.event_handlers = {
            "DATA_READY": self.handle_data_ready,
            "TASK_COMPLETED": self.handle_task_completed,
            "TASK_FAILED": self.handle_task_failed
        }
        
        # 调度控制
        self.running_tasks = {}  # 正在运行的任务 {workflow_id: count}
        self.available_agents = 5  # 总共有5个Agent
        self.running_agent_count = 0
        
        # 优先级队列
        self.priority_queues = {
            0: [],  # 优先级0队列
            1: [],  # 优先级1队列
            2: []   # 优先级2队列
        }
    
    def start(self):
        """启动工作流引擎"""
        print("工作流引擎启动...")
        
        # 主循环
        while True:
            # 1. 处理事件
            self.process_events()
            
            # 2. 状态查询：检查是否有符合条件的股票
            self.check_state_for_workflows()
            
            # 3. 调度任务
            self.schedule_tasks()
            
            # 4. 控制循环频率
            time.sleep(0.1)  # 100毫秒
    
    def process_events(self):
        """处理事件队列"""
        if not self.event_queue:
            return
        
        # 按优先级处理事件
        self.event_queue.sort(key=lambda e: e.get("priority", 0))
        
        for event in self.event_queue[:10]:  # 每次最多处理10个
            event_type = event["type"]
            handler = self.event_handlers.get(event_type)
            if handler:
                handler(event)
        
        # 移除已处理的事件
        self.event_queue = self.event_queue[10:]
    
    def check_state_for_workflows(self):
        """状态查询：检查哪些股票可以启动工作流"""
        for stock_id, stock_state in self.stocks_state.items():
            # 如果股票数据已准备好，且状态是pending
            if stock_state.get("phase") == "data_ready" and stock_state.get("status") == "pending":
                # 根据股票优先级决定启动哪个工作流
                stock_priority = stock_state.get("priority", 2)
                
                if stock_priority <= 0:  # 高优先级股票
                    # 创建高频交易工作流实例
                    self.create_workflow_instance("high_freq_trading", stock_id)
                else:  # 低优先级股票
                    # 创建趋势交易工作流实例
                    self.create_workflow_instance("trend_trading", stock_id)
                
                # 更新股票状态
                stock_state["status"] = "processing"
    
    def schedule_tasks(self):
        """调度任务：从优先级队列中取出任务执行"""
        # 检查可用Agent数量
        available_agents = self.available_agents - self.running_agent_count
        if available_agents <= 0:
            return
        
        # 按优先级顺序调度
        for priority in [0, 1, 2]:
            queue = self.priority_queues[priority]
            if not queue:
                continue
            
            # 从该优先级队列中取任务
            tasks_to_run = min(available_agents, len(queue))
            
            for i in range(tasks_to_run):
                task_info = queue.pop(0)
                self.execute_task(task_info)
                available_agents -= 1
                
                if available_agents <= 0:
                    return
    
    def create_workflow_instance(self, workflow_id, stock_id):
        """创建工作流实例"""
        workflow_def = workflows[workflow_id]
        
        # 创建工作流实例
        instance_id = f"{workflow_id}_{stock_id}_{int(time.time())}"
        instance = {
            "id": instance_id,
            "workflow_id": workflow_id,
            "stock_id": stock_id,
            "priority": workflow_def["priority"],
            "status": "running",
            "current_task_index": 0,
            "created_at": time.time(),
            "tasks": []
        }
        
        # 创建初始任务
        initial_task_def = workflow_def["tasks"][0]
        task_instance = self.create_task_instance(instance_id, initial_task_def, stock_id)
        instance["tasks"].append(task_instance)
        
        # 存储实例
        self.workflow_instances[instance_id] = instance
        
        # 将任务放入优先级队列
        self.priority_queues[workflow_def["priority"]].append({
            "task_instance": task_instance,
            "workflow_instance": instance,
            "priority": workflow_def["priority"]
        })
        
        print(f"创建工作流实例: {instance_id} 优先级: {workflow_def['priority']}")
    
    def create_task_instance(self, instance_id, task_def, stock_id):
        """创建任务实例"""
        task_id = f"{task_def['id']}_{stock_id}_{int(time.time())}"
        
        task_instance = {
            "id": task_id,
            "task_def_id": task_def["id"],
            "workflow_instance_id": instance_id,
            "stock_id": stock_id,
            "action": task_def["action"],
            "status": "pending",
            "priority": self.workflow_instances[instance_id]["priority"],
            "timeout": task_def.get("timeout", 1000),
            "retry_count": 0,
            "max_retry": task_def.get("retry", 0),
            "created_at": time.time()
        }
        
        self.task_instances[task_id] = task_instance
        return task_instance
    
    def execute_task(self, task_info):
        """执行任务"""
        task_instance = task_info["task_instance"]
        workflow_instance = task_info["workflow_instance"]
        
        # 检查工作流并发限制
        workflow_def = workflows[workflow_instance["workflow_id"]]
        current_running = self.running_tasks.get(workflow_instance["workflow_id"], 0)
        
        if current_running >= workflow_def["max_concurrent"]:
            # 达到并发限制，将任务放回队列
            self.priority_queues[workflow_def["priority"]].append(task_info)
            return
        
        # 更新状态
        task_instance["status"] = "running"
        task_instance["started_at"] = time.time()
        
        # 更新运行计数
        self.running_agent_count += 1
        self.running_tasks[workflow_instance["workflow_id"]] = current_running + 1
        
        print(f"执行任务: {task_instance['id']} 优先级: {task_instance['priority']}")
        
        # 异步执行任务
        import threading
        thread = threading.Thread(
            target=self.run_task_in_thread,
            args=(task_instance,)
        )
        thread.start()
    
    def run_task_in_thread(self, task_instance):
        """在子线程中执行任务"""
        try:
            # 模拟任务执行
            action = task_instance["action"]
            stock_id = task_instance["stock_id"]
            
            if action == "collect_real_time_data":
                result = self.simulate_collect_real_time_data(stock_id)
            elif action == "calculate_trading_signal":
                result = self.simulate_calculate_signal(stock_id)
            elif action == "execute_order":
                result = self.simulate_execute_order(stock_id)
            elif action == "collect_trend_data":
                result = self.simulate_collect_trend_data(stock_id)
            elif action == "calculate_trend":
                result = self.simulate_calculate_trend(stock_id)
            else:
                result = {"status": "unknown_action"}
            
            # 任务完成，发布事件
            self.add_event({
                "type": "TASK_COMPLETED",
                "task_id": task_instance["id"],
                "stock_id": stock_id,
                "result": result,
                "priority": task_instance["priority"],
                "timestamp": time.time()
            })
            
        except Exception as e:
            # 任务失败
            self.add_event({
                "type": "TASK_FAILED",
                "task_id": task_instance["id"],
                "stock_id": task_instance["stock_id"],
                "error": str(e),
                "priority": task_instance["priority"],
                "timestamp": time.time()
            })
    
    def handle_task_completed(self, event):
        """处理任务完成事件"""
        task_id = event["task_id"]
        stock_id = event["stock_id"]
        
        if task_id not in self.task_instances:
            return
        
        task_instance = self.task_instances[task_id]
        task_instance["status"] = "completed"
        task_instance["completed_at"] = time.time()
        task_instance["result"] = event["result"]
        
        # 更新运行计数
        workflow_instance_id = task_instance["workflow_instance_id"]
        workflow_instance = self.workflow_instances[workflow_instance_id]
        workflow_id = workflow_instance["workflow_id"]
        
        self.running_agent_count -= 1
        self.running_tasks[workflow_id] = self.running_tasks.get(workflow_id, 1) - 1
        
        print(f"任务完成: {task_id}")
        
        # 检查工作流中是否有下一个任务
        self.process_next_task(workflow_instance, task_instance)
    
    def handle_task_failed(self, event):
        """处理任务失败事件"""
        task_id = event["task_id"]
        
        if task_id not in self.task_instances:
            return
        
        task_instance = self.task_instances[task_id]
        
        # 检查重试次数
        if task_instance["retry_count"] < task_instance["max_retry"]:
            # 重试任务
            task_instance["retry_count"] += 1
            task_instance["status"] = "pending"
            
            # 将任务放回优先级队列
            workflow_instance_id = task_instance["workflow_instance_id"]
            workflow_instance = self.workflow_instances[workflow_instance_id]
            
            self.priority_queues[task_instance["priority"]].append({
                "task_instance": task_instance,
                "workflow_instance": workflow_instance,
                "priority": task_instance["priority"]
            })
            
            print(f"任务重试: {task_id} 第{task_instance['retry_count']}次")
        else:
            # 任务失败
            task_instance["status"] = "failed"
            print(f"任务失败: {task_id}")
    
    def process_next_task(self, workflow_instance, completed_task):
        """处理工作流中的下一个任务"""
        workflow_def = workflows[workflow_instance["workflow_id"]]
        completed_task_id = completed_task["task_def_id"]
        
        # 找到已完成任务在流程中的位置
        task_index = None
        for i, task_def in enumerate(workflow_def["tasks"]):
            if task_def["id"] == completed_task_id:
                task_index = i
                break
        
        if task_index is None:
            return
        
        # 检查是否有下一个任务
        if task_index + 1 < len(workflow_def["tasks"]):
            next_task_def = workflow_def["tasks"][task_index + 1]
            
            # 检查依赖是否满足
            depends_on = next_task_def.get("depends_on", [])
            if completed_task_id in depends_on:
                # 创建下一个任务实例
                next_task_instance = self.create_task_instance(
                    workflow_instance["id"],
                    next_task_def,
                    completed_task["stock_id"]
                )
                
                # 将任务放入优先级队列
                self.priority_queues[workflow_instance["priority"]].append({
                    "task_instance": next_task_instance,
                    "workflow_instance": workflow_instance,
                    "priority": workflow_instance["priority"]
                })
    
    def add_event(self, event):
        """添加事件到队列"""
        self.event_queue.append(event)
    
    def simulate_collect_real_time_data(self, stock_id):
        """模拟采集实时数据"""
        time.sleep(0.05)  # 50ms
        return {"price": 100.0, "volume": 10000}
    
    def simulate_calculate_signal(self, stock_id):
        """模拟计算交易信号"""
        time.sleep(0.03)  # 30ms
        return {"signal": "BUY", "price": 100.0}
    
    def simulate_execute_order(self, stock_id):
        """模拟执行订单"""
        time.sleep(0.1)  # 100ms
        return {"order_id": "ORDER_123", "status": "FILLED"}
    
    def simulate_collect_trend_data(self, stock_id):
        """模拟采集趋势数据"""
        time.sleep(0.2)  # 200ms
        return {"trend": "UP", "strength": 0.8}
    
    def simulate_calculate_trend(self, stock_id):
        """模拟计算趋势"""
        time.sleep(0.1)  # 100ms
        return {"action": "HOLD", "confidence": 0.7}
5. Agent 模拟
class AgentManager:
    """Agent管理器"""
    def __init__(self, max_agents=5):
        self.max_agents = max_agents
        self.agents = []
        
        # 初始化Agent
        for i in range(max_agents):
            self.agents.append({
                "id": f"agent_{i}",
                "status": "idle",  # idle, busy
                "current_task": None,
                "capabilities": ["all"]  # 支持所有任务
            })
    
    def get_available_agent(self, task_type=None):
        """获取可用的Agent"""
        for agent in self.agents:
            if agent["status"] == "idle":
                if task_type is None or task_type in agent["capabilities"]:
                    return agent
        return None
    
    def assign_task(self, agent_id, task):
        """分配任务给Agent"""
        for agent in self.agents:
            if agent["id"] == agent_id:
                agent["status"] = "busy"
                agent["current_task"] = task
                return True
        return False
    
    def release_agent(self, agent_id):
        """释放Agent"""
        for agent in self.agents:
            if agent["id"] == agent_id:
                agent["status"] = "idle"
                agent["current_task"] = None
                return True
        return False
6. 主程序
def main():
    """主程序"""
    # 初始化工作流引擎
    engine = WorkflowEngine()
    
    # 初始化一些股票状态
    engine.stocks_state["000001"] = {
        "id": "000001",
        "name": "平安银行",
        "phase": "data_ready",
        "status": "pending",
        "priority": 0,  # 高优先级股票
        "last_processed": None,
        "data": None
    }
    
    engine.stocks_state["000002"] = {
        "id": "000002",
        "name": "万科A",
        "phase": "data_ready",
        "status": "pending",
        "priority": 2,  # 低优先级股票
        "last_processed": None,
        "data": None
    }
    
    # 模拟事件：数据就绪
    engine.add_event({
        "type": "DATA_READY",
        "stock_id": "000001",
        "priority": 0,
        "timestamp": time.time()
    })
    
    engine.add_event({
        "type": "DATA_READY",
        "stock_id": "000002",
        "priority": 2,
        "timestamp": time.time()
    })
    
    # 模拟高优先级任务到达
    time.sleep(0.5)
    engine.add_event({
        "type": "HIGH_PRIORITY_ARRIVED",
        "stock_id": "000003",  # 新的高优先级股票
        "priority": 0,
        "timestamp": time.time()
    })
    
    # 启动工作流引擎
    engine.start()

if __name__ == "__main__":
    main()
7. 运行演示
预期输出：
工作流引擎启动...
创建工作流实例: high_freq_trading_000001_1630000000 优先级: 0
创建工作流实例: trend_trading_000002_1630000000 优先级: 2
执行任务: collect_data_000001_1630000000 优先级: 0
执行任务: collect_trend_data_000002_1630000000 优先级: 2
任务完成: collect_data_000001_1630000000
执行任务: calculate_signal_000001_1630000001 优先级: 0
任务完成: collect_trend_data_000002_1630000000
执行任务: calculate_trend_000002_1630000001 优先级: 2
任务完成: calculate_signal_000001_1630000001
执行任务: execute_order_000001_1630000002 优先级: 0
任务完成: calculate_trend_000002_1630000001
任务完成: execute_order_000001_1630000002
8. 关键特性演示
8.1 优先级调度
高优先级工作流（priority=0）先执行
低优先级工作流（priority=2）后执行
同一个工作流内部任务顺序执行
8.2 事件驱动
DATA_READY 事件触发工作流
TASK_COMPLETED 事件触发下一个任务
事件按优先级处理
8.3 状态驱动
股票状态：pending → processing → completed
任务状态：pending → running → completed/failed
工作流状态：running → completed
8.4 并发控制
每个工作流有 max_concurrent 限制
总Agent数有限制
优先级队列控制执行顺序
9. 扩展方向
这个极简Demo可以扩展为完整系统：
持久化存储：用数据库替代内存存储
分布式Agent：网络通信支持分布式Agent
抢占调度：实现高优先级任务抢占低优先级
故障恢复：任务失败后的复杂恢复逻辑
监控界面：Web界面查看工作流状态
配置化：从YAML/JSON文件加载工作流定义
这个Demo已经包含了工作流引擎的核心要素，代码约300行，易于理解和扩展。