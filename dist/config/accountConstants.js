"use strict";
/**
 * 帐套ID常量配置
 * 用于统一管理不同类型的帐套ID
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TEST_EXTERNAL_USERID = exports.TEST_INTERNAL_USERID = exports.CONAME_DEFAULT = exports.CID_DEFAULT = exports.CID_TEST = exports.CID_ADMIN = void 0;
/**
 * 管理员帐套ID (net78)
 * 用于系统管理员操作
 */
exports.CID_ADMIN = process.env.CID_ADMIN || "318225830079631360";
/**
 * 测试帐套ID (测试帐套)
 * 用于测试和开发环境
 */
exports.CID_TEST = process.env.CID_TEST || "318225842662547456";
/**
 * 默认帐套ID
 * 用于新用户注册等场景
 * 默认使用测试帐套
 */
exports.CID_DEFAULT = process.env.CID_DEFAULT || exports.CID_TEST;
/**
 * 默认帐套名称
 */
exports.CONAME_DEFAULT = process.env.CONAME_DEFAULT || "测试帐套";
/**
 * 测试用户ID配置
 */
exports.TEST_INTERNAL_USERID = process.env.TEST_INTERNAL_USERID || "TestInternalUser";
exports.TEST_EXTERNAL_USERID = process.env.TEST_EXTERNAL_USERID || "TestExternalUser";
//# sourceMappingURL=accountConstants.js.map