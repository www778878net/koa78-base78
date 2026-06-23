/*
 Navicat Premium Data Transfer

 Source Server         : testpool
 Source Server Type    : PostgreSQL
 Source Server Version : 80031
 Source Host           : 192.168.31.77:3300
 Source Schema         : testdb

 Target Server Type    : PostgreSQL
 Target Server Version : 80031
 File Encoding         : 65001

 Date: 26/10/2022 16:55:49

 项目规范：datastate SQL建表规范
 - 所有字段必须 NOT NULL 且有默认值
 - id、uid、cid 使用 VARCHAR(19) 雪花ID
 - 禁止外键、存储过程、触发器
*/

-- ----------------------------
-- Table structure for companys
-- ----------------------------
DROP TABLE IF EXISTS companys CASCADE;
CREATE TABLE IF NOT EXISTS companys (
    -- 系统字段（前）
    id VARCHAR(19) NOT NULL,
    uid VARCHAR(19) NOT NULL DEFAULT '',

    -- 业务字段
    coname VARCHAR(100) NOT NULL DEFAULT '',

    -- 系统字段（后）
    cid VARCHAR(19) NOT NULL DEFAULT '',
    upby VARCHAR(50) NOT NULL DEFAULT '',
    uptime TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    remark VARCHAR(255) NOT NULL DEFAULT '',
    remark2 VARCHAR(255) NOT NULL DEFAULT '',
    remark3 VARCHAR(255) NOT NULL DEFAULT '',
    remark4 VARCHAR(255) NOT NULL DEFAULT '',
    remark5 VARCHAR(255) NOT NULL DEFAULT '',
    remark6 VARCHAR(255) NOT NULL DEFAULT '',

    PRIMARY KEY (id),
    UNIQUE (coname)
);
COMMENT ON TABLE companys IS '公司表';
COMMENT ON COLUMN companys.id IS '雪花ID，唯一业务主键';
COMMENT ON COLUMN companys.uid IS '用户ID（雪花ID）';
COMMENT ON COLUMN companys.coname IS '公司名称';
COMMENT ON COLUMN companys.cid IS '公司ID（雪花ID）';
COMMENT ON COLUMN companys.upby IS '更新人';
COMMENT ON COLUMN companys.uptime IS '更新时间';
COMMENT ON COLUMN companys.remark IS '定制化字段1';
COMMENT ON COLUMN companys.remark2 IS '定制化字段2';
COMMENT ON COLUMN companys.remark3 IS '定制化字段3';
COMMENT ON COLUMN companys.remark4 IS '定制化字段4';
COMMENT ON COLUMN companys.remark5 IS '定制化字段5';
COMMENT ON COLUMN companys.remark6 IS '定制化字段6';

-- ----------------------------
-- Records of companys
-- ----------------------------
INSERT INTO companys (id, uid, coname, cid, upby, uptime, remark, remark2, remark3, remark4, remark5, remark6) VALUES
('318225842662547456', '318225838468239362', '测试帐套', '318225842662547456', 'sysadmin', '2022-10-20 22:05:17', '318225842662547456', '318225842662547456', '', '', '', ''),
('318225830079631360', '318225838468239362', 'net78', '318225830079631360', 'sysadmin', '2022-10-20 22:05:10', '', '', '', '', '', '');

-- ----------------------------
-- Table structure for companysuser
-- ----------------------------
DROP TABLE IF EXISTS companysuser CASCADE;
CREATE TABLE IF NOT EXISTS companysuser (
    -- 系统字段（前）
    id VARCHAR(19) NOT NULL,

    -- 业务字段
    cid VARCHAR(19) NOT NULL DEFAULT '',
    uid VARCHAR(19) NOT NULL DEFAULT '',
    des VARCHAR(50) NOT NULL DEFAULT '',

    -- 系统字段（后）
    upby VARCHAR(50) NOT NULL DEFAULT '',
    uptime TIMESTAMP(3) NOT NULL DEFAULT '1900-01-01 00:00:00',
    remark VARCHAR(255) NOT NULL DEFAULT '',
    remark2 VARCHAR(255) NOT NULL DEFAULT '',
    remark3 VARCHAR(255) NOT NULL DEFAULT '',
    remark4 VARCHAR(255) NOT NULL DEFAULT '',
    remark5 VARCHAR(255) NOT NULL DEFAULT '',
    remark6 VARCHAR(255) NOT NULL DEFAULT '',

    PRIMARY KEY (id)
);
CREATE INDEX ix_companyuser_ciduid ON companysuser(cid, uid);
COMMENT ON TABLE companysuser IS '公司用户关联表';
COMMENT ON COLUMN companysuser.id IS '雪花ID，唯一业务主键';
COMMENT ON COLUMN companysuser.cid IS '公司ID（雪花ID）';
COMMENT ON COLUMN companysuser.uid IS '用户ID（雪花ID）';
COMMENT ON COLUMN companysuser.des IS '描述';
COMMENT ON COLUMN companysuser.upby IS '更新人';
COMMENT ON COLUMN companysuser.uptime IS '更新时间';

-- ----------------------------
-- Records of companysuser
-- ----------------------------
INSERT INTO companysuser (id, cid, uid, des, upby, uptime, remark, remark2, remark3, remark4, remark5, remark6) VALUES
('1234567890123456791', '318225842662547456', '318225846856851457', '', 'guest', '2015-02-18 14:53:49', '', '', '', '', '', ''),
('1234567890123456792', '318225842662547456', '318225838468239362', '', 'guest', '2015-02-18 14:53:49', '', '', '', '', '', ''),
('1234567890123456793', '318225830079631360', '318225838468239362', '', 'guest', '2015-02-18 14:53:49', '', '', '', '', '', '');

