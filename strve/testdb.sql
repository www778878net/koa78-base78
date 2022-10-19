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

 Date: 19/10/2022 21:24:26
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
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of companys
-- ----------------------------
INSERT INTO `companys` VALUES ('CD86605E-7A42-481A-9786-85010E67128A', '测试帐套', 'sysmessage', '2022-10-18 23:38:53', 1, 'GUEST000-8888-8888-8888-GUEST00GUEST', 'GUEST000-8888-8888-8888-GUEST00GUEST', '', '', '', '', '');

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
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of companysuser
-- ----------------------------
INSERT INTO `companysuser` VALUES ('GUEST000-8888-8888-8888-GUEST00GUEST', 'GUEST888-8888-8888-8888-GUEST88GUEST', 'guest', '2015-02-18 14:53:49', 1, 'db0aee26-0378-dadf-c876-ebbcae201bda', NULL, NULL, NULL, NULL, NULL, NULL, '');
INSERT INTO `companysuser` VALUES ('GUEST000-8888-8888-8888-GUEST00GUEST', 'CD86605E-7A42-481A-9786-85010E67128A', 'guest', '2015-02-18 14:53:49', 2, 'CD86605E-7A42-481A-9786-85010E67128A', NULL, NULL, NULL, NULL, NULL, NULL, '');

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
) ENGINE = InnoDB CHARACTER SET = utf8mb3 COLLATE = utf8mb3_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of lovers
-- ----------------------------
INSERT INTO `lovers` VALUES ('guest', 'e10adc3949ba59abbe56e057f20f883e', 'GUEST888-8888-8888-8888-GUEST88GUEST', '8573faf2-24b2-b586-adac-d9d8da9772d0', '2018-06-01 18:02:43', 'GUEST000-8888-8888-8888-GUEST00GUEST', '', '1900-01-01 00:00:00', 1, 'GUEST888-8888-8888-8888-GUEST88GUEST', '', '', '', '', '', '', '');
INSERT INTO `lovers` VALUES ('admin', 'e10adc3949ba59abbe56e057f20f883e', '9776b64d-70b2-9d61-4b24-60325ea1345e', 'a46f3ec9-b40d-6850-838e-6b897a73c72f', '2022-10-24 22:06:26', 'd4856531-e9d3-20f3-4c22-fe3c65fb009c', '', '1900-01-01 00:00:00', 2, 'CD86605E-7A42-481A-9786-85010E67128A', '', '', '', '', '', '', '');

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
) ENGINE = InnoDB AUTO_INCREMENT = 31 CHARACTER SET = utf8mb3 COLLATE = utf8mb3_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of sys_warn
-- ----------------------------
INSERT INTO `sys_warn` VALUES ('', 'debug_TestMenu', 'TestMenu', 'testtb', '[\n  RowDataPacket {\n    uname: \'guest\',\n    pwd: \'e10adc3949ba59abbe56e057f20f883e\',\n    id: \'GUEST888-8888-8888-8888-GUEST88GUEST\',\n    upby: \'\',\n    uptime: \'1900-01-01 00:00:00\',\n    sid_web_date: \'2018-06-01 18:02:43\',\n    idcoDef: \'GUEST000-8888-8888-8888-GUEST00GUEST\',\n    idpk: 1,\n    coname: \'测试帐套\',\n    idceo: \'CD86605E-7A42-481A-9786-85010E67128A\',\n    cid: \'GUEST000-8888-8888-8888-GUEST00GUEST\'\n  }\n] c:select t1.* ,companys.coname,companys.uid as idceo,companys.id as cid  from    (SELECT uname,pwd,id,upby,uptime,sid_web_date,    idcoDef,idpk   FROM lovers Where sid=? or sid_web=?)as t1 LEFT JOIN `companysuser` as t2 on t2.uid=t1.id and t2.cid=t1.idcodef left join companys    on t1.idcodef=companys.id vGUEST888-8888-8888-8888-GUEST88GUEST,GUEST888-8888-8888-8888-GUEST88GUEST', '80801fbd-481b-e3a5-db87-e98fb0ca6816', '��', '2022-10-19 21:23:13', 31, '601f759a-b186-4e2e-ddb9-92c6ec09c6ea', '', '', '', '', '', '');
INSERT INTO `sys_warn` VALUES ('', 'debug_TestMenu', 'TestMenu', 'testtb', '[ RowDataPacket { id: \'9009408d-6430-f43b-2b56-c94a453b7f4d\' } ] c:SELECT id FROM testtb where id=?  v9009408d-6430-f43b-2b56-c94a453b7f4d', '80801fbd-481b-e3a5-db87-e98fb0ca6816', 'guest', '2022-10-19 21:23:13', 32, '69e4dd8b-27f1-a0e1-f312-1a8bc249bf79', '', '', '', '', '', '');
INSERT INTO `sys_warn` VALUES ('', 'debug_TestMenu', 'TestMenu', 'testtb', '{\n  fieldCount: 0,\n  affectedRows: 0,\n  insertId: 0,\n  serverStatus: 2,\n  warningCount: 0,\n  message: \'(Rows matched: 0  Changed: 0  Warnings: 0\',\n  protocol41: true,\n  changedRows: 0\n} c:UPDATE  testtb SET kind=?,upby=?,uptime=? WHERE id=? and cid=? LIMIT 1 v5d95ee86-7136-ba70-1bef-d489e6f7ff93,guest,2022-10-19 21:23:13,9009408d-6430-f43b-2b56-c94a453b7f4d,GUEST000-8888-8888-8888-GUEST00GUEST', '80801fbd-481b-e3a5-db87-e98fb0ca6816', 'guest', '2022-10-19 21:23:13', 33, '1442bb44-3ca2-3529-ab58-15c66efd6c65', '', '', '', '', '', '');
INSERT INTO `sys_warn` VALUES ('', 'debug_TestMenu', 'TestMenu', 'testtb', '[\n  RowDataPacket {\n    uname: \'guest\',\n    pwd: \'e10adc3949ba59abbe56e057f20f883e\',\n    id: \'GUEST888-8888-8888-8888-GUEST88GUEST\',\n    upby: \'\',\n    uptime: \'1900-01-01 00:00:00\',\n    sid_web_date: \'2018-06-01 18:02:43\',\n    idcoDef: \'GUEST000-8888-8888-8888-GUEST00GUEST\',\n    idpk: 1,\n    coname: \'测试帐套\',\n    idceo: \'CD86605E-7A42-481A-9786-85010E67128A\',\n    cid: \'GUEST000-8888-8888-8888-GUEST00GUEST\'\n  }\n] c:select t1.* ,companys.coname,companys.uid as idceo,companys.id as cid  from    (SELECT uname,pwd,id,upby,uptime,sid_web_date,    idcoDef,idpk   FROM lovers Where sid=? or sid_web=?)as t1 LEFT JOIN `companysuser` as t2 on t2.uid=t1.id and t2.cid=t1.idcodef left join companys    on t1.idcodef=companys.id vGUEST888-8888-8888-8888-GUEST88GUEST,GUEST888-8888-8888-8888-GUEST88GUEST', '388122ba-7434-15db-de13-553dd69e1ee3', '��', '2022-10-19 21:23:57', 34, '268b8d6e-42f3-4828-fe45-46b9d80c3a81', '', '', '', '', '', '');
INSERT INTO `sys_warn` VALUES ('', 'debug_TestMenu', 'TestMenu', 'testtb', '[ RowDataPacket { id: \'9009408d-6430-f43b-2b56-c94a453b7f4d\' } ] c:SELECT id FROM testtb where id=?  v9009408d-6430-f43b-2b56-c94a453b7f4d', '388122ba-7434-15db-de13-553dd69e1ee3', 'guest', '2022-10-19 21:23:57', 35, 'd01b31fe-823d-ea07-c402-79792531faa9', '', '', '', '', '', '');
INSERT INTO `sys_warn` VALUES ('', 'debug_TestMenu', 'TestMenu', 'testtb', '{\n  fieldCount: 0,\n  affectedRows: 1,\n  insertId: 0,\n  serverStatus: 2,\n  warningCount: 0,\n  message: \'(Rows matched: 1  Changed: 1  Warnings: 0\',\n  protocol41: true,\n  changedRows: 1\n} c:UPDATE  testtb SET kind=?,upby=?,uptime=? WHERE id=? and cid=? LIMIT 1 v9e883296-29bf-f07f-d542-2c8f52537bb0,guest,2022-10-19 21:23:57,9009408d-6430-f43b-2b56-c94a453b7f4d,GUEST000-8888-8888-8888-GUEST00GUEST', '388122ba-7434-15db-de13-553dd69e1ee3', 'guest', '2022-10-19 21:23:57', 36, '7d82aecd-4a46-ab93-52f5-829dac0ee503', '', '', '', '', '', '');

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
INSERT INTO `testtb` VALUES ('GUEST000-8888-8888-8888-GUEST00GUEST', '9e883296-29bf-f07f-d542-2c8f52537bb0', 'itemval', '939296c5-8cbb-65a9-ed84-df3e286fa3a1', 'guest', '2022-10-19 21:23:57', 1, '9009408d-6430-f43b-2b56-c94a453b7f4d', '', '', '', '', '', '');
INSERT INTO `testtb` VALUES ('GUEST000-8888-8888-8888-GUEST00GUEST', 'kindval', 'aa86c9b6-686c-26f5-edbd-92369629f033', '653cf6d9-e7d1-f5f3-5544-491bfd26a4a9', 'guest', '2022-10-18 19:10:13', 2, 'id', '', '', '', '', '', '');

SET FOREIGN_KEY_CHECKS = 1;
