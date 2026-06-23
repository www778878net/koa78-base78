/*
 Navicat Premium Data Transfer

 Source Server         : testpool
 Source Server Type    : MySQL
 Source Server Version : 80031
 Source Host           : 192.168.31.77:3300
 Source Schema         : testdb

 Target Server Type    : MySQL
 Target Server Version : 80031
 File Encoding         : 65001

 Date: 26/10/2022 16:55:49
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for companys
-- ----------------------------
DROP TABLE IF EXISTS `companys`;
CREATE TABLE `companys`  (
  `uid` BIGINT NULL DEFAULT NULL,
  `coname` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `upby` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `uptime` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0) ON UPDATE CURRENT_TIMESTAMP(0),
  `id` BIGINT NOT NULL,
  `remark` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL,
  `remark2` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL,
  `remark3` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL,
  `remark4` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL,
  `remark5` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL,
  `remark6` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `ix_Company_name`(`coname`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of companys
-- ----------------------------
INSERT INTO `companys` VALUES (318225838468239362, '测试帐套', 'sysadmin', '2022-10-20 22:05:17', 318225842662547456, 318225842662547456, 318225842662547456, '', '', '', '');
INSERT INTO `companys` VALUES (318225838468239362, 'net78', 'sysadmin', '2022-10-20 22:05:10', 318225830079631360, 318225830079631360, '', '', '', '', '');

-- ----------------------------
-- Table structure for companysuser
-- ----------------------------
DROP TABLE IF EXISTS `companysuser`;
CREATE TABLE `companysuser`  (
  `cid` BIGINT NOT NULL,
  `uid` BIGINT NOT NULL,
  `upby` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `uptime` datetime(0) NOT NULL,
  `id` BIGINT NOT NULL,
  `remark` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL,
  `remark2` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL,
  `remark3` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL,
  `remark4` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL,
  `remark5` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL,
  `remark6` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL,
  `des` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `ix_companyuser_ciduid`(`cid`, `uid`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of companysuser
-- ----------------------------
INSERT INTO `companysuser` VALUES (318225842662547456, 318225846856851457, 'guest', '2015-02-18 14:53:49', 1234567890123456791, NULL, NULL, NULL, NULL, NULL, NULL, '');
INSERT INTO `companysuser` VALUES (318225842662547456, 318225838468239362, 'guest', '2015-02-18 14:53:49', 1234567890123456792, NULL, NULL, NULL, NULL, NULL, NULL, '');
INSERT INTO `companysuser` VALUES (318225830079631360, 318225838468239362, 'guest', '2015-02-18 14:53:49', 1234567890123456793, NULL, NULL, NULL, NULL, NULL, NULL, '');

-- ----------------------------
-- Table structure for lovers
-- ----------------------------
DROP TABLE IF EXISTS `lovers`;
CREATE TABLE `lovers`  (
  `uname` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `idcodef` BIGINT NOT NULL DEFAULT 0,
  `email` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `referrer` BIGINT NOT NULL DEFAULT 0,
  `mobile` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `openweixin` varchar(40) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `truename` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `upby` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `uptime` datetime(0) NOT NULL,
  `id` BIGINT NOT NULL,
  `remark` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `remark2` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `remark3` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `remark4` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `remark5` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `remark6` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `cid` BIGINT NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `ix_lover_uname`(`uname`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb3 COLLATE = utf8mb3_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for lovers_auth
-- ----------------------------
DROP TABLE IF EXISTS `lovers_auth`;
CREATE TABLE `lovers_auth` (
  `ikuser` BIGINT NOT NULL,
  `pwd` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `sid` varchar(36) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `sid_web` varchar(36) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `sid_web_date` datetime NOT NULL DEFAULT '1970-01-01 00:00:00',
  `upby` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `uptime` datetime NOT NULL,
  `id` BIGINT NOT NULL,
  `remark` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `remark2` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `remark3` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `remark4` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `remark5` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `remark6` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `uid` BIGINT NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `idx_ikuser_auth` (`ikuser`) USING BTREE,
  CONSTRAINT `fk_lovers_auth_user` FOREIGN KEY (`ikuser`) REFERENCES `lovers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- ----------------------------
-- Table structure for lovers_balance
-- ----------------------------
DROP TABLE IF EXISTS `lovers_balance`;
CREATE TABLE `lovers_balance` (
  `ikuser` BIGINT NOT NULL,
  `money78` int NOT NULL DEFAULT '0',
  `consume` int NOT NULL DEFAULT '0',
  `upby` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `uptime` datetime NOT NULL,
  `id` BIGINT NOT NULL,
  `remark` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `remark2` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `remark3` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `remark4` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `remark5` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `remark6` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `uid` BIGINT NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `idx_ikuser_balance` (`ikuser`) USING BTREE,
  CONSTRAINT `fk_lovers_balance_user` FOREIGN KEY (`ikuser`) REFERENCES `lovers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- ----------------------------
-- Records of lovers_balance
-- ----------------------------
INSERT INTO `lovers_balance` (`ikuser`, `money78`, `consume`, `upby`, `uptime`, `id`, `remark`, `remark2`, `remark3`, `remark4`, `remark5`, `remark6`, `uid`) VALUES
(318225846856851457, 0, 0, '', '1900-01-01 00:00:00', 1234567890123457001, '', '', '', '', '', '', 318225846856851457),
(318225838468239362, 0, 0, '', '1900-01-01 00:00:00', 1234567890123457002, '', '', '', '', '', '', 318225838468239362);

-- ----------------------------
-- Table structure for lovers_history
-- ----------------------------
DROP TABLE IF EXISTS `lovers_history`;
CREATE TABLE `lovers_history` (
  `cid` BIGINT NOT NULL DEFAULT 0,
  `uid` BIGINT NOT NULL DEFAULT 0,
  `kind` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `usefor` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `des` varchar(500) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `num` double(19,2) NOT NULL DEFAULT '0.00',
  `ordernum` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `upby` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `uptime` datetime NOT NULL,
  `id` BIGINT NOT NULL,
  `remark` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `remark2` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `remark3` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `remark4` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `remark5` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `remark6` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

-- ----------------------------
-- Records of lovers
-- ----------------------------
INSERT INTO `lovers` VALUES ('guest', 318225842662547456, '', 318225842662547456, '', '', '', '', '1900-01-01 00:00:00', 318225846856851457, '', '', '', '', '', '', 0);
INSERT INTO `lovers` VALUES ('sysadmin', 318225830079631360, '', 318225830079631360, '', '', '', '', '1900-01-01 00:00:00', 318225838468239362, '', '', '', '', '', '', 0);

-- ----------------------------
-- Records of lovers_auth
-- ----------------------------
INSERT INTO `lovers_auth` VALUES
(318225846856851457, 'e10adc3949ba59abbe56e057f20f883e', 318225846856851457, '8573faf2-24b2-b586-adac-d9d8da9772d0', '2018-06-01 18:02:43', '', '1900-01-01 00:00:00', 1234567890123456901, '', '', '', '', '', '', 0),
(318225838468239362, 'e10adc3949ba59abbe56e057f20f883e', '9776b64d-70b2-9d61-4b24-60325ea1345e', 'a46f3ec9-b40d-6850-838e-6b897a73c72f', '2022-10-24 22:06:26', '', '1900-01-01 00:00:00', 1234567890123456902, '', '', '', '', '', '', 0);

-- ----------------------------
-- Table structure for sys_ip
-- ----------------------------
DROP TABLE IF EXISTS `sys_ip`;
CREATE TABLE `sys_ip`  (
  `cid` BIGINT NOT NULL DEFAULT 0,
  `uid` BIGINT NULL DEFAULT NULL,
  `ip` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `upby` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `uptime` datetime(0) NOT NULL,
  `id` BIGINT NOT NULL,
  `remark` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL,
  `remark2` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL,
  `remark3` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL,
  `remark4` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL,
  `remark5` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL,
  `remark6` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb3 COLLATE = utf8mb3_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of sys_ip
-- ----------------------------
INSERT INTO `sys_ip` VALUES (0, 318225846856851457, '127.0.0.1', 'guest', '2022-10-20 22:06:34', 1234567890123458001, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `sys_ip` VALUES (0, 318225846856851457, '127.0.0.1', 'guest', '2022-10-24 22:22:30', 1234567890123458002, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `sys_ip` VALUES (0, 318225846856851457, '127.0.0.1', 'guest', '2022-10-26 15:01:43', 1234567890123458003, NULL, NULL, NULL, NULL, NULL, NULL);

-- ----------------------------
-- Table structure for sys_nodejs
-- ----------------------------
DROP TABLE IF EXISTS `sys_nodejs`;
CREATE TABLE `sys_nodejs`  (
  `cid` BIGINT NOT NULL DEFAULT 0,
  `apisys` varchar(32) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `apimicro` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `apiobj` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `method` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `num` int(0) NOT NULL DEFAULT 0,
  `dlong` int(0) NOT NULL DEFAULT 0,
  `uplen` int(0) NOT NULL DEFAULT 0,
  `downlen` int(0) NOT NULL DEFAULT 0,
  `upby` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `uptime` datetime(0) NOT NULL,
  `id` BIGINT NOT NULL,
  `remark` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `remark2` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `remark3` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `remark4` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `remark5` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `remark6` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `u_v_sys_obj_method`(`apisys`, `apimicro`, `apiobj`, `method`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb3 COLLATE = utf8mb3_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of sys_nodejs
-- ----------------------------
INSERT INTO `sys_nodejs` VALUES (0, 'api7817', 'ucenter', 'lovers', '/Api7822/ucenter/lovers/login', 8, 203, 304, 1347, '', '2022-10-25 21:34:15', 1234567890123458133, '', '', '', '', '', '');
INSERT INTO `sys_nodejs` VALUES (0, 'api7817', 'TestMenu', 'Test78', '/Api7822/TestMenu/Test78/testmem', 3, 44, 0, 138, '', '2022-10-26 15:00:12', 1234567890123458199, '', '', '', '', '', '');

-- ----------------------------
-- Table structure for sys_sql
-- ----------------------------
DROP TABLE IF EXISTS `sys_sql`;
CREATE TABLE `sys_sql`  (
  `cid` BIGINT NOT NULL DEFAULT 0,
  `apisys` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `apimicro` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `apiobj` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `cmdtext` text CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `uname` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `num` int(0) NOT NULL DEFAULT 0,
  `dlong` int(0) NOT NULL DEFAULT 0,
  `downlen` int(0) NOT NULL DEFAULT 0,
  `upby` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `cmdtextmd5` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `uptime` datetime(0) NOT NULL,
  `id` BIGINT NOT NULL,
  `remark` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `remark2` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `remark3` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `remark4` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `remark5` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `remark6` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `u_v_sys_obj_cmdtext`(`apisys`, `apimicro`, `apiobj`, `cmdtextmd5`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb3 COLLATE = utf8mb3_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of sys_sql
-- ----------------------------
INSERT INTO `sys_sql` VALUES (0, '17.2', 'ucenter', 'lovers', 'insert into sys_nodejs(apisys,apimicro,apiobj, method,num,dlong,uplen,downlen,uptime,id)values(?,?,?,?,?,?,?,?,?,?)ON DUPLICATE KEY UPDATE num=num+1,dlong=dlong+?,uplen=uplen+?,downlen=downlen+?', '', 8, 39, 1032, '', '0998023bd7565d877cb04b6e707d4613', '2022-10-25 21:34:16', 1234567890123458203, '', '', '', '', '', '');
INSERT INTO `sys_sql` VALUES (0, '17.2', 'ucenter', 'lovers', ' INSERT INTO  lovers  (cid, uname,pwd,sid,sid_web,sid_web_date,id,upby,uptime,idcodef) SELECT ?,?,?,?,?,?,?,?,?,?', '', 1, 8, 166, '', '175e6e9cb95c188b2df82925c65bf33c', '2022-10-25 21:39:05', 1234567890123458226, '', '', '', '', '', '');
INSERT INTO `sys_sql` VALUES (0, '17.2', 'ucenter', 'lovers', 'UPDATE lovers SET sid_web=?,sid_web_date=?,uptime=? WHERE uname=?', '', 4, 47, 672, '', '4c6ab3975bb2ccd83f1e63447469ec96', '2022-10-25 21:40:26', 1234567890123458252, '', '', '', '', '', '');

-- ----------------------------
-- Table structure for sys_warn
-- ----------------------------
DROP TABLE IF EXISTS `sys_warn`;
CREATE TABLE `sys_warn`  (
  `uid` BIGINT NOT NULL DEFAULT 0,
  `kind` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `apimicro` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `apiobj` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `content` text CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `upid` BIGINT NOT NULL DEFAULT 0,
  `upby` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT '',
  `uptime` datetime(0) NOT NULL,
  `id` BIGINT NOT NULL,
  `remark` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `remark2` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `remark3` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `remark4` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `remark5` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `remark6` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb3 COLLATE = utf8mb3_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of sys_warn
-- ----------------------------
INSERT INTO `sys_warn` VALUES (0, 'debug_TestMenu', 'TestMenu', 'testtb', '{\n  fieldCount: 0,\n  affectedRows: 1,\n  insertId: 3,\n  serverStatus: 2,\n  warningCount: 0,\n  message: \'\',\n  protocol41: true,\n  changedRows: 0\n} c:insert into sys_ip(uid,ip, upby,uptime,id)values(?,?,?,?,?) v318225846856851457,127.0.0.1,guest,2022-10-26 15:01:43,fe3d85e6-70a5-37ca-fc1c-62cf6e6448f7', 0, 'guest', '2022-10-26 15:01:44', 1234567890123458178, '', '', '', '', '', '');
INSERT INTO `sys_warn` VALUES (0, 'debug_TestMenu', 'TestMenu', 'testtb', '[ RowDataPacket { id: \'9009408d-6430-f43b-2b56-c94a453b7f4d\' } ] c:SELECT id FROM testtb where id=?  v9009408d-6430-f43b-2b56-c94a453b7f4d', 0, 'guest', '2022-10-26 16:34:41', 1234567890123458179, '', '', '', '', '', '');
INSERT INTO `sys_warn` VALUES (0, 'debug_TestMenu', 'TestMenu', 'testtb', '{\n  fieldCount: 0,\n  affectedRows: 1,\n  insertId: 0,\n  serverStatus: 2,\n  warningCount: 0,\n  message: \'(Rows matched: 1  Changed: 1  Warnings: 0\',\n  protocol41: true,\n  changedRows: 1\n} c:UPDATE  testtb SET kind=?,upby=?,uptime=? WHERE id=? and cid=? LIMIT 1 ve75f33be-5889-8381-26ae-d37bcf002d91,guest,2022-10-26 16:34:40,9009408d-6430-f43b-2b56-c94a453b7f4d,318225842662547456', 0, 'guest', '2022-10-26 16:34:41', 1234567890123458180, '', '', '', '', '', '');

-- ----------------------------
-- Table structure for testtb
-- ----------------------------
DROP TABLE IF EXISTS `testtb`;
CREATE TABLE `testtb`  (
  `cid` BIGINT NOT NULL DEFAULT 0,
  `kind` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `item` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `data` varchar(500) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `upby` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `uptime` datetime(0) NOT NULL,
  `id` BIGINT NOT NULL,
  `remark` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `remark2` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `remark3` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `remark4` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `remark5` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `remark6` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `u_kind_item`(`cid`, `kind`, `item`) USING BTREE,
  INDEX `i_kind_item`(`kind`, `item`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb3 COLLATE = utf8mb3_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of testtb
-- ----------------------------
INSERT INTO `testtb` VALUES (318225842662547456, 'e75f33be-5889-8381-26ae-d37bcf002d91', 'itemval', '4ab4bb9f-e308-0131-8711-2c1338a32438', 'guest', '2022-10-26 16:34:40', 1234567890123459001, '', '', '', '', '', '');
INSERT INTO `testtb` VALUES (318225842662547456, 'kindval', '7316ee3c-cc05-b210-a8f0-95d473a80d91', '653cf6d9-e7d1-f5f3-5544-491bfd26a4a9', 'guest', '2022-10-18 19:10:13', 1234567890123459002, '', '', '', '', '', '');
INSERT INTO `testtb` VALUES (318225842662547456, 'kindval', 'itemval', 'dataval', 'guest', '2022-10-20 21:05:43', 1234567890123459011, '', '', '', '', '', '');

-- ----------------------------
-- Table structure for testtb2
-- ----------------------------
DROP TABLE IF EXISTS `testtb2`;
CREATE TABLE `testtb2`  (
  `cid` BIGINT NOT NULL DEFAULT 0,
  `kind` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `item` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `data` varchar(500) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `d2` varchar(500) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `d3` varchar(500) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `d4` varchar(500) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `d5` varchar(500) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `d6` varchar(500) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `upby` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `uptime` datetime(0) NOT NULL,
  `id` BIGINT NOT NULL,
  `remark` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `remark2` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `remark3` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `remark4` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `remark5` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `remark6` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `u_kind_item`(`cid`, `kind`, `item`) USING BTREE,
  INDEX `i_kind_item`(`kind`, `item`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb3 COLLATE = utf8mb3_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for testtb3
-- ----------------------------
DROP TABLE IF EXISTS `testtb3`;
CREATE TABLE `testtb3`  (
  `cid` BIGINT NOT NULL DEFAULT 0,
  `kind` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `item` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `data` varchar(500) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `d2` varchar(500) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `d3` varchar(500) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `d4` varchar(500) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `d5` varchar(500) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `d6` varchar(500) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `upby` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `uptime` datetime(0) NOT NULL,
  `id` BIGINT NOT NULL,
  `remark` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `remark2` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `remark3` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `remark4` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `remark5` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `remark6` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `u_kind_item`(`cid`, `kind`, `item`) USING BTREE,
  INDEX `i_kind_item`(`kind`, `item`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb3 COLLATE = utf8mb3_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for testtb4
-- ----------------------------
DROP TABLE IF EXISTS `testtb4`;
CREATE TABLE `testtb4`  (
  `cid` BIGINT NOT NULL DEFAULT 0,
  `kind` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `item` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `data` varchar(500) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `d2` varchar(500) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `d3` varchar(500) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `d4` varchar(500) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `d5` varchar(500) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `d6` varchar(500) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `upby` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `uptime` datetime(0) NOT NULL,
  `id` BIGINT NOT NULL,
  `remark` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `remark2` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `remark3` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `remark4` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `remark5` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `remark6` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `u_kind_item`(`cid`, `kind`, `item`) USING BTREE,
  INDEX `i_kind_item`(`kind`, `item`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb3 COLLATE = utf8mb3_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for testtb5
-- ----------------------------
DROP TABLE IF EXISTS `testtb5`;
CREATE TABLE `testtb5`  (
  `cid` BIGINT NOT NULL DEFAULT 0,
  `kind` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `item` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `data` varchar(500) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `d2` varchar(500) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `d3` varchar(500) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `d4` varchar(500) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `d5` varchar(500) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `d6` varchar(500) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `upby` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `uptime` datetime(0) NOT NULL,
  `id` BIGINT NOT NULL,
  `remark` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `remark2` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `remark3` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `remark4` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `remark5` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `remark6` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `u_kind_item`(`cid`, `kind`, `item`) USING BTREE,
  INDEX `i_kind_item`(`kind`, `item`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb3 COLLATE = utf8mb3_general_ci ROW_FORMAT = Dynamic;

DROP TABLE IF EXISTS `pars_co`;
CREATE TABLE `pars_co` (
  `cid` varchar(36) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `item` varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `data` varchar(200) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `d2` varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '',
  `d3` varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '',
  `d4` varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '',
  `d5` varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '',
  `d6` varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '',
  `upby` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `uptime` datetime NOT NULL ON UPDATE CURRENT_TIMESTAMP,
  `id` BIGINT NOT NULL,
  `remark` varchar(200) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '',
  `remark2` varchar(200) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '',
  `remark3` varchar(200) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '',
  `remark4` varchar(200) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '',
  `remark5` varchar(200) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '',
  `remark6` varchar(200) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  UNIQUE KEY `u_item` (`cid`,`item`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 ROW_FORMAT=DYNAMIC;

SET FOREIGN_KEY_CHECKS = 1;