-- ----------------------------
-- Table structure for lovers
-- ----------------------------
DROP TABLE IF EXISTS lovers CASCADE;
CREATE TABLE IF NOT EXISTS lovers (
    -- 系统字段（前）
    id VARCHAR(19) NOT NULL,

    -- 业务字段
    uname VARCHAR(100) NOT NULL DEFAULT '',
    idcodef BIGINT NOT NULL DEFAULT 0,
    email VARCHAR(50) NOT NULL DEFAULT '',
    referrer BIGINT NOT NULL DEFAULT 0,
    mobile VARCHAR(20) NOT NULL DEFAULT '',
    openweixin VARCHAR(40) NOT NULL DEFAULT '',
    truename VARCHAR(20) NOT NULL DEFAULT '',

    -- 系统字段（后）
    cid VARCHAR(19) NOT NULL DEFAULT '',
    upby VARCHAR(50) NOT NULL DEFAULT '',
    uptime TIMESTAMP(3) NOT NULL DEFAULT '1900-01-01 00:00:00',
    remark VARCHAR(255) NOT NULL DEFAULT '',
    remark2 VARCHAR(255) NOT NULL DEFAULT '',
    remark3 VARCHAR(255) NOT NULL DEFAULT '',
    remark4 VARCHAR(255) NOT NULL DEFAULT '',
    remark5 VARCHAR(255) NOT NULL DEFAULT '',
    remark6 VARCHAR(255) NOT NULL DEFAULT '',

    PRIMARY KEY (id),
    UNIQUE (uname)
);
COMMENT ON TABLE lovers IS '用户表';
COMMENT ON COLUMN lovers.id IS '雪花ID，唯一业务主键';
COMMENT ON COLUMN lovers.uname IS '用户名';
COMMENT ON COLUMN lovers.idcodef IS '邀请码';
COMMENT ON COLUMN lovers.email IS '邮箱';
COMMENT ON COLUMN lovers.referrer IS '推荐人ID';
COMMENT ON COLUMN lovers.mobile IS '手机号';
COMMENT ON COLUMN lovers.openweixin IS '微信openid';
COMMENT ON COLUMN lovers.truename IS '真实姓名';
COMMENT ON COLUMN lovers.cid IS '公司ID（雪花ID）';
COMMENT ON COLUMN lovers.upby IS '更新人';
COMMENT ON COLUMN lovers.uptime IS '更新时间';

-- ----------------------------
-- Table structure for lovers_auth
-- ----------------------------
DROP TABLE IF EXISTS lovers_auth CASCADE;
CREATE TABLE IF NOT EXISTS lovers_auth (
    -- 系统字段（前）
    id VARCHAR(19) NOT NULL,

    -- 业务字段
    ikuser VARCHAR(19) NOT NULL DEFAULT '',
    pwd VARCHAR(100) NOT NULL DEFAULT '',
    sid VARCHAR(36) NOT NULL DEFAULT '',
    sid_web VARCHAR(36) NOT NULL DEFAULT '',
    sid_web_date TIMESTAMP(3) NOT NULL DEFAULT '1900-01-01 00:00:00',
    uid VARCHAR(19) NOT NULL DEFAULT '',

    -- 系统字段（后）
    cid VARCHAR(19) NOT NULL DEFAULT '',
    upby VARCHAR(50) NOT NULL DEFAULT '',
    uptime TIMESTAMP(3) NOT NULL DEFAULT '1900-01-01 00:00:00',
    remark VARCHAR(255) NOT NULL DEFAULT '',
    remark2 VARCHAR(255) NOT NULL DEFAULT '',
    remark3 VARCHAR(255) NOT NULL DEFAULT '',
    remark4 VARCHAR(255) NOT NULL DEFAULT '',
    remark5 VARCHAR(255) NOT NULL DEFAULT '',
    remark6 VARCHAR(255) NOT NULL DEFAULT '',

    PRIMARY KEY (id),
    UNIQUE (ikuser)
);
COMMENT ON TABLE lovers_auth IS '用户认证表';
COMMENT ON COLUMN lovers_auth.id IS '雪花ID，唯一业务主键';
COMMENT ON COLUMN lovers_auth.ikuser IS '关联用户ID';
COMMENT ON COLUMN lovers_auth.pwd IS '密码';
COMMENT ON COLUMN lovers_auth.sid IS '会话ID';
COMMENT ON COLUMN lovers_auth.sid_web IS 'Web会话ID';
COMMENT ON COLUMN lovers_auth.sid_web_date IS 'Web会话日期';
COMMENT ON COLUMN lovers_auth.uid IS '用户ID（雪花ID）';
COMMENT ON COLUMN lovers_auth.cid IS '公司ID（雪花ID）';
COMMENT ON COLUMN lovers_auth.upby IS '更新人';
COMMENT ON COLUMN lovers_auth.uptime IS '更新时间';

-- ----------------------------
-- Table structure for lovers_balance
-- ----------------------------
DROP TABLE IF EXISTS lovers_balance CASCADE;
CREATE TABLE IF NOT EXISTS lovers_balance (
    -- 系统字段（前）
    id VARCHAR(19) NOT NULL,

    -- 业务字段
    ikuser VARCHAR(19) NOT NULL DEFAULT '',
    money78 INT NOT NULL DEFAULT 0,
    consume INT NOT NULL DEFAULT 0,
    uid VARCHAR(19) NOT NULL DEFAULT '',

    -- 系统字段（后）
    cid VARCHAR(19) NOT NULL DEFAULT '',
    upby VARCHAR(50) NOT NULL DEFAULT '',
    uptime TIMESTAMP(3) NOT NULL DEFAULT '1900-01-01 00:00:00',
    remark VARCHAR(255) NOT NULL DEFAULT '',
    remark2 VARCHAR(255) NOT NULL DEFAULT '',
    remark3 VARCHAR(255) NOT NULL DEFAULT '',
    remark4 VARCHAR(255) NOT NULL DEFAULT '',
    remark5 VARCHAR(255) NOT NULL DEFAULT '',
    remark6 VARCHAR(255) NOT NULL DEFAULT '',

    PRIMARY KEY (id),
    UNIQUE (ikuser)
);
COMMENT ON TABLE lovers_balance IS '用户余额表';
COMMENT ON COLUMN lovers_balance.id IS '雪花ID，唯一业务主键';
COMMENT ON COLUMN lovers_balance.ikuser IS '关联用户ID';
COMMENT ON COLUMN lovers_balance.money78 IS '余额';
COMMENT ON COLUMN lovers_balance.consume IS '消费金额';
COMMENT ON COLUMN lovers_balance.uid IS '用户ID（雪花ID）';
COMMENT ON COLUMN lovers_balance.cid IS '公司ID（雪花ID）';
COMMENT ON COLUMN lovers_balance.upby IS '更新人';
COMMENT ON COLUMN lovers_balance.uptime IS '更新时间';

