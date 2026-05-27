/**
 * 雪花算法 ID 生成器 (TypeScript 版本)
 * 
 * 生成分布式唯一ID，64位整数，字符串形式存储
 * 结构：时间戳(41位) + 机器ID(10位) + 序列号(12位)
 * 
 * worker_id基于UUID自动生成，确保不同进程有不同的worker_id
 */

import { randomUUID } from 'crypto';

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

function initWorkerIdAuto(): void {
    const uuid = randomUUID();
    const bytes = Buffer.from(uuid.replace(/-/g, ''), 'hex');
    const hash = (bytes[0] << 24) | (bytes[1] << 16) | (bytes[2] << 8) | bytes[3];
    workerId = Math.abs(hash) % (MAX_WORKER_ID + 1);
    workerIdInitialized = true;
}

export function initWorkerId(id: number): void {
    if (id < 0 || id > MAX_WORKER_ID) {
        throw new Error(`worker_id 超出范围: ${id}`);
    }
    workerId = id;
    workerIdInitialized = true;
}

export function getWorkerId(): number {
    return workerId;
}

function currentMillis(): number {
    return Date.now();
}

function waitNextMillis(last: number): number {
    let now = currentMillis();
    while (now <= last) {
        now = currentMillis();
    }
    return now;
}

export function nextId(): bigint {
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
    } else {
        sequence = 0;
        lastTimestamp = now;
    }
    
    return (BigInt(now - EPOCH) << BigInt(TIMESTAMP_SHIFT)) | 
           (BigInt(workerId) << BigInt(WORKER_ID_SHIFT)) | 
           BigInt(sequence);
}

export function nextIdString(): string {
    return nextId().toString();
}

export function isValidSnowflakeId(id: string): boolean {
    if (!id || id.length < 16 || id.length > 19) {
        return false;
    }
    return /^\d+$/.test(id);
}

export default {
    nextId,
    nextIdString,
    initWorkerId,
    getWorkerId,
    isValidSnowflakeId
};
