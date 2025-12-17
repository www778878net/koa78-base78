"use strict";
var Elasticsearch78_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Elasticsearch78 = void 0;
const tslib_1 = require("tslib");
const elasticsearch_1 = require("@elastic/elasticsearch");
const inversify_1 = require("inversify");
const Config_1 = require("../config/Config");
/**
 * @experimental 此类为实验性实现，API可能会在未来版本中发生变化
 * 建议在生产环境中谨慎使用，并关注后续版本的变更通知
 */
let Elasticsearch78 = Elasticsearch78_1 = class Elasticsearch78 {
    constructor() {
        this.client = null;
        const config = Config_1.Config.getInstance();
        const esConfig = config.get('elasticsearch');
        if (!esConfig || !esConfig.node) {
            console.warn('Elasticsearch configuration is missing');
            return;
        }
        const clientOptions = {
            node: esConfig.node,
            requestTimeout: 60000, // 设置超时时间为60秒
        };
        if (esConfig.username && esConfig.password) {
            clientOptions.auth = {
                username: esConfig.username,
                password: esConfig.password,
            };
        }
        this.client = new elasticsearch_1.Client(clientOptions);
        // 打印初始化信息以进行调试
        console.log('Elasticsearch client initialized with options:', clientOptions);
    }
    static getInstance() {
        if (!Elasticsearch78_1.instance) {
            Elasticsearch78_1.instance = new Elasticsearch78_1();
        }
        return Elasticsearch78_1.instance;
    }
    /**
     * @deprecated Use search250623 instead
     */
    search(params) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!this.client) {
                console.warn('Elasticsearch client is not initialized.');
                return null;
            }
            try {
                return yield this.client.search({
                    index: params.index,
                    body: params.body,
                    size: params.size || 10
                });
            }
            catch (error) {
                console.error('Elasticsearch search error:', error);
                return null;
            }
        });
    }
    search250623(params) {
        var _a;
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!this.client) {
                throw new Error('Elasticsearch client is not initialized.');
            }
            // 将size参数合并到body中（优先使用params.size > params.body.size > 默认值）
            const requestParams = {
                index: params.index,
                size: (_a = params.body.size) !== null && _a !== void 0 ? _a : 100,
                body: params.body
            };
            const response = yield this.client.search(requestParams);
            return response;
        });
    }
    /**
     * 修改或新增，支持指定字段替换
     * @param index
     * @param id
     * @param data
     * @param updateFields
     * @param replaceFields
     * @returns
     */
    upsertDataWithReplace(index, id, data, updateFields, replaceFields) {
        var _a, _b, _c;
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!this.client) {
                console.warn('Elasticsearch client is not initialized.');
                return null;
            }
            // 获取当前时间戳
            const timestamp = new Date().toISOString();
            // 更新脚本，增加 timestamp 字段的修改
            const scriptSourceParts = [
                ...Object.keys(updateFields).map(key => `ctx._source.${key} += params.${key}`),
                ...Object.keys(replaceFields).map(key => `ctx._source.${key} = params.${key}`),
                `ctx._source['@timestamp'] = '${timestamp}'` // 直接设置
            ];
            const scriptSource = scriptSourceParts.join('; ');
            const scriptParams = Object.assign(Object.assign({}, updateFields), replaceFields);
            // Logging the body for debugging purposes
            const body = {
                script: {
                    source: scriptSource,
                    params: scriptParams
                },
                upsert: data,
            };
            //console.log('Request Body:', JSON.stringify(body, null, 2));
            const retries = 3;
            for (let attempt = 0; attempt < retries; attempt++) {
                try {
                    const response = yield this.client.update({
                        index: index,
                        id: id,
                        body: body,
                    });
                    //console.log('Data upserted:', response);
                    return response;
                }
                catch (error) {
                    if (((_c = (_b = (_a = error.meta) === null || _a === void 0 ? void 0 : _a.body) === null || _b === void 0 ? void 0 : _b.error) === null || _c === void 0 ? void 0 : _c.type) === 'version_conflict_engine_exception') {
                        //console.warn(`Version conflict detected. Retrying (${attempt + 1}/${retries})...`);
                        continue;
                    }
                    console.log('Request Body:', JSON.stringify(body, null, 2)); // Log the request body
                    console.error('Error upserting data:', error);
                    return null;
                }
            }
            return null;
        });
    }
    /**
     * 弃用 换upsertDataWithReplace 修改或新增
     * @param index
     * @param id
     * @param data
     * @param updateData
     * @returns
     */
    upsertData(index, id, data, updateFields) {
        var _a, _b, _c;
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!this.client) {
                //console.warn('Elasticsearch client is not initialized.');
                return null;
            }
            // 获取当前时间戳
            const timestamp = new Date().toISOString();
            // 更新脚本，增加 timestamp 字段的修改
            const scriptSource = Object.keys(updateFields)
                .map(key => `ctx._source.${key} += params.${key}`)
                .concat([`ctx._source.timestamp = params.timestamp`]) // 添加更新 timestamp 字段的逻辑
                .join('; ');
            const scriptParams = Object.assign(Object.assign({}, updateFields), { timestamp: timestamp });
            // Logging the body for debugging purposes
            const body = {
                script: {
                    source: scriptSource,
                    params: scriptParams
                },
                upsert: data,
            };
            const retries = 3;
            for (let attempt = 0; attempt < retries; attempt++) {
                try {
                    const response = yield this.client.update({
                        index: index,
                        id: id,
                        body: body,
                    });
                    //console.log('Data upserted:', response);
                    return response;
                }
                catch (error) {
                    if (((_c = (_b = (_a = error.meta) === null || _a === void 0 ? void 0 : _a.body) === null || _b === void 0 ? void 0 : _b.error) === null || _c === void 0 ? void 0 : _c.type) === 'version_conflict_engine_exception') {
                        //console.warn(`Version conflict detected. Retrying (${attempt + 1}/${retries})...`);
                        continue;
                    }
                    console.log('Request Body:', JSON.stringify(body, null, 2)); // Log the request body
                    console.error('Error upserting data:', error);
                    return null;
                }
            }
            return null;
        });
    }
    // 添加数据
    add(index, data, id, refresh = false) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!this.client) {
                console.warn('Elasticsearch client is not initialized.');
                return null;
            }
            try {
                const response = yield this.client.index({
                    index: index,
                    id: id,
                    body: data,
                    refresh: refresh // 新增refresh参数控制立即刷新
                });
                return response;
            }
            catch (error) {
                console.error('Error adding data:', error);
                return null;
            }
        });
    }
    // 如果文档不存在则添加数据
    addIfNotExists(index, data, id, refresh = false) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!this.client) {
                console.warn('Elasticsearch client is not initialized.');
                return null;
            }
            try {
                // 首先检查索引是否存在（包括数据流和别名）
                const indexExists = yield this.client.indices.exists({
                    index: index
                });
                if (!indexExists) {
                    console.error(`索引 ${index} 不存在！`);
                    return null;
                }
                // 使用search API检查文档是否存在，避免exists API的问题
                const searchResponse = yield this.client.search({
                    index: index,
                    body: {
                        query: {
                            ids: {
                                values: [id]
                            }
                        },
                        size: 1
                    }
                });
                // 如果找到文档，说明已存在
                const totalHits = searchResponse.hits.total;
                const hitCount = typeof totalHits === 'number' ? totalHits : (totalHits === null || totalHits === void 0 ? void 0 : totalHits.value) || 0;
                if (hitCount > 0) {
                    console.log(`Document with id ${id} already exists in index ${index}`);
                    return { result: 'exists' };
                }
                // 如果文档不存在，则添加新文档
                const response = yield this.client.index({
                    index: index,
                    id: id,
                    body: data,
                    refresh: refresh
                });
                return response;
            }
            catch (error) {
                console.error('Error in addIfNotExists:', JSON.stringify(error, null, 2));
                console.error('Index:', index, 'ID:', id, 'Data:', JSON.stringify(data, null, 2));
                return null;
            }
        });
    }
    // 查询数据
    get(index, body, size = 100, isdebug = false) {
        var _a;
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!this.client) {
                console.warn('Elasticsearch client is not initialized.');
                return null;
            }
            try {
                const response = yield this.client.search({
                    index: index,
                    body: body,
                    size: size // 设置返回的记录数量
                });
                if (isdebug) {
                    console.debug(`Elasticsearch Search Request:
                    Index: ${index}
                    Body: ${JSON.stringify({
                        index: index,
                        body: body,
                        size: size // 设置返回的记录数量
                    }, null, 2)}
                    Response: ${JSON.stringify(response, null, 2)}`);
                }
                // Safely access response.hits.total.value with optional chaining and fallback value
                const totalHits = (_a = response.hits.total) !== null && _a !== void 0 ? _a : 0; // Default to 0 if undefined
                // If totalHits is 0, return an empty array
                if (totalHits === 0) {
                    return [];
                }
                //console.log('Data retrieved:', response);
                return response.hits.hits.map(hit => (Object.assign({ id: hit._id }, hit._source)));
            }
            catch (error) {
                // 发生错误时打印请求体
                console.error('Error retrieving data. Request body:', body);
                console.error('Error:', error); // 打印错误信息
                return null;
            }
        });
    }
    // 修改数据
    updateById(index, id, newData, refresh = false, updateTimestamp = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!this.client) {
                console.warn('Elasticsearch client is not initialized.');
                return null;
            }
            // 可控地添加 @timestamp 字段
            const updatedData = updateTimestamp
                ? Object.assign(Object.assign({}, newData), { '@timestamp': new Date().toISOString() }) : Object.assign({}, newData);
            try {
                const response = yield this.client.update({
                    index: index,
                    id: id,
                    refresh: refresh,
                    body: {
                        doc: updatedData,
                    },
                });
                //console.log('Data updated:', response);
                return response;
            }
            catch (error) {
                console.error('Error updating data:', error);
                return null;
            }
        });
    }
    updateByQuerySize(index, body, size = 10) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // await updateByQuerySize('my_index', {
            //     query: {
            //         match: { status: 'active' }
            //     },
            //     script: {
            //         source: "ctx._source.updated = true;"
            //     }
            // }, 5);
            if (!this.client) {
                console.warn('Elasticsearch client is not initialized.');
                return null;
            }
            try {
                const response = yield this.client.updateByQuery({
                    index: index,
                    body: Object.assign({}, body),
                    max_docs: size // 使用 max_docs 来限制更新的文档数
                });
                //console.log('Data updated by query:', response);
                return response;
            }
            catch (error) {
                console.error('Error updating data by query:', error);
                return null;
            }
        });
    }
    // 根据查询条件更新数据
    updateByQuery(index, body) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!this.client) {
                console.warn('Elasticsearch client is not initialized.');
                return null;
            }
            try {
                const response = yield this.client.updateByQuery({
                    index: index,
                    body: body
                });
                //console.log('Data updated by query:', response);
                return response;
            }
            catch (error) {
                console.error('Error updating data by query:', error);
                return null;
            }
        });
    }
    // 根据查询条件删除数据
    deleteByQuery(index, body) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!this.client) {
                console.warn('Elasticsearch client is not initialized.');
                return null;
            }
            try {
                const response = yield this.client.deleteByQuery({
                    index: index,
                    body: body
                });
                //console.log('Data deleted by query:', response);
                return response;
            }
            catch (error) {
                console.error('Error deleting data by query:', error);
                return null;
            }
        });
    }
    // 删除数据
    delete(index, id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!this.client) {
                console.warn('Elasticsearch client is not initialized.');
                return null;
            }
            try {
                const response = yield this.client.delete({
                    index: index,
                    id: id,
                });
                //console.log('Data deleted:', response);
                return response;
            }
            catch (error) {
                console.error('Error deleting data:', error);
                return null;
            }
        });
    }
};
Elasticsearch78.instance = null;
Elasticsearch78 = Elasticsearch78_1 = tslib_1.__decorate([
    (0, inversify_1.injectable)(),
    tslib_1.__metadata("design:paramtypes", [])
], Elasticsearch78);
exports.Elasticsearch78 = Elasticsearch78;
exports.default = Elasticsearch78;
//# sourceMappingURL=elasticsearch78.js.map