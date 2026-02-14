import { Client } from '@elastic/elasticsearch';
import { injectable } from 'inversify';
import { Config } from '../config/Config';
import UpInfo from '../UpInfo';
import { SearchResponse } from '@elastic/elasticsearch/lib/api/types';

/**
 * @experimental 此类为实验性实现，API可能会在未来版本中发生变化
 * 建议在生产环境中谨慎使用，并关注后续版本的变更通知
 */
@injectable()
export default class Elasticsearch78 {
    private static instance: Elasticsearch78 | null = null;
    private client: Client | null = null;

    public constructor() {
        const config = Config.getInstance();
        const esConfig = config.get('elasticsearch');

        if (!esConfig || !esConfig.node) {
            console.warn('Elasticsearch configuration is missing');
            return;
        }

        const clientOptions: any = {
            node: esConfig.node,
            requestTimeout: 60000, // 设置超时时间为60秒
        };

        if (esConfig.username && esConfig.password) {
            clientOptions.auth = {
                username: esConfig.username,
                password: esConfig.password,
            };
        }

        this.client = new Client(clientOptions);
        // 打印初始化信息以进行调试
        console.log('Elasticsearch client initialized with options:', clientOptions);
    }

    public static getInstance(): Elasticsearch78 {
        if (!Elasticsearch78.instance) {
            Elasticsearch78.instance = new Elasticsearch78();
        }
        return Elasticsearch78.instance;
    }

    /**
     * @deprecated Use search250623 instead
     */
    public async search<T = any>(params: {
        index: string | string[];
        body: object;
        size?: number;
    }): Promise<SearchResponse<T> | null> {
        if (!this.client) {
            console.warn('Elasticsearch client is not initialized.');
            return null;
        }

        try {
            return await this.client.search({
                index: params.index,
                body: params.body,
                size: params.size || 10
            });
        } catch (error) {
            console.error('Elasticsearch search error:', error);
            return null;
        }
    }

    public async search250623<T = any>(params: {
        index: string | string[];
        body: { size?: number } & object;

    }): Promise<SearchResponse<T>> {
        if (!this.client) {
            throw new Error('Elasticsearch client is not initialized.');
        }

        // 将size参数合并到body中（优先使用params.size > params.body.size > 默认值）
        const requestParams: any = {
            index: params.index,
            size: params.body.size ?? 100,
            body: params.body
        };

        const response = await this.client.search<T>(requestParams);
        return response;
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
    public async upsertDataWithReplace(index: string, id: string, data: object, updateFields: { [key: string]: any }, replaceFields: { [key: string]: any }) {
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

        const scriptParams = {
            ...updateFields,
            ...replaceFields
        };

        // Logging the body for debugging purposes
        const body: any = {
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
                const response: any = await this.client.update({
                    index: index,
                    id: id,
                    body: body,
                });
                //console.log('Data upserted:', response);
                return response;
            } catch (error) {
                if (error.meta?.body?.error?.type === 'version_conflict_engine_exception') {
                    //console.warn(`Version conflict detected. Retrying (${attempt + 1}/${retries})...`);
                    continue;
                }
                console.log('Request Body:', JSON.stringify(body, null, 2));  // Log the request body
                console.error('Error upserting data:', error);
                return null;
            }
        }
        return null;
    }

    /**
     * 弃用 换upsertDataWithReplace 修改或新增
     * @param index 
     * @param id 
     * @param data 
     * @param updateData 
     * @returns 
     */
    public async upsertData(index: string, id: string, data: object, updateFields: { [key: string]: any }) {
        if (!this.client) {
            //console.warn('Elasticsearch client is not initialized.');
            return null;
        }

        // 获取当前时间戳
        const timestamp = new Date().toISOString();

        // 更新脚本，增加 timestamp 字段的修改
        const scriptSource = Object.keys(updateFields)
            .map(key => `ctx._source.${key} += params.${key}`)
            .concat([`ctx._source.timestamp = params.timestamp`])  // 添加更新 timestamp 字段的逻辑
            .join('; ');

        const scriptParams = {
            ...updateFields,
            timestamp: timestamp,  // 将当前时间戳添加到 params 中
        };

        // Logging the body for debugging purposes
        const body: any = {
            script: {
                source: scriptSource,
                params: scriptParams
            },
            upsert: data,
        };

        const retries = 3;
        for (let attempt = 0; attempt < retries; attempt++) {
            try {
                const response = await this.client.update({
                    index: index,
                    id: id,
                    body: body,
                });
                //console.log('Data upserted:', response);
                return response;
            } catch (error) {
                if (error.meta?.body?.error?.type === 'version_conflict_engine_exception') {
                    //console.warn(`Version conflict detected. Retrying (${attempt + 1}/${retries})...`);
                    continue;
                }
                console.log('Request Body:', JSON.stringify(body, null, 2));  // Log the request body
                console.error('Error upserting data:', error);
                return null;
            }
        }
        return null
    }

