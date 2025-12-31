"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheServiceAgent = void 0;
const tslib_1 = require("tslib");
const agent_1 = require("../base/agent");
const tslog78_1 = require("tslog78");
const log = tslog78_1.TsLog78.Instance;
class CacheServiceAgent extends agent_1.Agent {
    constructor(config) {
        super();
        this.cacheStore = new Map();
        this.config = config || {};
        this.agentname = 'CacheServiceAgent';
    }
    get(key) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const item = this.cacheStore.get(key);
            if (!item) {
                return null;
            }
            // 检查是否过期
            if (item.expireAt && item.expireAt < Date.now()) {
                this.cacheStore.delete(key);
                return null;
            }
            console.log(`Retrieved from cache: ${key}`);
            return item.value;
        });
    }
    set(key, value, ttl) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const expireAt = ttl ? Date.now() + (ttl * 1000) : null;
            this.cacheStore.set(key, { value, expireAt });
            console.log(`Set in cache: ${key}, TTL: ${ttl}s`);
        });
    }
    delete(key) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            console.log(`Deleting from cache: ${key}`);
            return this.cacheStore.delete(key);
        });
    }
    exists(key) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const item = this.cacheStore.get(key);
            if (!item) {
                return false;
            }
            // 检查是否过期
            if (item.expireAt && item.expireAt < Date.now()) {
                this.cacheStore.delete(key);
                return false;
            }
            return true;
        });
    }
    clear() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.cacheStore.clear();
            console.log('Cache cleared');
        });
    }
    // 特定于业务的缓存操作
    tbget(key, debug = false) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const value = yield this.get(key);
            if (debug) {
                console.log(`TBGET ${key}:`, value);
            }
            return value;
        });
    }
    tbset(key, value, ttl) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield this.set(key, value, ttl);
        });
    }
    // Agent处理器：缓存获取任务
    executeGetTask(params) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { key, debug = false } = params;
            return yield this.tbget(key, debug);
        });
    }
    // Agent处理器：缓存设置任务
    executeSetTask(params) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { key, value, ttl } = params;
            yield this.tbset(key, value, ttl);
        });
    }
}
exports.CacheServiceAgent = CacheServiceAgent;
//# sourceMappingURL=cache-service-agent.js.map