/**
 * 雪花算法 ID 生成器 (TypeScript 版本)
 *
 * 生成分布式唯一ID，64位整数，字符串形式存储
 * 结构：时间戳(41位) + 机器ID(10位) + 序列号(12位)
 *
 * worker_id基于UUID自动生成，确保不同进程有不同的worker_id
 */
export declare function initWorkerId(id: number): void;
export declare function getWorkerId(): number;
export declare function nextId(): bigint;
export declare function nextIdString(): string;
export declare function isValidSnowflakeId(id: string): boolean;
declare const _default: {
    nextId: typeof nextId;
    nextIdString: typeof nextIdString;
    initWorkerId: typeof initWorkerId;
    getWorkerId: typeof getWorkerId;
    isValidSnowflakeId: typeof isValidSnowflakeId;
};
export default _default;
