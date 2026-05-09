/**
 * Mysql78 缓存机制单元测试
 * 测试 clearConnectionStatements / _enforcePerConnectionLimit / getStatement 缓存
 */
import Mysql78 from '../src/dll78/Mysql78';

function createInstance() {
    return new Mysql78({
        host: '127.0.0.1',
        port: 3306,
        user: 'root',
        password: 'test',
        database: 'test',
    });
}

describe('Mysql78 缓存机制', () => {
    let instance: Mysql78;

    beforeEach(() => {
        instance = createInstance();
    });

    afterEach(async () => {
        await instance.close();
    });

    describe('clearConnectionStatements', () => {
        it('只清除指定 threadId 的缓存条目', () => {
            const cache = (instance as any)._statementCache as Map<string, any>;

            cache.set('100:SELECT * FROM a', { fake: 'stmt-a1' });
            cache.set('100:UPDATE b SET x=?', { fake: 'stmt-a2' });
            cache.set('101:SELECT * FROM a', { fake: 'stmt-b1' });
            cache.set('101:INSERT INTO c', { fake: 'stmt-b2' });
            cache.set('102:DELETE FROM d', { fake: 'stmt-c1' });

            expect(cache.size).toBe(5);

            (instance as any).clearConnectionStatements(101);

            expect(cache.size).toBe(3);
            expect(cache.has('100:SELECT * FROM a')).toBe(true);
            expect(cache.has('100:UPDATE b SET x=?')).toBe(true);
            expect(cache.has('101:SELECT * FROM a')).toBe(false);
            expect(cache.has('101:INSERT INTO c')).toBe(false);
            expect(cache.has('102:DELETE FROM d')).toBe(true);
        });

        it('不存在的 threadId 不影响缓存', () => {
            const cache = (instance as any)._statementCache as Map<string, any>;

            cache.set('100:SELECT * FROM a', { fake: 'stmt' });

            (instance as any).clearConnectionStatements(999);

            expect(cache.size).toBe(1);
            expect(cache.has('100:SELECT * FROM a')).toBe(true);
        });
    });

    describe('_enforcePerConnectionLimit', () => {
        it('超过上限时淘汰该连接的一个缓存条目', () => {
            const cache = (instance as any)._statementCache as Map<string, any>;
            const limit = (instance as any).statementPerConnectionLimit;

            for (let i = 0; i < limit; i++) {
                cache.set(`100:SELECT * FROM t${i}`, { fake: `stmt-${i}` });
            }

            expect(cache.size).toBe(limit);

            (instance as any)._enforcePerConnectionLimit(100);

            expect(cache.size).toBe(limit - 1);
        });

        it('未达上限时不清除任何条目', () => {
            const cache = (instance as any)._statementCache as Map<string, any>;

            cache.set('100:SELECT * FROM a', { fake: 'stmt-a' });
            cache.set('100:SELECT * FROM b', { fake: 'stmt-b' });
            cache.set('200:SELECT * FROM a', { fake: 'stmt-c' });

            (instance as any)._enforcePerConnectionLimit(100);

            expect(cache.size).toBe(3);
            expect(cache.has('100:SELECT * FROM a')).toBe(true);
            expect(cache.has('100:SELECT * FROM b')).toBe(true);
            expect(cache.has('200:SELECT * FROM a')).toBe(true);
        });
    });

    describe('getStatement 缓存命中', () => {
        it('同一 cmdtext 不同 threadId 互不干扰', async () => {
            const cache = (instance as any)._statementCache as Map<string, any>;

            const mockConnA = {
                threadId: 100,
                prepare: jest.fn().mockResolvedValue({ execute: jest.fn(), close: jest.fn() }),
            } as any;
            const mockConnB = {
                threadId: 200,
                prepare: jest.fn().mockResolvedValue({ execute: jest.fn(), close: jest.fn() }),
            } as any;

            const stmtA = await instance.getStatement(mockConnA, 'SELECT * FROM users WHERE id=?');
            const stmtB = await instance.getStatement(mockConnB, 'SELECT * FROM users WHERE id=?');

            expect(mockConnA.prepare).toHaveBeenCalledTimes(1);
            expect(mockConnB.prepare).toHaveBeenCalledTimes(1);

            expect(cache.has('100:SELECT * FROM users WHERE id=?')).toBe(true);
            expect(cache.has('200:SELECT * FROM users WHERE id=?')).toBe(true);

            const cachedA = await instance.getStatement(mockConnA, 'SELECT * FROM users WHERE id=?');
            const cachedB = await instance.getStatement(mockConnB, 'SELECT * FROM users WHERE id=?');

            expect(mockConnA.prepare).toHaveBeenCalledTimes(1);
            expect(mockConnB.prepare).toHaveBeenCalledTimes(1);
            expect(cachedA).toBe(stmtA);
            expect(cachedB).toBe(stmtB);
        });
    });

    describe('close 清理', () => {
        it('close() 清空缓存并释放定时器', async () => {
            const cache = (instance as any)._statementCache as Map<string, any>;
            const timer = (instance as any)._cleanupTimer;

            cache.set('100:SELECT * FROM a', { fake: 'stmt' });

            expect(timer).not.toBeNull();

            await instance.close();

            expect(cache.size).toBe(0);
            expect((instance as any)._cleanupTimer).toBeNull();
        });
    });
});