-- ----------------------------
-- Records of lovers_balance
-- ----------------------------
INSERT INTO lovers_balance (id, ikuser, money78, consume, uid, cid, upby, uptime, remark, remark2, remark3, remark4, remark5, remark6) VALUES
('1234567890123457001', '1234567890123456801', 0, 0, '318225846856851457', '', '', '1900-01-01 00:00:00', '', '', '', '', '', ''),
('1234567890123457002', '1234567890123456802', 0, 0, '318225838468239362', '', '', '1900-01-01 00:00:00', '', '', '', '', '', '');

-- ----------------------------
-- Table structure for lovers_history
-- ----------------------------
DROP TABLE IF EXISTS lovers_history CASCADE;
CREATE TABLE IF NOT EXISTS lovers_history (
    -- 系统字段（前）
    id VARCHAR(19) NOT NULL,

    -- 业务字段
    cid VARCHAR(19) NOT NULL DEFAULT '',
    uid VARCHAR(19) NOT NULL DEFAULT '',
    kind VARCHAR(50) NOT NULL DEFAULT '',
    usefor VARCHAR(100) NOT NULL DEFAULT '',
    des VARCHAR(500) NOT NULL DEFAULT '',
    num NUMERIC(19,2) NOT NULL DEFAULT 0.00,
    ordernum VARCHAR(50) NOT NULL DEFAULT '',

    -- 系统字段（后）
    upby VARCHAR(50) NOT NULL DEFAULT '',
    uptime TIMESTAMP(3) NOT NULL DEFAULT '1900-01-01 00:00:00',
    remark VARCHAR(255) NOT NULL DEFAULT '',
    remark2 VARCHAR(255) NOT NULL DEFAULT '',
    remark3 VARCHAR(255) NOT NULL DEFAULT '',
    remark4 VARCHAR(255) NOT NULL DEFAULT '',
    remark5 VARCHAR(255) NOT NULL DEFAULT '',
    remark6 VARCHAR(255) NOT NULL DEFAULT '',

    PRIMARY KEY (id)
);
COMMENT ON TABLE lovers_history IS '用户历史记录表';
COMMENT ON COLUMN lovers_history.id IS '雪花ID，唯一业务主键';
COMMENT ON COLUMN lovers_history.cid IS '公司ID（雪花ID）';
COMMENT ON COLUMN lovers_history.uid IS '用户ID（雪花ID）';
COMMENT ON COLUMN lovers_history.kind IS '类型';
COMMENT ON COLUMN lovers_history.usefor IS '用途';
COMMENT ON COLUMN lovers_history.des IS '描述';
COMMENT ON COLUMN lovers_history.num IS '数量';
COMMENT ON COLUMN lovers_history.ordernum IS '订单号';
COMMENT ON COLUMN lovers_history.upby IS '更新人';
COMMENT ON COLUMN lovers_history.uptime IS '更新时间';

-- ----------------------------
-- Records of lovers
-- ----------------------------
INSERT INTO lovers (id, uname, idcodef, email, referrer, mobile, openweixin, truename, cid, upby, uptime, remark, remark2, remark3, remark4, remark5, remark6) VALUES
('1234567890123456801', 'guest', 318225842662547456, '', 318225842662547456, '', '', '', '0', '', '1900-01-01 00:00:00', '', '', '', '', '', ''),
('1234567890123456802', 'sysadmin', 318225830079631360, '', 318225830079631360, '', '', '', '0', '', '1900-01-01 00:00:00', '', '', '', '', '', '');

-- ----------------------------
-- Records of lovers_auth
-- ----------------------------
INSERT INTO lovers_auth (id, ikuser, pwd, sid, sid_web, sid_web_date, uid, cid, upby, uptime, remark, remark2, remark3, remark4, remark5, remark6) VALUES
('1234567890123456901', '1234567890123456801', 'e10adc3949ba59abbe56e057f20f883e', '318225846856851457', '8573faf2-24b2-b586-adac-d9d8da9772d0', '2018-06-01 18:02:43', '0', '', '', '1900-01-01 00:00:00', '', '', '', '', '', ''),
('1234567890123456902', '1234567890123456802', 'e10adc3949ba59abbe56e057f20f883e', '9776b64d-70b2-9d61-4b24-60325ea1345e', 'a46f3ec9-b40d-6850-838e-6b897a73c72f', '2022-10-24 22:06:26', '0', '', '', '1900-01-01 00:00:00', '', '', '', '', '', '');