    // 添加数据
    public async add(index: string, data: object, id?: string, refresh: boolean = false) {
        if (!this.client) {
            console.warn('Elasticsearch client is not initialized.');
            return null;
        }

        try {
            const response = await this.client.index({
                index: index,
                id: id,
                body: data,
                refresh: refresh // 新增refresh参数控制立即刷新
            });
            return response;
        } catch (error) {
            console.error('Error adding data:', error);
            return null;
        }
    }

    // 如果文档不存在则添加数据
    public async addIfNotExists(index: string, data: object, id: string, refresh: boolean = false) {
        if (!this.client) {
            console.warn('Elasticsearch client is not initialized.');
            return null;
        }

        try {
            // 首先检查索引是否存在（包括数据流和别名）
            const indexExists = await this.client.indices.exists({
                index: index
            });

            if (!indexExists) {
                console.error(`索引 ${index} 不存在！`);
                return null;
            }




            // 使用search API检查文档是否存在，避免exists API的问题
            const searchResponse: any = await this.client.search({
                index: index,
                body: {
                    query: {
                        ids: {
                            values: [id]
                        }
                    },
                    size: 1
                } as any
            });

            // 如果找到文档，说明已存在
            const totalHits = searchResponse.hits.total;
            const hitCount = typeof totalHits === 'number' ? totalHits : totalHits?.value || 0;

            if (hitCount > 0) {
                console.log(`Document with id ${id} already exists in index ${index}`);
                return { result: 'exists' };
            }

            // 如果文档不存在，则添加新文档
            const response = await this.client.index({
                index: index,
                id: id,
                body: data,
                refresh: refresh
            });

            return response;
        } catch (error) {
            console.error('Error in addIfNotExists:', JSON.stringify(error, null, 2));
            console.error('Index:', index, 'ID:', id, 'Data:', JSON.stringify(data, null, 2));


            return null;
        }
    }

    // 查询数据
    public async get(index: string, body: object, size: number = 100, isdebug: boolean = false) {
        if (!this.client) {
            console.warn('Elasticsearch client is not initialized.');
            return null;
        }

        try {
            const response = await this.client.search({
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
            const totalHits = response.hits.total ?? 0; // Default to 0 if undefined

            // If totalHits is 0, return an empty array
            if (totalHits === 0) {
                return [];
            }

            //console.log('Data retrieved:', response);
            return response.hits.hits.map(hit => ({
                id: hit._id,
                ...(hit._source as object)
            }));
        } catch (error) {
            // 发生错误时打印请求体
            console.error('Error retrieving data. Request body:', body);
            console.error('Error:', error); // 打印错误信息
            return null;
        }
    }



    // 修改数据
    public async updateById(index: string, id: string, newData: object, refresh: boolean = false, updateTimestamp: boolean = true) {
        if (!this.client) {
            console.warn('Elasticsearch client is not initialized.');
            return null;
        }

        // 可控地添加 @timestamp 字段
        const updatedData = updateTimestamp
            ? { ...newData, '@timestamp': new Date().toISOString() }
            : { ...newData };

        try {
            const response: any = await this.client.update({
                index: index,
                id: id,
                refresh: refresh, // 新增refresh参数控制立即刷新
                body: {
                    doc: updatedData,
                } as any,
            });
            //console.log('Data updated:', response);
            return response;
        } catch (error) {
            console.error('Error updating data:', error);
            return null;
        }
    }

    public async updateByQuerySize(index: string | string[], body: object, size: number = 10) {
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
            const response = await this.client.updateByQuery({
                index: index,
                body: {
                    ...body,  // 这里传入你的查询体

                },
                max_docs: size  // 使用 max_docs 来限制更新的文档数
            });
            //console.log('Data updated by query:', response);
            return response;
        } catch (error) {
            console.error('Error updating data by query:', error);
            return null;
        }
    }


    // 根据查询条件更新数据
    public async updateByQuery(index: string | string[], body: object) {
        if (!this.client) {
            console.warn('Elasticsearch client is not initialized.');
            return null;
        }

        try {
            const response = await this.client.updateByQuery({
                index: index,
                body: body
            });
            //console.log('Data updated by query:', response);
            return response;
        } catch (error) {
            console.error('Error updating data by query:', error);
            return null;
        }
    }

    // 根据查询条件删除数据
    public async deleteByQuery(index: string | string[], body: object) {
        if (!this.client) {
            console.warn('Elasticsearch client is not initialized.');
            return null;
        }

        try {
            const response = await this.client.deleteByQuery({
                index: index,
                body: body
            });
            //console.log('Data deleted by query:', response);
            return response;
        } catch (error) {
            console.error('Error deleting data by query:', error);
            return null;
        }
    }

    // 删除数据
    public async delete(index: string, id: string) {
        if (!this.client) {
            console.warn('Elasticsearch client is not initialized.');
            return null;
        }

        try {
            const response = await this.client.delete({
                index: index,
                id: id,
            });
            //console.log('Data deleted:', response);
            return response;
        } catch (error) {
            console.error('Error deleting data:', error);
            return null;
        }
    }
}

// POST /stock_data_day-main/_delete_by_query
// {
//   "query": {
//     "match_all": {}
//   }
// }

export { Elasticsearch78 };