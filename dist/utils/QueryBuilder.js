"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryBuilder = void 0;
class QueryBuilder {
    constructor(cols) {
        this.query = [];
        this.whereConditions = [];
        this.values = [];
        this.cols = cols;
    }
    select(...fields) {
        this.query.push(`SELECT ${fields.join(', ')}`);
        return this;
    }
    addRawSelect(...rawFields) {
        if (this.query.some(q => q.startsWith('SELECT'))) {
            this.query[this.query.findIndex(q => q.startsWith('SELECT'))] += `, ${rawFields.join(', ')}`;
        }
        else {
            this.query.push(`SELECT ${rawFields.join(', ')}`);
        }
        return this;
    }
    from(table) {
        this.query.push(`FROM ${table}`);
        return this;
    }
    where(field, operator, value) {
        this.whereConditions.push(`${String(field)} ${operator} ?`);
        this.values.push(value);
        return this;
    }
    groupBy(...fields) {
        this.query.push(`GROUP BY ${fields.join(', ')}`);
        return this;
    }
    getSQL() {
        let sql = this.query.join(' ');
        if (this.whereConditions.length > 0) {
            sql += ` WHERE ${this.whereConditions.join(' AND ')}`;
        }
        return sql;
    }
    getValues() {
        return this.values;
    }
}
exports.QueryBuilder = QueryBuilder;
//# sourceMappingURL=QueryBuilder.js.map