-- ----------------------------
-- Table structure for sys_ip
-- ----------------------------
DROP TABLE IF EXISTS sys_ip CASCADE;
CREATE TABLE IF NOT EXISTS sys_ip (
    -- 系统字段（前）
    id VARCHAR(19) NOT NULL,

    -- 业务字段
    cid VARCHAR(19) NOT NULL DEFAULT '',
    uid VARCHAR(19) NOT NULL DEFAULT '',
    ip VARCHAR(100) NOT NULL DEFAULT '',

    -- 系统字段（后）
    upby VARCHAR(50) NOT NULL DEFAULT '',
    uptime TIMESTAMP(3) NOT NULL DEFAULT '1900-01-01 00:00:00',
    remark VARCHAR(255) NOT NULL DEFAULT '',
    remark2 VARCHAR(255) NOT NULL DEFAULT '',
    remark3 VARCHAR(255) NOT NULL DEFAULT '',
    remark4 VARCHAR(255) NOT NULL DEFAULT '',
    remark5 VARCHAR(255) NOT NULL DEFAULT '',
    remark6 VARCHAR(255) NOT NULL DEFAULT '',

    PRIMARY KEY (id)
);
COMMENT ON TABLE sys_ip IS '系统IP记录表';
COMMENT ON COLUMN sys_ip.id IS '雪花ID，唯一业务主键';
COMMENT ON COLUMN sys_ip.cid IS '公司ID（雪花ID）';
COMMENT ON COLUMN sys_ip.uid IS '用户ID（雪花ID）';
COMMENT ON COLUMN sys_ip.ip IS 'IP地址';
COMMENT ON COLUMN sys_ip.upby IS '更新人';
COMMENT ON COLUMN sys_ip.uptime IS '更新时间';

-- ----------------------------
-- Records of sys_ip
-- ----------------------------
INSERT INTO sys_ip (id, cid, uid, ip, upby, uptime, remark, remark2, remark3, remark4, remark5, remark6) VALUES
('1234567890123458001', '0', '318225846856851457', '127.0.0.1', 'guest', '2022-10-20 22:06:34', '', '', '', '', '', ''),
('1234567890123458002', '0', '318225846856851457', '127.0.0.1', 'guest', '2022-10-24 22:22:30', '', '', '', '', '', ''),
('1234567890123458003', '0', '318225846856851457', '127.0.0.1', 'guest', '2022-10-26 15:01:43', '', '', '', '', '', '');

-- ----------------------------
-- Table structure for sys_nodejs
-- ----------------------------
DROP TABLE IF EXISTS sys_nodejs CASCADE;
CREATE TABLE IF NOT EXISTS sys_nodejs (
    -- 系统字段（前）
    id VARCHAR(19) NOT NULL,

    -- 业务字段
    cid VARCHAR(19) NOT NULL DEFAULT '',
    apisys VARCHAR(32) NOT NULL DEFAULT '',
    apimicro VARCHAR(50) NOT NULL DEFAULT '',
    apiobj VARCHAR(50) NOT NULL DEFAULT '',
    method VARCHAR(200) NOT NULL DEFAULT '',
    num INT NOT NULL DEFAULT 0,
    dlong INT NOT NULL DEFAULT 0,
    uplen INT NOT NULL DEFAULT 0,
    downlen INT NOT NULL DEFAULT 0,

    -- 系统字段（后）
    upby VARCHAR(50) NOT NULL DEFAULT '',
    uptime TIMESTAMP(3) NOT NULL DEFAULT '1900-01-01 00:00:00',
    remark VARCHAR(255) NOT NULL DEFAULT '',
    remark2 VARCHAR(255) NOT NULL DEFAULT '',
    remark3 VARCHAR(255) NOT NULL DEFAULT '',
    remark4 VARCHAR(255) NOT NULL DEFAULT '',
    remark5 VARCHAR(255) NOT NULL DEFAULT '',
    remark6 VARCHAR(255) NOT NULL DEFAULT '',

    PRIMARY KEY (id),
    UNIQUE (apisys, apimicro, apiobj, method)
);
COMMENT ON TABLE sys_nodejs IS '系统NodeJS接口统计表';
COMMENT ON COLUMN sys_nodejs.id IS '雪花ID，唯一业务主键';
COMMENT ON COLUMN sys_nodejs.cid IS '公司ID（雪花ID）';
COMMENT ON COLUMN sys_nodejs.apisys IS 'API系统标识';
COMMENT ON COLUMN sys_nodejs.apimicro IS 'API微服务标识';
COMMENT ON COLUMN sys_nodejs.apiobj IS 'API对象标识';
COMMENT ON COLUMN sys_nodejs.method IS 'API方法路径';
COMMENT ON COLUMN sys_nodejs.num IS '调用次数';
COMMENT ON COLUMN sys_nodejs.dlong IS '耗时';
COMMENT ON COLUMN sys_nodejs.uplen IS '上传长度';
COMMENT ON COLUMN sys_nodejs.downlen IS '下载长度';
COMMENT ON COLUMN sys_nodejs.upby IS '更新人';
COMMENT ON COLUMN sys_nodejs.uptime IS '更新时间';

-- ----------------------------
-- Records of sys_nodejs
-- ----------------------------
INSERT INTO sys_nodejs (id, cid, apisys, apimicro, apiobj, method, num, dlong, uplen, downlen, upby, uptime, remark, remark2, remark3, remark4, remark5, remark6) VALUES
('1234567890123458133', '0', 'api7817', 'ucenter', 'lovers', '/Api7822/ucenter/lovers/login', 8, 203, 304, 1347, '', '2022-10-25 21:34:15', '', '', '', '', '', ''),
('1234567890123458199', '0', 'api7817', 'TestMenu', 'Test78', '/Api7822/TestMenu/Test78/testmem', 3, 44, 0, 138, '', '2022-10-26 15:00:12', '', '', '', '', '', '');

