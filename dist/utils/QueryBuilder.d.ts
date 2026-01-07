import { BaseSchema } from "../controllers/BaseSchema";
export declare class QueryBuilder<T extends BaseSchema> {
    private query;
    private whereConditions;
    private values;
    private cols;
    constructor(cols: string[]);
    select<K extends keyof T & string>(...fields: K[]): this;
    addRawSelect(...rawFields: string[]): this;
    from(table: string): this;
    where(field: keyof T, operator: string, value: any): this;
    groupBy(...fields: (keyof T)[]): this;
    getSQL(): string;
    getValues(): any[];
}
