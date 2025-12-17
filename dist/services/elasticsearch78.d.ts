import { SearchResponse } from '@elastic/elasticsearch/lib/api/types';
/**
 * @experimental 此类为实验性实现，API可能会在未来版本中发生变化
 * 建议在生产环境中谨慎使用，并关注后续版本的变更通知
 */
export default class Elasticsearch78 {
    private static instance;
    private client;
    constructor();
    static getInstance(): Elasticsearch78;
    /**
     * @deprecated Use search250623 instead
     */
    search<T = any>(params: {
        index: string | string[];
        body: object;
        size?: number;
    }): Promise<SearchResponse<T> | null>;
    search250623<T = any>(params: {
        index: string | string[];
        body: {
            size?: number;
        } & object;
    }): Promise<SearchResponse<T>>;
    /**
     * 修改或新增，支持指定字段替换
     * @param index
     * @param id
     * @param data
     * @param updateFields
     * @param replaceFields
     * @returns
     */
    upsertDataWithReplace(index: string, id: string, data: object, updateFields: {
        [key: string]: any;
    }, replaceFields: {
        [key: string]: any;
    }): Promise<any>;
    /**
     * 弃用 换upsertDataWithReplace 修改或新增
     * @param index
     * @param id
     * @param data
     * @param updateData
     * @returns
     */
    upsertData(index: string, id: string, data: object, updateFields: {
        [key: string]: any;
    }): Promise<import("@elastic/elasticsearch/lib/api/types").UpdateResponse<unknown> | null>;
    add(index: string, data: object, id?: string, refresh?: boolean): Promise<import("@elastic/elasticsearch/lib/api/types").WriteResponseBase | null>;
    addIfNotExists(index: string, data: object, id: string, refresh?: boolean): Promise<import("@elastic/elasticsearch/lib/api/types").WriteResponseBase | {
        result: string;
    } | null>;
    get(index: string, body: object, size?: number, isdebug?: boolean): Promise<{
        id: string | undefined;
    }[] | null>;
    updateById(index: string, id: string, newData: object, refresh?: boolean, updateTimestamp?: boolean): Promise<any>;
    updateByQuerySize(index: string | string[], body: object, size?: number): Promise<import("@elastic/elasticsearch/lib/api/types").UpdateByQueryResponse | null>;
    updateByQuery(index: string | string[], body: object): Promise<import("@elastic/elasticsearch/lib/api/types").UpdateByQueryResponse | null>;
    deleteByQuery(index: string | string[], body: object): Promise<import("@elastic/elasticsearch/lib/api/types").DeleteByQueryResponse | null>;
    delete(index: string, id: string): Promise<import("@elastic/elasticsearch/lib/api/types").WriteResponseBase | null>;
}
export { Elasticsearch78 };
