"use strict";
/**
 * 雪花算法 ID 生成器 (TypeScript 版本)
 *
 * 生成分布式唯一ID，64位整数，字符串形式存储
 * 结构：时间戳(41位) + 机器ID(10位) + 序列号(12位)
 *
 * worker_id基于UUID自动生成，确保不同进程有不同的worker_id
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidSnowflakeId = exports.nextIdString = exports.nextId = exports.getWorkerId = exports.initWorkerId = void 0;
const crypto_1 = require("crypto");
const EPOCH = 1704067200000;
const WORKER_ID_BITS = 10;
const SEQUENCE_BITS = 12;
const MAX_WORKER_ID = (1 << WORKER_ID_BITS) - 1;
const MAX_SEQUENCE = (1 << SEQUENCE_BITS) - 1;
const WORKER_ID_SHIFT = SEQUENCE_BITS;
const TIMESTAMP_SHIFT = SEQUENCE_BITS + WORKER_ID_BITS;
let lastTimestamp = 0;
let sequence = 0;
let workerId = 0;
let workerIdInitialized = false;
function initWorkerIdAuto() {
    const uuid = (0, crypto_1.randomUUID)();
    const bytes = Buffer.from(uuid.replace(/-/g, ''), 'hex');
    const hash = (bytes[0] << 24) | (bytes[1] << 16) | (bytes[2] << 8) | bytes[3];
    workerId = Math.abs(hash) % (MAX_WORKER_ID + 1);
    workerIdInitialized = true;
}
function initWorkerId(id) {
    if (id < 0 || id > MAX_WORKER_ID) {
        throw new Error(`worker_id 超出范围: ${id}`);
    }
    workerId = id;
    workerIdInitialized = true;
}
exports.initWorkerId = initWorkerId;
function getWorkerId() {
    return workerId;
}
exports.getWorkerId = getWorkerId;
function currentMillis() {
    return Date.now();
}
function waitNextMillis(last) {
    let now = currentMillis();
    while (now <= last) {
        now = currentMillis();
    }
    return now;
}
function nextId() {
    const now = currentMillis();
    if (!workerIdInitialized) {
        initWorkerIdAuto();
    }
    if (now < lastTimestamp) {
        throw new Error('时钟回拨，拒绝生成ID');
    }
    if (now === lastTimestamp) {
        sequence++;
        if (sequence > MAX_SEQUENCE) {
            waitNextMillis(lastTimestamp);
            sequence = 0;
            lastTimestamp = now;
        }
    }
    else {
        sequence = 0;
        lastTimestamp = now;
    }
    return (BigInt(now - EPOCH) << BigInt(TIMESTAMP_SHIFT)) |
        (BigInt(workerId) << BigInt(WORKER_ID_SHIFT)) |
        BigInt(sequence);
}
exports.nextId = nextId;
function nextIdString() {
    return nextId().toString();
}
exports.nextIdString = nextIdString;
function isValidSnowflakeId(id) {
    if (!id || id.length < 16 || id.length > 19) {
        return false;
    }
    return /^\d+$/.test(id);
}
exports.isValidSnowflakeId = isValidSnowflakeId;
exports.default = {
    nextId,
    nextIdString,
    initWorkerId,
    getWorkerId,
    isValidSnowflakeId
};
//# sourceMappingURL=snowflake.js.map