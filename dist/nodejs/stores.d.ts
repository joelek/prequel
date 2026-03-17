import * as autoguard from "@joelek/autoguard";
import * as collators from "../shared/collators";
import * as schema from "../shared/schema";
export type ObjectKey = PropertyKey;
export type ObjectValue = collators.Collatable;
export type ObjectProperties<A> = {
    [B in keyof A]: ObjectValue;
};
export type Object<A extends ObjectProperties<A>, B extends string> = A & {
    [C in B]: string;
};
export type ObjectWithOptionalId<A extends ObjectProperties<A>, B extends string> = A & {
    [C in B]?: string;
};
export declare class ExpectedObjectError extends Error {
    readonly key: ObjectKey;
    readonly value: ObjectValue;
    constructor(key: ObjectKey, value: ObjectValue);
    toString(): string;
}
export declare class ExpectedUniquePropertyError extends Error {
    readonly key: ObjectKey;
    readonly value: ObjectValue;
    constructor(key: ObjectKey, value: ObjectValue);
    toString(): string;
}
export declare class ExpectedImmutablePropertyError extends Error {
    readonly key: ObjectKey;
    readonly one: ObjectValue;
    readonly two: ObjectValue;
    constructor(key: ObjectKey, one: ObjectValue, two: ObjectValue);
    toString(): string;
}
export declare class ExpectedSafeIdentifierError extends Error {
    readonly identifer: string;
    constructor(identifer: string);
    toString(): string;
}
export type Mapper<A, B> = (value: A) => B;
export declare function bisectSortedArray<A, B>(objects: Array<A>, object: A, mapper: Mapper<A, B>, collator: collators.Collator<B>): number;
export type ObjectGroup<A extends ObjectProperties<A>, B extends string, C extends keyof A> = {
    value: A[C];
    objects: Array<Object<A, B>>;
};
export declare class ObjectIndex<A extends ObjectProperties<A>, B extends string, C extends keyof A> {
    protected groups: Array<ObjectGroup<A, B, C>>;
    protected id: B;
    protected key: C;
    protected collator: collators.Collator<ObjectValue>;
    protected collectObjects(min_group_index: number, max_group_index: number): Array<Object<A, B>>;
    protected findGroupIndex(value: Object<A, B>[C]): number;
    protected findObjectIndex(objects: Array<Object<A, B>>, object: Object<A, B>): number;
    constructor(objects: Iterable<Object<A, B>>, id: B, key: C, collator: collators.Collator<ObjectValue>);
    insert(object: Object<A, B>): void;
    lookup(operator: schema.Operator, value: Object<A, B>[C]): Array<Object<A, B>>;
    remove(object: Object<A, B>): void;
}
export type LookupWhere<A extends ObjectProperties<A>, B extends string> = {
    [C in Extract<keyof Object<A, B>, string>]: Object<A, B>[C] extends string | null | undefined ? {
        key: C;
        operator: schema.StringOperator;
        operand: Object<A, B>[C];
    } : Object<A, B>[C] extends number | null | undefined ? {
        key: C;
        operator: schema.IntegerOperator;
        operand: Object<A, B>[C];
    } : Object<A, B>[C] extends boolean | null | undefined ? {
        key: C;
        operator: schema.BooleanOperator;
        operand: Object<A, B>[C];
    } : Object<A, B>[C] extends Date | null | undefined ? {
        key: C;
        operator: schema.DateOperator;
        operand: Object<A, B>[C];
    } : never;
}[Extract<keyof Object<A, B>, string>] | {
    all: LookupWhere<A, B>[];
} | {
    any: LookupWhere<A, B>[];
} | {
    not: LookupWhere<A, B>;
};
export type LookupOrder<A extends ObjectProperties<A>, B extends string> = {
    keys: Extract<keyof Object<A, B>, string>[];
    sort: schema.Sort;
};
export type LookupOptions<A extends ObjectProperties<A>, B extends string> = {
    where?: LookupWhere<A, B>;
    order?: LookupOrder<A, B>;
    anchor?: string;
    offset?: number;
    length?: number;
};
export type Options = {
    where: schema.Where;
    order: schema.Order;
    offset?: number;
    length?: number;
};
export declare abstract class ObjectStore<A extends ObjectProperties<A>, B extends string> {
    protected preprocessObject(object: Object<A, B>, trim_strings: boolean): Object<A, B>;
    protected getOptions(id: B, lookup_options?: LookupOptions<A, B>): Promise<Options>;
    abstract createObject(properties: ObjectWithOptionalId<A, B>): Promise<Object<A, B>>;
    abstract lookupObject(id: string): Promise<Object<A, B>>;
    abstract lookupObjects(lookup_options?: LookupOptions<A, B>): Promise<Array<Object<A, B>>>;
    abstract updateObject(object: Object<A, B>): Promise<Object<A, B>>;
    abstract deleteObject(id: string): Promise<Object<A, B>>;
}
export type VolatileObjectStoreOptions<A extends ObjectProperties<A>, B extends string> = {
    immutable_keys?: Array<keyof A>;
    null_order?: NullOrder;
    trim_strings?: boolean;
};
export declare class VolatileObjectStore<A extends ObjectProperties<A>, B extends string> extends ObjectStore<A, B> {
    protected id: B;
    protected unique_keys: Array<keyof A>;
    protected guard: autoguard.serialization.MessageGuard<Object<A, B>>;
    protected immutable_keys: Array<keyof A>;
    protected objects: Map<ObjectValue, Object<A, B>>;
    protected indices: Map<keyof A, ObjectIndex<A, B, keyof A>>;
    protected collator: collators.Collator<ObjectValue>;
    protected trim_strings: boolean;
    protected insertIntoIndices(object: Object<A, B>): void;
    protected updateObjectIndices(existing_object: Object<A, B>, object: Object<A, B>): void;
    protected removeFromIndices(object: Object<A, B>): void;
    protected cloneObject(object: Object<A, B>): Object<A, B>;
    protected createId(): string;
    protected getIndex<C extends keyof A>(key: C): ObjectIndex<A, B, C>;
    protected matchesWhere(object: Object<A, B>, where: schema.Where): boolean;
    constructor(id: B, unique_keys: Array<keyof A>, guard: autoguard.serialization.MessageGuard<Object<A, B>>, options?: VolatileObjectStoreOptions<A, B>);
    createObject(properties: ObjectWithOptionalId<A, B>): Promise<Object<A, B>>;
    lookupObject(id: string): Promise<Object<A, B>>;
    lookupObjects(lookup_options?: LookupOptions<A, B>): Promise<Array<Object<A, B>>>;
    updateObject(object: Object<A, B>): Promise<Object<A, B>>;
    deleteObject(id: string): Promise<Object<A, B>>;
}
export type ConnectionLike = {
    query<A>(sql: string, parameters?: Array<ObjectValue>): Promise<A>;
};
export type DatabaseObjectStoreDetail = {
    getConnection(): Promise<ConnectionLike>;
    generateId?(): string;
};
export type DatabaseObjectStoreOptions<A extends ObjectProperties<A>, B extends string> = {
    use_ansi_quotes?: boolean;
    debug_mode?: boolean;
    immutable_keys?: Array<keyof A>;
    null_order?: NullOrder;
    trim_strings?: boolean;
};
export type NullOrder = "NULLS_FIRST" | "NULLS_LAST";
export declare class DatabaseObjectStore<A extends ObjectProperties<A>, B extends string> extends ObjectStore<A, B> {
    protected detail: DatabaseObjectStoreDetail;
    protected table: string;
    protected id: B;
    protected guard: autoguard.serialization.MessageGuard<Object<A, B>>;
    protected use_ansi_quotes: boolean;
    protected debug_mode: boolean;
    protected immutable_keys: Array<keyof A>;
    protected null_order: NullOrder | undefined;
    protected trim_strings: boolean;
    protected createId(): Promise<string>;
    protected detectNullOrder(): Promise<NullOrder>;
    protected escapeIdentifier(identifier: string): string;
    protected executeQuery<A>(sql: string, parameters: Array<ObjectValue>): Promise<A>;
    protected serializeWherePrimitive(where: schema.WhereBoolean | schema.WhereDate | schema.WhereInteger | schema.WhereString, null_order: NullOrder): {
        sql: string;
        parameters: Array<ObjectValue>;
    };
    protected serializeWhere(where: schema.Where, null_order: NullOrder): {
        sql: string;
        parameters: Array<ObjectValue>;
    };
    protected serializeOrder(order: schema.Order): {
        sql: Array<string>;
        parameters: Array<ObjectValue>;
    };
    protected serializeLength(length: number | undefined): {
        sql: Array<string>;
        parameters: Array<ObjectValue>;
    };
    protected serializeOffset(offset: number | undefined): {
        sql: Array<string>;
        parameters: Array<ObjectValue>;
    };
    constructor(detail: DatabaseObjectStoreDetail, table: string, id: B, guard: autoguard.serialization.MessageGuard<Object<A, B>>, options?: DatabaseObjectStoreOptions<A, B>);
    createObject(properties: ObjectWithOptionalId<A, B>): Promise<Object<A, B>>;
    lookupObject(id: string): Promise<Object<A, B>>;
    lookupObjects(lookup_options?: LookupOptions<A, B>): Promise<Object<A, B>[]>;
    updateObject(object: Object<A, B>): Promise<Object<A, B>>;
    deleteObject(id: string): Promise<Object<A, B>>;
}
