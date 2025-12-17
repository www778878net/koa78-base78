import { BaseSchema } from "../controllers/BaseSchema";

export class QueryBuilder<T extends BaseSchema> {
    private query: string[] = [];
    private whereConditions: string[] = [];
    private values: any[] = [];
    private cols: string[];

    constructor(cols: string[]) {
        this.cols = cols;
    }

    select<K extends keyof T & string>(...fields: K[]): this {
        this.query.push(`SELECT ${fields.join(', ')}`);
        return this;
    }

    addRawSelect(...rawFields: string[]): this {
        if (this.query.some(q => q.startsWith('SELECT'))) {
            this.query[this.query.findIndex(q => q.startsWith('SELECT'))] += `, ${rawFields.join(', ')}`;
        } else {
            this.query.push(`SELECT ${rawFields.join(', ')}`);
        }
        return this;
    }

    from(table: string): this {
        this.query.push(`FROM ${table}`);
        return this;
    }

    where(field: keyof T, operator: string, value: any): this {
        this.whereConditions.push(`${String(field)} ${operator} ?`);
        this.values.push(value);
        return this;
    }

    groupBy(...fields: (keyof T)[]): this {
        this.query.push(`GROUP BY ${fields.join(', ')}`);
        return this;
    }

    getSQL(): string {
        let sql = this.query.join(' ');
        if (this.whereConditions.length > 0) {
            sql += ` WHERE ${this.whereConditions.join(' AND ')}`;
        }
        return sql;
    }

    getValues(): any[] {
        return this.values;
    }
}