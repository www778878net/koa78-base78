"use strict";
var CacheService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheService = void 0;
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
let CacheService = CacheService_1 = class CacheService {
    constructor() {
        if (!CacheService_1.instance) {
            CacheService_1.instance = this;
        }
        return CacheService_1.instance;
    }
    setMemcache(dbConnections) {
        this.memcache = dbConnections.memcache;
        this.redis = dbConnections.redis;
    }
    get(key) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!this.memcache)
                return null;
            return yield this.memcache.get(key);
        });
    }
    incr(key) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!this.memcache)
                return null;
            return yield this.memcache.incr(key);
        });
    }
    del(key) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!this.memcache)
                return null;
            return yield this.memcache.del(key);
        });
    }
    set(key, value, expiration = 86400) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!this.memcache)
                return false;
            return yield this.memcache.set(key, String(value), expiration);
        });
    }
    add(key, value, expiration = 86400) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!this.memcache)
                return false;
            return this.memcache.add(key, String(value), expiration);
        });
    }
    tbget(key, debug) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!this.memcache)
                return null;
            return this.memcache.tbget(key, debug);
        });
    }
    tbset(key, value) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!this.memcache)
                return false;
            return this.memcache.tbset(key, value);
        });
    }
    redisGet(key) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!this.redis) {
                return null;
            }
            return this.redis.get(key);
        });
    }
    redisSet(key, value, expiration) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!this.redis) {
                return '';
            }
            return this.redis.set(key, value, expiration);
        });
    }
    lpop(key) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!this.redis) {
                return null;
            }
            return this.redis.lpop(key);
        });
    }
    llen(listname) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!this.redis) {
                return 0;
            }
            return this.redis.llen(listname);
        });
    }
    rpush(listname, key) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!this.redis) {
                return 0;
            }
            return this.redis.rpush(listname, key);
        });
    }
    lpush(listname, key) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!this.redis) {
                return 0;
            }
            return this.redis.lpush(listname, key);
        });
    }
};
CacheService = CacheService_1 = tslib_1.__decorate([
    (0, inversify_1.injectable)(),
    tslib_1.__metadata("design:paramtypes", [])
], CacheService);
exports.CacheService = CacheService;
//# sourceMappingURL=CacheService.js.map