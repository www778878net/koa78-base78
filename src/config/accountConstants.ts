/**
 * 帐套ID常量配置
 * 用于统一管理不同类型的帐套ID
 */

/**
 * 管理员帐套ID (net78)
 * 用于系统管理员操作
 */
export const CID_ADMIN = process.env.CID_ADMIN || "318225830079631360";

/**
 * 测试帐套ID (测试帐套)
 * 用于测试和开发环境
 */
export const CID_TEST = process.env.CID_TEST || "318225842662547456";

/**
 * 默认帐套ID
 * 用于新用户注册等场景
 * 默认使用测试帐套
 */
export const CID_DEFAULT = process.env.CID_DEFAULT || CID_TEST;

/**
 * 默认帐套名称
 */
export const CONAME_DEFAULT = process.env.CONAME_DEFAULT || "测试帐套";

/**
 * 测试用户ID配置
 */
export const TEST_INTERNAL_USERID = process.env.TEST_INTERNAL_USERID || "TestInternalUser";
export const TEST_EXTERNAL_USERID = process.env.TEST_EXTERNAL_USERID || "TestExternalUser";