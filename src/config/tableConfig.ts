import { CidSchema, UidSchema } from '../controllers/BaseSchema';
export interface TableSet {
    tbname: string;
    cols: string[];
    colsImp: string[];
    uidcid: 'cid' | 'uid';
}
export interface TableConfig {
    colsImp: readonly string[];
    uidcid: 'cid' | 'uid';
    apiver: string;
    apisys: string;
}

export const tableConfigs = {
    jhs_puton: {//一键上架
        colsImp: [
            //卡名 游戏名  
            "card", "game"
            //版本号 server  
            , "ver", "ser"
            //上架人 数量  
            , "suser", "quantity", "state"
            //价格   0订单1退单
            , "price", "kind"
            //订单编号 对手
            , "ordernumber", "other", "info"

            , "isgroup", "ishot"
            //卡编号   版本后辍
            , "cardnumber", "versuffix"
            //上自己店上哪个号
            , "suser2"
        ] as const,
        uidcid: 'cid' as const,
        apiver: 'apigame',
        apisys: 'jhs'
    },
    jhs_backorder: {//订单管理
        colsImp: [
            //订单基础信息
            "ordernumber", "suser", "state"
            //卡片详细信息
            , "card", "ver", "ser", "game"
            //数量和信息
            , "quantity", "info"
        ] as const,
        uidcid: 'cid' as const,
        apiver: 'apigame',
        apisys: 'jhs'
    },
    jhs_gver: {//群组相关的卡 所有版本保存
        colsImp: [
            //卡名 游戏名  
            "card", "game"
            //版本号 server 单价
            , "ver", "ser", "price"
            //扫描
            , "scantime", "douser"

        ] as const,
        uidcid: 'cid' as const,
        apiver: 'apigame',
        apisys: 'jhs'
    },
    jhs_users: {
        colsImp: [
            // 用户名 余额
            "username", "balance"
            //集换仓 调价时间 扫描卖出记录
            , "exchangechange", "exchangesell"

        ] as const,
        uidcid: 'cid' as const,
        apiver: 'apigame',
        apisys: 'jhs'
    },
    jhs_groups: {
        colsImp: [
            //游戏名 组名 扫描
            "game", "gname", "scantime"
        ] as const,
        uidcid: 'cid' as const,
        apiver: 'apigame',
        apisys: 'jhs'
    },
    jhs_gitem: {
        colsImp: [
            //卡组 卡名  
            "idpkg", "card"
            //数量 扫描时间
            , "num", "scantime"
        ] as const,
        uidcid: 'cid' as const,
        apiver: 'apigame',
        apisys: 'jhs'
    },
    jhs_trade: {
        colsImp: [
            //卡名 游戏名  
            "card", "game"
            //版本号 URSER 
            , "ver", "ser"
            //扫描
            , "scantime", "douser"
            //交易次数 赢次数 赢金额
            , "tradenum", "winnum", "winmoney"
            //最后卖价 成交时间
            , "lastsell", "selltime"
        ] as const,
        uidcid: 'cid' as const,
        apiver: 'apigame',
        apisys: 'jhs'
    },
    jhs_basic: {
        colsImp: [
            //卡名 游戏名 包名
            "card", "game", "bag"
            //版本号 URSER 
            , "ver", "ser"
            //现集换价 现最低价      集换仓数量
            , "jhsPrice", "lowPrice", "quantity"
            //最后成交价 成交最高价 最低价
            , "currentPrice", "maxPrice", "minPrice"
            //最低价和最后成交价差 集换价和最后成交价差  是否可上集换仓
            , "pricediff", "jhsdiff", "isjhc"
            //扫描时间 分布式用户名
            , "scantime", "douser"
            //热门日期 热门次数 是否热门
            , "hotday", "hotnum", "ishot"
            //交易次数 赢次数 赢金额
            , "tradenum", "winnum", "winmoney"
            // //最后卖价 成交时间
            // , "lastsell", "selltime"
        ] as const,
        uidcid: 'cid' as const,
        apiver: 'apigame',
        apisys: 'jhs'
    },
    jhs_scan: {
        colsImp: [
            // 卖家  游戏名  卡名 包名
            "seller", "gamename", "name", "version",
            // 价格 张数 URSR
            "price", "quantity", "rarity",
            //最后成交 集换价 当前最低价
            "lastprice", "exchangeprice", "lowestprice"
            //集换价和本店价差和差比
            , "pricediff", "priceratio",
            //最后成交和本店差和比
            "lastpricediff", "lastpriceratio",
            // 最低价和本店差和比
            "lowestpricediff", "lowestpriceratio",
            // 热门标识
            "ishot"
        ] as const,
        uidcid: 'cid' as const,
        apiver: 'apigame',
        apisys: 'jhs'
    },
    jhs_selllist: {
        colsImp: [
            // 卡名 游戏名 包名
            "card", "game", "bag",
            // 版本号 UR SER
            "ver", "ser",
            // 卖家 交易数量 挂卖价
            "suser", "quantity", "sellprice",
            // 备注信息 交易地点
            "sremark", "place"
            //成本 上次调价 
            , "cost", "lastAdjustTime"
            //第二档集换价 第一档数量
            , "secondprice", "firstquantity"
        ] as const,
        uidcid: 'cid' as const,
        apiver: 'apigame',
        apisys: 'jhs'
    },
    jhs_sellorder: {
        colsImp: [
            // 订单信息 卖家
            "ordertime", "seller",
            // 商品信息 游戏 版本 罕度
            "card", "game", "ver", "ser",
            // 数量 卖价 地点
            "quantity", "sellPrice", "place",
            // 备注信息
            "sremark"
            //买商家 差价和购买时间
            , "buyer", "profit", "buytime"
        ] as const,
        uidcid: 'cid' as const,
        apiver: 'apigame',
        apisys: 'jhs'
    },
    jhs_order: {
        colsImp: [
            // 订单编号 下单时间 买家 卖家
            "ordernumber", "ordertime", "buyer", "seller",
            // 卡名 游戏名 版本号
            "card", "game", "ver", "ser",
            // 数量 购买价格 备注信息
            "quantity", "buyPrice", "sremark",
            // 是否卖出
            "issell", "isgroup", "ishot"
        ] as const,
        uidcid: 'cid' as const,
        apiver: 'apigame',
        apisys: 'jhs'
    },
    gmdts_list: {
        colsImp: [
            //状态   结果(记赢好点)       终局时间
            "ikuser", "ikgame", "roomid"
            //积分 是否赢
            , "consume", "iswin"

        ] as const,
        uidcid: 'cid' as const,
        apiver: 'apigame',
        apisys: 'gamedts'
    },
    gmdts_game: {
        colsImp: [
            //状态   结果       终局时间
            "status", "result", "overtime"
            //8个房间投注金额
            , "room0", "room1", "room2", "room3"
            , "room4", "room5", "room6", "room7"
        ] as const,
        uidcid: 'cid' as const,
        apiver: 'apigame',
        apisys: 'gamedts'
    },
    sys_nodejs: {
        colsImp: [
            //api版本 api目录  api实体
            "apiv", "apisys", "apiobj",
            // api方法   调用次数 耗时  上传字节 返回字节 
            "method", "num", "dlong", "uplen", "downlen"
        ] as const,
        uidcid: 'cid' as const,
        apiver: 'apisys',
        apisys: 'count'
    },
    stock_mine: {//自选股
        colsImp: [
            //代码 位置 仓位差
            "card", "position", "positionAmount"
            //次数    现档
            , "tradeCount", "currentPrice"
            //代码 现价 最高 最低 区间
            , "sname", "lastval", "val1", "val2", "val3"
            // 买入价  卖出价  中间价
            , "nextBuyPrice", "nextSellPrice", "midprice"
            //数量胜率   持仓盈亏   金额胜率
            , "numper", "haveper", "winper"
        ] as const,
        uidcid: 'uid' as const,
        apiver: 'apistock',
        apisys: 'stock'
    },
    stock_history: {
        colsImp: [
            // 交易方法  
            "kind", "line"
            //代码 交易时间 价格 数量
            , "card", "dtime", "price", "num"
            //原因 赢利 参数
            , "reason", "winval"
            //暂没用上
            //,"par2"
        ] as const,
        uidcid: 'cid' as const,
        apiver: 'apistock',
        apisys: 'stock'
    },
    stock_trade: {
        colsImp: [
            //类型：grid1 15区间网格战法
            "kind"
            //小时日月 战法参数 代码   
            , "line", "par", "card"
            //参数二三     
            , "par2", "par3", "par4", "par5", "par6"
            //效益
            , "winval"
            //参考价格1 2 及
            , "val1", "val2", "val3", "val4", "val5", "val6", "val7", "val8", "val9"
            //刷新时间  当前状态(好象没用)
            , "dval", "status"
            //多仓数   多仓价    空仓数  空仓价
            , "upnum", "upval", "downnum", "downval"
            //停止交易时间2
            , "stoptime", "stoptime2"
            //  总平仓数 胜平仓数 赢利总和(不计亏损)算凯利公式
            , "allnum", "winnum", "winsum"

            //分布式用户名 这个是算算法的
            , "douser"
            //分布式用户名(这个是算优化参数的)  
            , "worker"
            //优化时间     是否微信报警  是否今天开仓
            , "optimizetime", "iswarnwx", "todayopen"
            //最新价格
            , "lastval"
        ] as const,
        uidcid: 'cid' as const,
        apiver: 'apistock',
        apisys: 'stock'
    },
    stock_data_day: {
        colsImp: [
            // 股票代码 // 交易日期
            "card", "trade_date",
            // 开盘价// 最高价 // 最低价
            "open", "high", "low",
            // 收盘价// 昨收价
            "close", "pre_close",
            // 涨跌额// 涨跌幅
            "change", "pct_chg",
            // 成交量 // 成交额
            "vol", "amount"
        ] as const,
        uidcid: 'cid' as const,
        apiver: 'apistock',
        apisys: 'stock'
    },
    stock_basic: {
        colsImp: [
            //代码  名称 #0 sz 1sh 2 hk
            "card", "sname", "szss"
            // 行业
            , "business"
            //日线周线月线到哪一天了
            , "ddate", "dweek", "dmonth"

        ] as const,
        uidcid: 'cid' as const,
        apiver: 'apistock',
        apisys: 'stock'
    },
    mes_message: {
        colsImp: [
            //信息    发送成功修改为1 失败修改为-1  微信发送时间
            "summary", "coweixin", "wxtime"

        ] as const,
        uidcid: 'cid' as const,
        apiver: 'apisimple',
        apisys: 'mes'
    },
    roles_node_rep: {
        colsImp: [
            "node", // 节点
            "apiv", // API 版本
            "apisys", // API 系统
            "apiobj", // API 对象
            "apifun", // API 功能
            "par", // 参数           
            "info", // 本项说明
            "okinfo", // 成功信息
            "errinfo", // 错误信息
            "lastoktime", // 最后成功时间
            "errsec",//多少秒没成功才算失败
            "oknum" // 成功次数
        ] as const,
        uidcid: 'cid' as const,
        apiver: 'apisys',
        apisys: 'roles'
    },
    roles_node_status: {
        colsImp: [
            "node", // 节点
            "apiv", // API 版本
            "apisys", // API 系统
            "apiobj", // API 对象
            "apifun", // API 功能
            "par", // 参数
            "ddate", // 日期
            "info", // 本项说明
            "okinfo", // 成功信息
            "errinfo", // 错误信息
            "lastoktime", // 最后成功时间
            "errsec",//多少秒没成功才算失败
            "oknum" // 成功次数
        ] as const,
        uidcid: 'cid' as const,
        apiver: 'apisys',
        apisys: 'roles'
    },
    job_node_status: {
        colsImp: [
            "node", // 节点
            "apiv", // API 版本
            "apisys", // API 系统
            "apiobj", // API 对象
            "apifun", // API 功能
            "par", // 参数
            "ddate", // 日期
            "info", // 本项说明
            "okinfo", // 成功信息
            "errinfo", // 错误信息
            "lastoktime", // 最后成功时间
            "errsec",//多少秒没成功才算失败
            "oknum" // 成功次数
        ] as const,
        uidcid: 'cid' as const,
        apiver: 'apisimple',
        apisys: 'mes'
    },
    simple_proxy: {
        colsImp: [
            //ip port  哪种服务找的
            "ip", "port", "findkey"
            // 端口标识
            , "service_name", "software"
            //  false首次未验证 可用  (http https socket)
            , "isvalid", "isuseful", "protocol"
            //成功时间   失效时间
            , "validation_time", "expiration_time"
            //429错误 下次测试时间
            , "is429", "nexttime"
            //非429错误 出错次数
            , "iserr", "errnum"

        ] as const,
        uidcid: 'cid' as const,
        apiver: 'apisimple',
        apisys: 'simple'
    },
    ai_log: {
        colsImp: [
            //调用的用户 平台 模型
            "ikuser", "pt", "aimodel"
            // 调用的业务API(例如奥数)
            , "apifun"
            //  请求MD5  输入输出token
            , "cmdmd5", "upnum", "downnum"


        ] as const,
        uidcid: 'cid' as const,
        apiver: 'apiai',
        apisys: 'ai'
    },
    proxy_ip: {
        colsImp: [
            //
            "ip", "port", "kind"
            , "country", "website", "isok"
            , "checktime", "errtime", "oktime"
        ] as const,
        uidcid: 'cid' as const,
        apiver: 'apisteam',
        apisys: 'proxy'
    },
    proxy_website: {
        colsImp: [
            //名称  间隔   找出来的数量
            "name", "interval", "count", "nexttime"
        ] as const,
        uidcid: 'cid' as const,
        apiver: 'apisteam',
        apisys: 'proxy'
    },
    tscan_user: {
        colsImp: [
            //用户名 密码 buffcookie  
            "user", "pwd", "cookie"
            //刷新时间 操作者  状态
            , "reftime", "douser", "state"
            //附加信息 这里是最后扫价的东西
            , "info"
        ] as const,
        uidcid: 'cid' as const,
        apiver: 'apisteam',
        apisys: 'tscan'
    },
    tscan_userb: {
        colsImp: [
            //用户名 密码 buffcookie  
            "user", "pwd", "cookie"
            //刷新时间 操作者  状态
            , "reftime", "douser", "state"
            //附加信息 这里是最后扫价的东西
            , "info"
        ] as const,
        uidcid: 'cid' as const,
        apiver: 'apisteam',
        apisys: 'tscan'
    },
    tscan_basicbuff: {
        colsImp: [
            //bufid  名称  
            "hashname", "cname"
            //BUFF卖价 买价 BUFF上看的STEAM价格
            , "buffsell", "buffbuy", "steamsellb"
            //BUFF当前在售数量 求购
            , "onsale", "onbuy"
            //请求扫描时间  
            , "reqscan"
            //游戏ID
            , "gameid"
            , "buffid", "kind"
        ] as const,
        uidcid: 'cid' as const,
        apiver: 'apisteam',
        apisys: 'tscan'
    },
    tscan_basic: {
        colsImp: [
            //游戏id  名称     //hashname
            "gameid", "cname", "hashname"
            // 出售价  
            , "steamsell"
            //  挂卖量    挂买量
            , "onsalenum", "onbuynum"
            //steam求购价  
            , "steambuy"
            //请求扫描时间 
            , "reqscan"
            // steam市场ID
            , "steamMarketid"
            //实际成交的最高价和最低价(最近90天) 90天卖多少
            , "sellmax", "sellmin", "sellnum"
            //steam求购价23
            , "steambuy2", "steambuy3"
            //steam出售价23
            , "steamsell2", "steamsell3"

            , "steambuynum", "steambuynum2", "steambuynum3"
            , "steamsellnum", "steamsellnum2", "steamsellnum3"

            //已经下架了 交易类别
            , "isdown", "tradekind"
        ] as const,
        uidcid: 'cid' as const,
        apiver: 'apisteam',
        apisys: 'tscan'
    },
    tscan_basicavg: {
        colsImp: [
            //hashname   
            "hashname"
            //3个月第1/4个高低价 刷新时间
            , "max3month", "min3month", "ref3month"
            //3个月第1/4个高低价buff
            , "bmax3month", "bmin3month"
            //求购价 3个月最高
            , "buymax3month", "buysmax3month"
        ] as const,
        uidcid: 'cid' as const,
        apiver: 'apisteam',
        apisys: 'tscan'
    },
    trade_order: {
        colsImp: [
            //关联用户名 
            "suser"
            //类别(tran转移 上架 下架等)
            , "kind"
            //关联物品 对手用户名 (这三个建索引)
            , "item", "other"
            //参数二三     
            , "par", "par2", "par3", "par4", "par5", "par6"
            // 状态 附加信息
            , "state", "info"
        ] as const,
        uidcid: 'cid' as const,
        apiver: 'apisteam',
        apisys: 'trade'
    },
    trade_steambuy: {
        colsImp: [
            //orderid 用户名 
            "orderid", "user"
            ////名称  
            , "hashname"
            // 数量  //求购价 最新数量  
            , "num", "buyval", "newnum"
            //appid 730
            , "appid"
        ] as const,
        uidcid: 'cid' as const,
        apiver: 'apisteam',
        apisys: 'trade'
    },
    trade_orderbuy: {
        colsImp: [
            // 用户名   名称
            "goodsid", "suser"
            //   orderid     出售价 数量 最大出售价
            , "orderid", "myval"
            // 收购数 收到数量
            , "realnum", "num", "maxval"

        ] as const,
        uidcid: 'cid' as const,
        apiver: 'apisteam',
        apisys: 'trade'
    },
    trade_buffuser: {
        colsImp: [
            //用户名 密码 cookie  
            "user", "pwd", "cookie", "cookiebuff"
            //刷新时间 操作者    
            , "reftime", "douser"
            //steamid   状态
            , "steamid", "state"
            //steam余额 BUFF余额
            , "steammoney", "buffmoney", "buffcardmoney", "bufflockmoney"
            //钥匙  是否保持美金(用来搞其它游戏)
            , "sda", "isholdusd"
            //是否只收不卖 1buff只收不卖准备下号 2BUFF收货不卖STEAM(没啥用了)
            , "isonlysell"
            //好友代码     类别
            , "friendcode", "kind"
            //库存卖价算 买价算     
            , "storesell", "storebuy"
            //steam求购总 buff求购总
            , "steambuysum", "buffbuysum"
            //待处理美金(影响求购总量)
            , "steammoneyWait"
            //求购的数量数量
            , "steambuynum", "buffbuynum"
            //所有者 提现方便程度
            , "owner", "cashEase"
        ] as const,
        uidcid: 'cid' as const,
        apiver: 'apisteam',
        apisys: 'trade'
    },
    trade_basic: {
        colsImp: [
            //交易类别 空为搬砖
            "tradekind", "hashname"
            //交易次数   胜次数 胜金额
            , "tradenum", "winnum", "winmoney", "winmoneytrue"
            //锁定s的卖买用户
            , "ssuser", "sbuser"
            //锁定B的卖买用户
            , "bsuser", "bbuser"
            //最后售出价
            , "lastsell"
            //计划卖价 s和b
            , "plans", "planb"
        ] as const,
        uidcid: 'cid' as const,
        apiver: 'apisteam',
        apisys: 'trade'
    },
    trade_store: {
        colsImp: [
            //   库存表数据                  
            "suser", "assetid", "classid", "instanceid"
            //   hashname    
            , "hashname"
            //   贴纸
            , "stickers1", "stickers2", "stickers3", "stickers4"
            //贴纸价格    磨损
            , "stickersval", "paintwear"
            //  BUFF_ORDERID   bufforder价格
            , "sell_order_id", "sell_order_income", "sell_order_price"
            //3可出售1不可  可交易时间
            , "state", "tradable_time"
            //是否允许市场
            , "marketable"
            //steam订单号 steam卖价  steam上架时间
            , "steamorder", "steam_sellprice", "steamupdate"
            //磨损价格 磨损刷新时间
            , "painval", "painupdate"
            //最后存在时间(3天之内不删除)
            , "existsdate"
        ] as const,
        uidcid: 'cid' as const,
        apiver: 'apisteam',
        apisys: 'trade'
    },
    trade_user: {
        colsImp: [
            //用户名 密码 
            "suser", "pwd"
            //状态
            , "state"
            //信息ex:封号一次
            , "info"
            //cookie  
            , "cookie", "cookiebuff"
            //steamid   
            , "steamid"
            //steam余额 BUFF余额
            , "steammoney", "buffmoney", "buffcardmoney", "bufflockmoney"
            //钥匙     操作哪些游戏
            , "sda", "gameid"
            //好友代码     类别
            , "friendcode", "kind"
            //库存卖价算 买价算     
            , "storesell", "storebuy"
            //steam求购总 buff求购总
            , "steambuysum", "buffbuysum"
            //待处理美金(影响求购总量)
            , "steammoneyWait"
            //求购的数量数量
            , "steambuynum", "buffbuynum"
            //所有者 提现方便程度
            , "owner", "cashEase"
            , "email"
        ] as const,
        uidcid: 'cid' as const,
        apiver: 'apisteam',
        apisys: 'trade'
    },
    tscan_xiaoheihe: {
        colsImp: [
            //手机号  用户名 信息
            "phonehash", "sname", "info",
            //手机号 密码 哪台在用
            "phone", "password", "douser"
        ] as const,
        uidcid: 'cid' as const,
        apiver: 'apisteam',
        apisys: 'tscan'
    },
    // card_info: {
    //     colsImp: [// 名称, 版本, 稀度,
    //         'sname', 'version', 'rarity'
    //         // 价格, 种类
    //         , 'price', 'kind'] as const,
    //     uidcid: 'cid' as const,
    //     apiver: 'apicard',
    //     apisys: 'card'
    // },
    pars_co_kind_own: {
        colsImp: ['kind', 'item', 'data', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7', 'd8', 'd9', 'd10', 'd11', 'd12'] as const,
        uidcid: 'cid' as const,
        apiver: 'apibasic',
        apisys: 'pars'
    },
    pars_co_kind_own78: {
        colsImp: ['kind', 'item', 'data', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7', 'd8', 'd9', 'd10', 'd11', 'd12'] as const,
        uidcid: 'cid' as const,
        apiver: 'apibasic',
        apisys: 'pars'
    },
    vip_card: {
        colsImp: [
            //卡号  金额    使用次数  用途     售价
            "card", "mnum", "usenum", "usefor", "msell"
        ] as const,
        uidcid: 'cid' as const,
        apiver: 'apibasic',
        apisys: 'vip'
    },
    lovers_history: {
        colsImp: [
            "ikuser"//弃用uid
            , "kind"//景区还是酒店还是美食
            , "usefor"//积分还是余额
            , "des"  //说明             
            , "num" //变动数 
            , "ordernum"//订单编号
            , "state"//分润状态
        ] as const, // 用户名, 余额, 积分
        uidcid: 'cid' as const,
        apiver: 'apibasic',
        apisys: 'users'
    },
    lovers_balance: {
        colsImp: ['ikuser', 'money78', 'consume'] as const, // 用户名, 余额, 积分
        uidcid: 'uid' as const,
        apiver: 'apibasic',
        apisys: 'users'
    },
    lovers_auth: {
        colsImp: ['ikuser', 'pwd', 'sid', 'sid_web', 'sid_web_date'] as const, // 用户名, 密码, 客户端鉴权, 网页端鉴权, 网页端过期时间
        uidcid: 'uid' as const,
        apiver: 'apibasic',
        apisys: 'users'
    },
    lovers: {
        colsImp: ['uname', 'idcodef', 'referrer', 'mobile'] as const, // 用户名, 当前cid, 推荐人, 手机号
        uidcid: 'cid' as const,
        apiver: 'apibasic',
        apisys: 'users'
    },
    sys_ip: {
        colsImp: ['ip'] as const,
        uidcid: 'cid' as const,
        apiver: 'apitest',
        apisys: 'testmenu'
    },
    Test78: {
        colsImp: ['field1', 'field2'] as const,
        uidcid: 'cid' as const,
        apiver: 'apitest',
        apisys: 'testmenu'
    },
    testtb: {
        colsImp: ['kind', 'item', 'data'] as const,
        uidcid: 'cid' as const,
        apiver: 'apitest',
        apisys: 'testmenu'
    },
} as const;

// type CommonFields = 'id' | 'idpk' | 'upby' | 'uptime';  // 注释掉这行

export type TableSchemas = {
    [K in keyof typeof tableConfigs]: (typeof tableConfigs[K]['uidcid'] extends 'cid' ? CidSchema : UidSchema) &
    Record<typeof tableConfigs[K]['colsImp'][number], string>;
};