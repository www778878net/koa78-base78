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

 Date: 20/10/2022 22:08:33
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for companys
-- ----------------------------
DROP TABLE IF EXISTS `companys`;
CREATE TABLE `companys`  (
  `uid` varchar(36) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL,
  `coname` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `upby` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `uptime` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0) ON UPDATE CURRENT_TIMESTAMP(0),
  `idpk` int(0) NOT NULL AUTO_INCREMENT,
  `id` varchar(36) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `remark` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL,
  `remark2` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL,
  `remark3` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL,
  `remark4` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL,
  `remark5` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL,
  `remark6` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL,
  PRIMARY KEY (`idpk`) USING BTREE,
  UNIQUE INDEX `ix_Company_name`(`coname`) USING BTREE,
  UNIQUE INDEX `ix_Company`(`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of companys
-- ----------------------------
INSERT INTO `companys` VALUES ('CD86605E-7A42-481A-9786-85010E67128A', '测试帐套', 'sysadmin', '2022-10-20 22:05:17', 1, 'GUEST000-8888-8888-8888-GUEST00GUEST', 'GUEST000-8888-8888-8888-GUEST00GUEST', '', '', '', '', '');
INSERT INTO `companys` VALUES ('CD86605E-7A42-481A-9786-85010E67128A', 'net78', 'sysadmin', '2022-10-20 22:05:10', 2, 'd4856531-e9d3-20f3-4c22-fe3c65fb009c', '', NULL, '', '', '', '');

-- ----------------------------
-- Table structure for companysuser
-- ----------------------------
DROP TABLE IF EXISTS `companysuser`;
CREATE TABLE `companysuser`  (
  `cid` varchar(36) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `uid` varchar(36) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `upby` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `uptime` datetime(0) NOT NULL,
  `idpk` int(0) NOT NULL AUTO_INCREMENT,
  `id` varchar(36) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `remark` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL,
  `remark2` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL,
  `remark3` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL,
  `remark4` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL,
  `remark5` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL,
  `remark6` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL,
  `des` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  PRIMARY KEY (`idpk`) USING BTREE,
  UNIQUE INDEX `ix_CompanysUser`(`id`) USING BTREE,
  INDEX `ix_companyuser_ciduid`(`cid`, `uid`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of companysuser
-- ----------------------------
INSERT INTO `companysuser` VALUES ('GUEST000-8888-8888-8888-GUEST00GUEST', 'GUEST888-8888-8888-8888-GUEST88GUEST', 'guest', '2015-02-18 14:53:49', 1, 'db0aee26-0378-dadf-c876-ebbcae201bda', NULL, NULL, NULL, NULL, NULL, NULL, '');
INSERT INTO `companysuser` VALUES ('GUEST000-8888-8888-8888-GUEST00GUEST', 'CD86605E-7A42-481A-9786-85010E67128A', 'guest', '2015-02-18 14:53:49', 2, 'CD86605E-7A42-481A-9786-85010E67128A', NULL, NULL, NULL, NULL, NULL, NULL, '');
INSERT INTO `companysuser` VALUES ('d4856531-e9d3-20f3-4c22-fe3c65fb009c', 'CD86605E-7A42-481A-9786-85010E67128A', 'guest', '2015-02-18 14:53:49', 3, 'd4856531-e9d3-20f3-4c22-fe3c65fb009c', NULL, NULL, NULL, NULL, NULL, NULL, '');

-- ----------------------------
-- Table structure for lovers
-- ----------------------------
DROP TABLE IF EXISTS `lovers`;
CREATE TABLE `lovers`  (
  `uname` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `pwd` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `sid` varchar(36) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL,
  `sid_web` varchar(36) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL,
  `sid_web_date` datetime(0) NULL DEFAULT NULL,
  `idcodef` varchar(36) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL,
  `upby` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `uptime` datetime(0) NOT NULL,
  `idpk` int(0) NOT NULL AUTO_INCREMENT,
  `id` varchar(36) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `remark` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL,
  `remark2` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL,
  `remark3` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL,
  `remark4` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL,
  `remark5` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL,
  `remark6` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL,
  `cid` varchar(36) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  PRIMARY KEY (`idpk`) USING BTREE,
  UNIQUE INDEX `ix_Lover`(`id`) USING BTREE,
  UNIQUE INDEX `ix_lover_uname`(`uname`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb3 COLLATE = utf8mb3_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of lovers
-- ----------------------------
INSERT INTO `lovers` VALUES ('guest', 'e10adc3949ba59abbe56e057f20f883e', 'GUEST888-8888-8888-8888-GUEST88GUEST', '8573faf2-24b2-b586-adac-d9d8da9772d0', '2018-06-01 18:02:43', 'GUEST000-8888-8888-8888-GUEST00GUEST', '', '1900-01-01 00:00:00', 1, 'GUEST888-8888-8888-8888-GUEST88GUEST', '', '', '', '', '', '', '');
INSERT INTO `lovers` VALUES ('sysadmin', 'e10adc3949ba59abbe56e057f20f883e', '9776b64d-70b2-9d61-4b24-60325ea1345e', 'a46f3ec9-b40d-6850-838e-6b897a73c72f', '2022-10-24 22:06:26', 'd4856531-e9d3-20f3-4c22-fe3c65fb009c', '', '1900-01-01 00:00:00', 2, 'CD86605E-7A42-481A-9786-85010E67128A', '', '', '', '', '', '', '');

ALTER TABLE `lovers` 
ADD COLUMN `email` varchar(50) NOT NULL DEFAULT '' AFTER `idcodef`,
ADD COLUMN `truename` varchar(20) NOT NULL DEFAULT '' AFTER `idcodef`,
ADD COLUMN `openweixin` varchar(40) NOT NULL DEFAULT '' AFTER `idcodef`,
ADD COLUMN `mobile` varchar(20) NOT NULL DEFAULT '' AFTER `idcodef`,
ADD COLUMN `referrer` varchar(36) NOT NULL DEFAULT '' AFTER `idcodef`,
ADD COLUMN `money78` int(11) NOT NULL DEFAULT 0 AFTER `truename`;
-- ----------------------------
-- Table structure for sys_ip
-- ----------------------------
DROP TABLE IF EXISTS `sys_ip`;
CREATE TABLE `sys_ip`  (
  `cid` varchar(36) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `uid` varchar(36) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL,
  `ip` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `upby` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `uptime` datetime(0) NOT NULL,
  `idpk` int(0) NOT NULL AUTO_INCREMENT,
  `id` varchar(36) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `remark` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL,
  `remark2` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL,
  `remark3` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL,
  `remark4` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL,
  `remark5` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL,
  `remark6` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL,
  PRIMARY KEY (`idpk`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb3 COLLATE = utf8mb3_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of sys_ip
-- ----------------------------
INSERT INTO `sys_ip` VALUES ('', 'GUEST888-8888-8888-8888-GUEST88GUEST', '127.0.0.1', 'guest', '2022-10-20 22:06:34', 1, 'd4ef1164-95bc-7afa-37bc-08f761577d4d', NULL, NULL, NULL, NULL, NULL, NULL);

-- ----------------------------
-- Table structure for sys_nodejs
-- ----------------------------
DROP TABLE IF EXISTS `sys_nodejs`;
CREATE TABLE `sys_nodejs`  (
  `cid` varchar(36) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `apiv` varchar(32) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `apisys` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `apiobj` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `method` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `num` int(0) NOT NULL DEFAULT 0,
  `dlong` int(0) NOT NULL DEFAULT 0,
  `uplen` int(0) NOT NULL DEFAULT 0,
  `downlen` int(0) NOT NULL DEFAULT 0,
  `upby` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `uptime` datetime(0) NOT NULL,
  `idpk` int(0) NOT NULL AUTO_INCREMENT,
  `id` varchar(36) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `remark` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `remark2` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `remark3` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `remark4` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `remark5` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `remark6` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  PRIMARY KEY (`idpk`) USING BTREE,
  UNIQUE INDEX `u_v_sys_obj_method`(`apiv`, `apisys`, `apiobj`, `method`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb3 COLLATE = utf8mb3_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of sys_nodejs
-- ----------------------------
INSERT INTO `sys_nodejs` VALUES ('', 'api7817', 'TestMenu', 'Test78', '/Api7822/TestMenu/Test78/getConfig78', 2, 57, 0, 773, '', '2022-10-20 22:06:34', 1, '35075eba-5747-a508-f450-f75b7f1f3343', '', '', '', '', '', '');
INSERT INTO `sys_nodejs` VALUES ('', 'api7817', 'TestMenu', 'Test78', '/Api7822/TestMenu/Test78/test', 2, 17, 0, 134, '', '2022-10-20 22:06:34', 2, '515f3910-3e3c-d43a-49b1-38a94ef00023', '', '', '', '', '', '');
INSERT INTO `sys_nodejs` VALUES ('', 'api7817', 'TestMenu', 'testtb', '/Api7822/TestMenu/testtb/m', 2, 73, 72, 162, '', '2022-10-20 22:06:34', 3, 'cfb4dff9-a5d3-21cf-db2f-7534ffae2a06', '', '', '', '', '', '');
INSERT INTO `sys_nodejs` VALUES ('', 'api7817', 'TestMenu', 'testtb', '/Api7822/TestMenu/testtb/get', 2, 30, 0, 860, '', '2022-10-20 22:06:34', 4, '0390bcdd-8a8b-d71f-e528-fbac23a4afdd', '', '', '', '', '', '');

-- ----------------------------
-- Table structure for sys_sql
-- ----------------------------
DROP TABLE IF EXISTS `sys_sql`;
CREATE TABLE `sys_sql`  (
  `cid` varchar(36) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `apiv` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `apisys` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `apiobj` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `cmdtext` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `uname` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `num` int(0) NOT NULL DEFAULT 0,
  `dlong` int(0) NOT NULL DEFAULT 0,
  `downlen` int(0) NOT NULL DEFAULT 0,
  `upby` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `cmdtextmd5` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `uptime` datetime(0) NOT NULL,
  `idpk` int(0) NOT NULL AUTO_INCREMENT,
  `id` varchar(36) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `remark` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `remark2` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `remark3` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `remark4` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `remark5` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `remark6` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  PRIMARY KEY (`idpk`) USING BTREE,
  UNIQUE INDEX `u_v_sys_obj_cmdtext`(`apiv`, `apisys`, `apiobj`, `cmdtext`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb3 COLLATE = utf8mb3_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of sys_sql
-- ----------------------------
INSERT INTO `sys_sql` VALUES ('', '17.2', 'TestMenu', 'testtb', 'insert into sys_nodejs(apiv,apisys,apiobj, method,num,dlong,uplen,downlen,uptime,id)values(?,?,?,?,?,?,?,?,?,?)ON DUPLICATE KEY UPDATE num=num+1,dlong=dlong+?,uplen=uplen+?,downlen=downlen+?', '', 2, 17, 254, '', '0998023bd7565d877cb04b6e707d4613', '2022-10-20 22:07:48', 5, 'ac34e219-0346-6dae-7301-7de624ecaecb', '', '', '', '', '', '');
INSERT INTO `sys_sql` VALUES ('', '17.2', 'TestMenu', 'testtb', 'SELECT `kind`,`item`,`data`,id,upby,uptime,idpk FROM testtb WHERE cid=?  limit 0,15', '', 1, 6, 387, '', 'f85191d839c9464c64845353a0b514e3', '2022-10-20 22:07:48', 6, '6d56b294-622f-ff05-bdc2-0c5a6afd05c2', '', '', '', '', '', '');

-- ----------------------------
-- Table structure for sys_warn
-- ----------------------------
DROP TABLE IF EXISTS `sys_warn`;
CREATE TABLE `sys_warn`  (
  `uid` varchar(36) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `kind` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `apisys` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `apiobj` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `content` text CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `upid` varchar(36) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `upby` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT '',
  `uptime` datetime(0) NOT NULL,
  `idpk` int(0) NOT NULL AUTO_INCREMENT,
  `id` varchar(36) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `remark` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `remark2` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `remark3` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `remark4` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `remark5` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `remark6` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  PRIMARY KEY (`idpk`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 102 CHARACTER SET = utf8mb3 COLLATE = utf8mb3_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of sys_warn
-- ----------------------------
INSERT INTO `sys_warn` VALUES ('', 'debug_TestMenu', 'TestMenu', 'testtb', '[ RowDataPacket { id: \'9009408d-6430-f43b-2b56-c94a453b7f4d\' } ] c:SELECT id FROM testtb where id=?  v9009408d-6430-f43b-2b56-c94a453b7f4d', 'd8769df4-13a1-e47b-662a-df0c01d2624e', 'guest', '2022-10-20 22:07:48', 106, '31a46df9-1a87-e379-9a5c-4711d007de70', '', '', '', '', '', '');
INSERT INTO `sys_warn` VALUES ('', 'debug_TestMenu', 'TestMenu', 'testtb', '{\n  fieldCount: 0,\n  affectedRows: 1,\n  insertId: 0,\n  serverStatus: 2,\n  warningCount: 0,\n  message: \'(Rows matched: 1  Changed: 1  Warnings: 0\',\n  protocol41: true,\n  changedRows: 1\n} c:UPDATE  testtb SET kind=?,upby=?,uptime=? WHERE id=? and cid=? LIMIT 1 vf0ddd779-72e2-26af-dd5e-04734fb0c920,guest,2022-10-20 22:07:47,9009408d-6430-f43b-2b56-c94a453b7f4d,GUEST000-8888-8888-8888-GUEST00GUEST', 'd8769df4-13a1-e47b-662a-df0c01d2624e', 'guest', '2022-10-20 22:07:48', 107, '9054b1ba-deca-c53d-8ff3-c9ba53000c75', '', '', '', '', '', '');

-- ----------------------------
-- Table structure for testtb
-- ----------------------------
DROP TABLE IF EXISTS `testtb`;
CREATE TABLE `testtb`  (
  `cid` varchar(36) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `kind` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `item` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `data` varchar(500) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `upby` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `uptime` datetime(0) NOT NULL,
  `idpk` int(0) NOT NULL AUTO_INCREMENT,
  `id` varchar(36) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `remark` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `remark2` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `remark3` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `remark4` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `remark5` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `remark6` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  PRIMARY KEY (`idpk`) USING BTREE,
  UNIQUE INDEX `ix_id`(`id`) USING BTREE,
  UNIQUE INDEX `u_kind_item`(`cid`, `kind`, `item`) USING BTREE,
  INDEX `i_kind_item`(`kind`, `item`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 11 CHARACTER SET = utf8mb3 COLLATE = utf8mb3_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of testtb
-- ----------------------------
INSERT INTO `testtb` VALUES ('GUEST000-8888-8888-8888-GUEST00GUEST', 'f0ddd779-72e2-26af-dd5e-04734fb0c920', 'itemval', '4ab4bb9f-e308-0131-8711-2c1338a32438', 'guest', '2022-10-20 22:07:47', 1, '9009408d-6430-f43b-2b56-c94a453b7f4d', '', '', '', '', '', '');
INSERT INTO `testtb` VALUES ('GUEST000-8888-8888-8888-GUEST00GUEST', 'kindval', '7316ee3c-cc05-b210-a8f0-95d473a80d91', '653cf6d9-e7d1-f5f3-5544-491bfd26a4a9', 'guest', '2022-10-18 19:10:13', 2, 'id', '', '', '', '', '', '');
INSERT INTO `testtb` VALUES ('cidval', 'kindval', 'itemval', 'dataval', 'guest', '2022-10-20 21:05:43', 11, '9d192fd2-5883-3ce8-0726-32dceb3ee312', '', '', '', '', '', '');

SET FOREIGN_KEY_CHECKS = 1;