-- ----------------------------
-- Table structure for sys_sql
-- ----------------------------
DROP TABLE IF EXISTS sys_sql CASCADE;
CREATE TABLE IF NOT EXISTS sys_sql (
    -- 系统字段（前）
    id VARCHAR(19) NOT NULL,

    -- 业务字段
    cid VARCHAR(19) NOT NULL DEFAULT '',
    apisys VARCHAR(50) NOT NULL DEFAULT '',
    apimicro VARCHAR(50) NOT NULL DEFAULT '',
    apiobj VARCHAR(50) NOT NULL DEFAULT '',
    cmdtext TEXT NOT NULL,
    uname VARCHAR(50) NOT NULL DEFAULT '',
    num INT NOT NULL DEFAULT 0,
    dlong INT NOT NULL DEFAULT 0,
    downlen INT NOT NULL DEFAULT 0,
    cmdtextmd5 VARCHAR(50) NOT NULL DEFAULT '',

    -- 系统字段（后）
    upby VARCHAR(50) NOT NULL DEFAULT '',
    uptime TIMESTAMP(3) NOT NULL DEFAULT '1900-01-01 00:00:00',
    remark VARCHAR(255) NOT NULL DEFAULT '',
    remark2 VARCHAR(255) NOT NULL DEFAULT '',
    remark3 VARCHAR(255) NOT NULL DEFAULT '',
    remark4 VARCHAR(255) NOT NULL DEFAULT '',
    remark5 VARCHAR(255) NOT NULL DEFAULT '',
    remark6 VARCHAR(255) NOT NULL DEFAULT '',

    PRIMARY KEY (id),
    UNIQUE (apisys, apimicro, apiobj, cmdtextmd5)
);
COMMENT ON TABLE sys_sql IS '系统SQL记录表';
COMMENT ON COLUMN sys_sql.id IS '雪花ID，唯一业务主键';
COMMENT ON COLUMN sys_sql.cid IS '公司ID（雪花ID）';
COMMENT ON COLUMN sys_sql.apisys IS 'API系统标识';
COMMENT ON COLUMN sys_sql.apimicro IS 'API微服务标识';
COMMENT ON COLUMN sys_sql.apiobj IS 'API对象标识';
COMMENT ON COLUMN sys_sql.cmdtext IS 'SQL命令文本';
COMMENT ON COLUMN sys_sql.uname IS '用户名';
COMMENT ON COLUMN sys_sql.num IS '调用次数';
COMMENT ON COLUMN sys_sql.dlong IS '耗时';
COMMENT ON COLUMN sys_sql.downlen IS '下载长度';
COMMENT ON COLUMN sys_sql.cmdtextmd5 IS 'SQL命令MD5';
COMMENT ON COLUMN sys_sql.upby IS '更新人';
COMMENT ON COLUMN sys_sql.uptime IS '更新时间';

-- ----------------------------
-- Records of sys_sql
-- ----------------------------
INSERT INTO sys_sql (id, cid, apisys, apimicro, apiobj, cmdtext, uname, num, dlong, downlen, cmdtextmd5, upby, uptime, remark, remark2, remark3, remark4, remark5, remark6) VALUES
('1234567890123458203', '0', '17.2', 'ucenter', 'lovers', 'insert into sys_nodejs(apisys,apimicro,apiobj, method,num,dlong,uplen,downlen,uptime,id)values(?,?,?,?,?,?,?,?,?,?)ON DUPLICATE KEY UPDATE num=num+1,dlong=dlong+?,uplen=uplen+?,downlen=downlen+?', '', 8, 39, 1032, '0998023bd7565d877cb04b6e707d4613', '', '2022-10-25 21:34:16', '', '', '', '', '', ''),
('1234567890123458226', '0', '17.2', 'ucenter', 'lovers', ' INSERT INTO  lovers  (cid, uname,pwd,sid,sid_web,sid_web_date,id,upby,uptime,idcodef) SELECT ?,?,?,?,?,?,?,?,?,?', '', 1, 8, 166, '175e6e9cb95c188b2df82925c65bf33c', '', '2022-10-25 21:39:05', '', '', '', '', '', ''),
('1234567890123458252', '0', '17.2', 'ucenter', 'lovers', 'UPDATE lovers SET sid_web=?,sid_web_date=?,uptime=? WHERE uname=?', '', 4, 47, 672, '4c6ab3975bb2ccd83f1e63447469ec96', '', '2022-10-25 21:40:26', '', '', '', '', '', '');

-- ----------------------------
-- Table structure for sys_warn
-- ----------------------------
DROP TABLE IF EXISTS sys_warn CASCADE;
CREATE TABLE IF NOT EXISTS sys_warn (
    -- 系统字段（前）
    id VARCHAR(19) NOT NULL,

    -- 业务字段
    uid VARCHAR(19) NOT NULL DEFAULT '',
    kind VARCHAR(100) NOT NULL DEFAULT '',
    apimicro VARCHAR(100) NOT NULL DEFAULT '',
    apiobj VARCHAR(100) NOT NULL DEFAULT '',
    content TEXT NOT NULL,
    upid VARCHAR(19) NOT NULL DEFAULT '',

    -- 系统字段（后）
    cid VARCHAR(19) NOT NULL DEFAULT '',
    upby VARCHAR(50) NOT NULL DEFAULT '',
    uptime TIMESTAMP(3) NOT NULL DEFAULT '1900-01-01 00:00:00',
    remark VARCHAR(255) NOT NULL DEFAULT '',
    remark2 VARCHAR(255) NOT NULL DEFAULT '',
    remark3 VARCHAR(255) NOT NULL DEFAULT '',
    remark4 VARCHAR(255) NOT NULL DEFAULT '',
    remark5 VARCHAR(255) NOT NULL DEFAULT '',
    remark6 VARCHAR(255) NOT NULL DEFAULT '',

    PRIMARY KEY (id)
);
COMMENT ON TABLE sys_warn IS '系统警告表';
COMMENT ON COLUMN sys_warn.id IS '雪花ID，唯一业务主键';
COMMENT ON COLUMN sys_warn.uid IS '用户ID（雪花ID）';
COMMENT ON COLUMN sys_warn.kind IS '类型';
COMMENT ON COLUMN sys_warn.apimicro IS 'API微服务标识';
COMMENT ON COLUMN sys_warn.apiobj IS 'API对象标识';
COMMENT ON COLUMN sys_warn.content IS '内容';
COMMENT ON COLUMN sys_warn.upid IS '上级ID';
COMMENT ON COLUMN sys_warn.cid IS '公司ID（雪花ID）';
COMMENT ON COLUMN sys_warn.upby IS '更新人';
COMMENT ON COLUMN sys_warn.uptime IS '更新时间';

-- ----------------------------
-- Records of sys_warn
-- ----------------------------
INSERT INTO sys_warn (id, uid, kind, apimicro, apiobj, content, upid, cid, upby, uptime, remark, remark2, remark3, remark4, remark5, remark6) VALUES
('1234567890123458178', '0', 'debug_TestMenu', 'TestMenu', 'testtb', '{
  fieldCount: 0,
  affectedRows: 1,
  insertId: 3,
  serverStatus: 2,
  warningCount: 0,
  message: '''',
  protocol41: true,
  changedRows: 0
} c:insert into sys_ip(uid,ip, upby,uptime,id)values(?,?,?,?,?) v318225846856851457,127.0.0.1,guest,2022-10-26 15:01:43,fe3d85e6-70a5-37ca-fc1c-62cf6e6448f7', '0', '', 'guest', '2022-10-26 15:01:44', '', '', '', '', '', ''),
('1234567890123458179', '0', 'debug_TestMenu', 'TestMenu', 'testtb', '[ RowDataPacket { id: ''9009408d-6430-f43b-2b56-c94a453b7f4d'' } ] c:SELECT id FROM testtb where id=?  v9009408d-6430-f43b-2b56-c94a453b7f4d', '0', '', 'guest', '2022-10-26 16:34:41', '', '', '', '', '', ''),
('1234567890123458180', '0', 'debug_TestMenu', 'TestMenu', 'testtb', '{
  fieldCount: 0,
  affectedRows: 1,
  insertId: 0,
  serverStatus: 2,
  warningCount: 0,
  message: ''(Rows matched: 1  Changed: 1  Warnings: 0'',
  protocol41: true,
  changedRows: 1
} c:UPDATE  testtb SET kind=?,upby=?,uptime=? WHERE id=? and cid=? LIMIT 1 ve75f33be-5889-8381-26ae-d37bcf002d91,guest,2022-10-26 16:34:40,9009408d-6430-f43b-2b56-c94a453b7f4d,318225842662547456', '0', '', 'guest', '2022-10-26 16:34:41', '', '', '', '', '', '');

-- ----------------------------
-- Table structure for testtb
-- ----------------------------
DROP TABLE IF EXISTS testtb CASCADE;
CREATE TABLE IF NOT EXISTS testtb (
    -- 系统字段（前）
    id VARCHAR(19) NOT NULL,

    -- 业务字段
    cid VARCHAR(19) NOT NULL DEFAULT '',
    kind VARCHAR(100) NOT NULL DEFAULT '',
    item VARCHAR(200) NOT NULL DEFAULT '',
    data VARCHAR(500) NOT NULL DEFAULT '',

    -- 系统字段（后）
    upby VARCHAR(50) NOT NULL DEFAULT '',
    uptime TIMESTAMP(3) NOT NULL DEFAULT '1900-01-01 00:00:00',
    remark VARCHAR(255) NOT NULL DEFAULT '',
    remark2 VARCHAR(255) NOT NULL DEFAULT '',
    remark3 VARCHAR(255) NOT NULL DEFAULT '',
    remark4 VARCHAR(255) NOT NULL DEFAULT '',
    remark5 VARCHAR(255) NOT NULL DEFAULT '',
    remark6 VARCHAR(255) NOT NULL DEFAULT '',

    PRIMARY KEY (id),
    UNIQUE (cid, kind, item)
);
CREATE INDEX i_kind_item ON testtb(kind, item);
COMMENT ON TABLE testtb IS '测试表';
COMMENT ON COLUMN testtb.id IS '雪花ID，唯一业务主键';
COMMENT ON COLUMN testtb.cid IS '公司ID（雪花ID）';
COMMENT ON COLUMN testtb.kind IS '类型';
COMMENT ON COLUMN testtb.item IS '项目';
COMMENT ON COLUMN testtb.data IS '数据';
COMMENT ON COLUMN testtb.upby IS '更新人';
COMMENT ON COLUMN testtb.uptime IS '更新时间';

-- ----------------------------
-- Records of testtb
-- ----------------------------
INSERT INTO testtb (id, cid, kind, item, data, upby, uptime, remark, remark2, remark3, remark4, remark5, remark6) VALUES
('1234567890123459001', '318225842662547456', 'e75f33be-5889-8381-26ae-d37bcf002d91', 'itemval', '4ab4bb9f-e308-0131-8711-2c1338a32438', 'guest', '2022-10-26 16:34:40', '', '', '', '', '', ''),
('1234567890123459002', '318225842662547456', 'kindval', '7316ee3c-cc05-b210-a8f0-95d473a80d91', '653cf6d9-e7d1-f5f3-5544-491bfd26a4a9', 'guest', '2022-10-18 19:10:13', '', '', '', '', '', ''),
('1234567890123459011', '318225842662547456', 'kindval', 'itemval', 'dataval', 'guest', '2022-10-20 21:05:43', '', '', '', '', '', '');

-- ----------------------------
-- Table structure for testtb2
-- ----------------------------
DROP TABLE IF EXISTS testtb2 CASCADE;
CREATE TABLE IF NOT EXISTS testtb2 (
    -- 系统字段（前）
    id VARCHAR(19) NOT NULL,

    -- 业务字段
    cid VARCHAR(19) NOT NULL DEFAULT '',
    kind VARCHAR(100) NOT NULL DEFAULT '',
    item VARCHAR(200) NOT NULL DEFAULT '',
    data VARCHAR(500) NOT NULL DEFAULT '',
    d2 VARCHAR(500) NOT NULL DEFAULT '',
    d3 VARCHAR(500) NOT NULL DEFAULT '',
    d4 VARCHAR(500) NOT NULL DEFAULT '',
    d5 VARCHAR(500) NOT NULL DEFAULT '',
    d6 VARCHAR(500) NOT NULL DEFAULT '',

    -- 系统字段（后）
    upby VARCHAR(50) NOT NULL DEFAULT '',
    uptime TIMESTAMP(3) NOT NULL DEFAULT '1900-01-01 00:00:00',
    remark VARCHAR(255) NOT NULL DEFAULT '',
    remark2 VARCHAR(255) NOT NULL DEFAULT '',
    remark3 VARCHAR(255) NOT NULL DEFAULT '',
    remark4 VARCHAR(255) NOT NULL DEFAULT '',
    remark5 VARCHAR(255) NOT NULL DEFAULT '',
    remark6 VARCHAR(255) NOT NULL DEFAULT '',

    PRIMARY KEY (id),
    UNIQUE (cid, kind, item)
);
CREATE INDEX i_kind_item ON testtb2(kind, item);
COMMENT ON TABLE testtb2 IS '测试表2';
COMMENT ON COLUMN testtb2.id IS '雪花ID，唯一业务主键';
COMMENT ON COLUMN testtb2.cid IS '公司ID（雪花ID）';
COMMENT ON COLUMN testtb2.kind IS '类型';
COMMENT ON COLUMN testtb2.item IS '项目';
COMMENT ON COLUMN testtb2.data IS '数据';
COMMENT ON COLUMN testtb2.d2 IS '数据2';
COMMENT ON COLUMN testtb2.d3 IS '数据3';
COMMENT ON COLUMN testtb2.d4 IS '数据4';
COMMENT ON COLUMN testtb2.d5 IS '数据5';
COMMENT ON COLUMN testtb2.d6 IS '数据6';
COMMENT ON COLUMN testtb2.upby IS '更新人';
COMMENT ON COLUMN testtb2.uptime IS '更新时间';

-- ----------------------------
-- Table structure for testtb3
-- ----------------------------
DROP TABLE IF EXISTS testtb3 CASCADE;
CREATE TABLE IF NOT EXISTS testtb3 (
    -- 系统字段（前）
    id VARCHAR(19) NOT NULL,

    -- 业务字段
    cid VARCHAR(19) NOT NULL DEFAULT '',
    kind VARCHAR(100) NOT NULL DEFAULT '',
    item VARCHAR(200) NOT NULL DEFAULT '',
    data VARCHAR(500) NOT NULL DEFAULT '',
    d2 VARCHAR(500) NOT NULL DEFAULT '',
    d3 VARCHAR(500) NOT NULL DEFAULT '',
    d4 VARCHAR(500) NOT NULL DEFAULT '',
    d5 VARCHAR(500) NOT NULL DEFAULT '',
    d6 VARCHAR(500) NOT NULL DEFAULT '',

    -- 系统字段（后）
    upby VARCHAR(50) NOT NULL DEFAULT '',
    uptime TIMESTAMP(3) NOT NULL DEFAULT '1900-01-01 00:00:00',
    remark VARCHAR(255) NOT NULL DEFAULT '',
    remark2 VARCHAR(255) NOT NULL DEFAULT '',
    remark3 VARCHAR(255) NOT NULL DEFAULT '',
    remark4 VARCHAR(255) NOT NULL DEFAULT '',
    remark5 VARCHAR(255) NOT NULL DEFAULT '',
    remark6 VARCHAR(255) NOT NULL DEFAULT '',

    PRIMARY KEY (id),
    UNIQUE (cid, kind, item)
);
CREATE INDEX i_kind_item ON testtb3(kind, item);
COMMENT ON TABLE testtb3 IS '测试表3';
COMMENT ON COLUMN testtb3.id IS '雪花ID，唯一业务主键';
COMMENT ON COLUMN testtb3.cid IS '公司ID（雪花ID）';
COMMENT ON COLUMN testtb3.kind IS '类型';
COMMENT ON COLUMN testtb3.item IS '项目';
COMMENT ON COLUMN testtb3.data IS '数据';
COMMENT ON COLUMN testtb3.d2 IS '数据2';
COMMENT ON COLUMN testtb3.d3 IS '数据3';
COMMENT ON COLUMN testtb3.d4 IS '数据4';
COMMENT ON COLUMN testtb3.d5 IS '数据5';
COMMENT ON COLUMN testtb3.d6 IS '数据6';
COMMENT ON COLUMN testtb3.upby IS '更新人';
COMMENT ON COLUMN testtb3.uptime IS '更新时间';

-- ----------------------------
-- Table structure for testtb4
-- ----------------------------
DROP TABLE IF EXISTS testtb4 CASCADE;
CREATE TABLE IF NOT EXISTS testtb4 (
    -- 系统字段（前）
    id VARCHAR(19) NOT NULL,

    -- 业务字段
    cid VARCHAR(19) NOT NULL DEFAULT '',
    kind VARCHAR(100) NOT NULL DEFAULT '',
    item VARCHAR(200) NOT NULL DEFAULT '',
    data VARCHAR(500) NOT NULL DEFAULT '',
    d2 VARCHAR(500) NOT NULL DEFAULT '',
    d3 VARCHAR(500) NOT NULL DEFAULT '',
    d4 VARCHAR(500) NOT NULL DEFAULT '',
    d5 VARCHAR(500) NOT NULL DEFAULT '',
    d6 VARCHAR(500) NOT NULL DEFAULT '',

    -- 系统字段（后）
    upby VARCHAR(50) NOT NULL DEFAULT '',
    uptime TIMESTAMP(3) NOT NULL DEFAULT '1900-01-01 00:00:00',
    remark VARCHAR(255) NOT NULL DEFAULT '',
    remark2 VARCHAR(255) NOT NULL DEFAULT '',
    remark3 VARCHAR(255) NOT NULL DEFAULT '',
    remark4 VARCHAR(255) NOT NULL DEFAULT '',
    remark5 VARCHAR(255) NOT NULL DEFAULT '',
    remark6 VARCHAR(255) NOT NULL DEFAULT '',

    PRIMARY KEY (id),
    UNIQUE (cid, kind, item)
);
CREATE INDEX i_kind_item ON testtb4(kind, item);
COMMENT ON TABLE testtb4 IS '测试表4';
COMMENT ON COLUMN testtb4.id IS '雪花ID，唯一业务主键';
COMMENT ON COLUMN testtb4.cid IS '公司ID（雪花ID）';
COMMENT ON COLUMN testtb4.kind IS '类型';
COMMENT ON COLUMN testtb4.item IS '项目';
COMMENT ON COLUMN testtb4.data IS '数据';
COMMENT ON COLUMN testtb4.d2 IS '数据2';
COMMENT ON COLUMN testtb4.d3 IS '数据3';
COMMENT ON COLUMN testtb4.d4 IS '数据4';
COMMENT ON COLUMN testtb4.d5 IS '数据5';
COMMENT ON COLUMN testtb4.d6 IS '数据6';
COMMENT ON COLUMN testtb4.upby IS '更新人';
COMMENT ON COLUMN testtb4.uptime IS '更新时间';

-- ----------------------------
-- Table structure for testtb5
-- ----------------------------
DROP TABLE IF EXISTS testtb5 CASCADE;
CREATE TABLE IF NOT EXISTS testtb5 (
    -- 系统字段（前）
    id VARCHAR(19) NOT NULL,

    -- 业务字段
    cid VARCHAR(19) NOT NULL DEFAULT '',
    kind VARCHAR(100) NOT NULL DEFAULT '',
    item VARCHAR(200) NOT NULL DEFAULT '',
    data VARCHAR(500) NOT NULL DEFAULT '',
    d2 VARCHAR(500) NOT NULL DEFAULT '',
    d3 VARCHAR(500) NOT NULL DEFAULT '',
    d4 VARCHAR(500) NOT NULL DEFAULT '',
    d5 VARCHAR(500) NOT NULL DEFAULT '',
    d6 VARCHAR(500) NOT NULL DEFAULT '',

    -- 系统字段（后）
    upby VARCHAR(50) NOT NULL DEFAULT '',
    uptime TIMESTAMP(3) NOT NULL DEFAULT '1900-01-01 00:00:00',
    remark VARCHAR(255) NOT NULL DEFAULT '',
    remark2 VARCHAR(255) NOT NULL DEFAULT '',
    remark3 VARCHAR(255) NOT NULL DEFAULT '',
    remark4 VARCHAR(255) NOT NULL DEFAULT '',
    remark5 VARCHAR(255) NOT NULL DEFAULT '',
    remark6 VARCHAR(255) NOT NULL DEFAULT '',

    PRIMARY KEY (id),
    UNIQUE (cid, kind, item)
);
CREATE INDEX i_kind_item ON testtb5(kind, item);
COMMENT ON TABLE testtb5 IS '测试表5';
COMMENT ON COLUMN testtb5.id IS '雪花ID，唯一业务主键';
COMMENT ON COLUMN testtb5.cid IS '公司ID（雪花ID）';
COMMENT ON COLUMN testtb5.kind IS '类型';
COMMENT ON COLUMN testtb5.item IS '项目';
COMMENT ON COLUMN testtb5.data IS '数据';
COMMENT ON COLUMN testtb5.d2 IS '数据2';
COMMENT ON COLUMN testtb5.d3 IS '数据3';
COMMENT ON COLUMN testtb5.d4 IS '数据4';
COMMENT ON COLUMN testtb5.d5 IS '数据5';
COMMENT ON COLUMN testtb5.d6 IS '数据6';
COMMENT ON COLUMN testtb5.upby IS '更新人';
COMMENT ON COLUMN testtb5.uptime IS '更新时间';

-- ----------------------------
-- Table structure for pars_co
-- ----------------------------
DROP TABLE IF EXISTS pars_co CASCADE;
CREATE TABLE IF NOT EXISTS pars_co (
    -- 系统字段（前）
    id VARCHAR(19) NOT NULL,

    -- 业务字段
    cid VARCHAR(36) NOT NULL DEFAULT '',
    item VARCHAR(100) NOT NULL DEFAULT '',
    data VARCHAR(200) NOT NULL DEFAULT '',
    d2 VARCHAR(100) NOT NULL DEFAULT '',
    d3 VARCHAR(100) NOT NULL DEFAULT '',
    d4 VARCHAR(100) NOT NULL DEFAULT '',
    d5 VARCHAR(100) NOT NULL DEFAULT '',
    d6 VARCHAR(100) NOT NULL DEFAULT '',

    -- 系统字段（后）
    upby VARCHAR(50) NOT NULL DEFAULT '',
    uptime TIMESTAMP(3) NOT NULL DEFAULT '1900-01-01 00:00:00',
    remark VARCHAR(255) NOT NULL DEFAULT '',
    remark2 VARCHAR(255) NOT NULL DEFAULT '',
    remark3 VARCHAR(255) NOT NULL DEFAULT '',
    remark4 VARCHAR(255) NOT NULL DEFAULT '',
    remark5 VARCHAR(255) NOT NULL DEFAULT '',
    remark6 VARCHAR(255) NOT NULL DEFAULT '',

    PRIMARY KEY (id),
    UNIQUE (cid, item)
);
COMMENT ON TABLE pars_co IS '公司参数表';
COMMENT ON COLUMN pars_co.id IS '雪花ID，唯一业务主键';
COMMENT ON COLUMN pars_co.cid IS '公司ID';
COMMENT ON COLUMN pars_co.item IS '项目';
COMMENT ON COLUMN pars_co.data IS '数据';
COMMENT ON COLUMN pars_co.d2 IS '数据2';
COMMENT ON COLUMN pars_co.d3 IS '数据3';
COMMENT ON COLUMN pars_co.d4 IS '数据4';
COMMENT ON COLUMN pars_co.d5 IS '数据5';
COMMENT ON COLUMN pars_co.d6 IS '数据6';
COMMENT ON COLUMN pars_co.upby IS '更新人';
COMMENT ON COLUMN pars_co.uptime IS '更新时间';