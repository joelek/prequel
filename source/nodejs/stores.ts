import * as autoguard from "@joelek/autoguard";
import * as collators from "../shared/collators";
import * as errors from "../shared/errors";
import * as schema from "../shared/schema";
import * as ids from "./ids";

export type ObjectKey = PropertyKey;

export type ObjectValue = collators.Collatable;

export type ObjectProperties<A> = {
	[B in keyof A]: ObjectValue;
};

export type Object<A extends ObjectProperties<A>, B extends string> = A & {
	[C in B]: string;
};

export class ExpectedObjectError extends Error {
	readonly key: ObjectKey;
	readonly value: ObjectValue;

	constructor(key: ObjectKey, value: ObjectValue) {
		super();
		this.key = key;
		this.value = value;
	}

	toString(): string {
		return `Expected an object with "${String(this.key)}" equal to "${String(this.value)}"!`;
	}
};

export class ExpectedUniquePropertyError extends Error {
	readonly key: ObjectKey;
	readonly value: ObjectValue;

	constructor(key: ObjectKey, value: ObjectValue) {
		super();
		this.key = key;
		this.value = value;
	}

	toString(): string {
		return `Expected object with "${String(this.key)}" equal to "${String(this.value)}" to be unique!`;
	}
};

export class ExpectedImmutablePropertyError extends Error {
	readonly key: ObjectKey;
	readonly one: ObjectValue;
	readonly two: ObjectValue;

	constructor(key: ObjectKey, one: ObjectValue, two: ObjectValue) {
		super();
		this.key = key;
		this.one = one;
		this.two = two;
	}

	toString(): string {
		return `Expected object with "${String(this.key)}" equal to "${String(this.two)}" to be immutable and not change to "${String(this.one)}"!`;
	}
};

export class ExpectedSafeIdentifierError extends Error {
	readonly identifer: string;

	constructor(identifer: string) {
		super();
		this.identifer = identifer;
	}

	toString(): string {
		return `Expected "${this.identifer}" to be a safe identifier!`;
	};
};

export type Mapper<A, B> = (value: A) => B;

export function bisectSortedArray<A, B>(objects: Array<A>, object: A, mapper: Mapper<A, B>, collator: collators.Collator<B>): number {
	function recurse(offset: number, length: number): number {
		if (length <= 0) {
			return offset;
		}
		let pivot = offset + (length >> 1);
		let outcome = collator(mapper(object), mapper(objects[pivot]));
		if (outcome === "IDENTICAL") {
			return pivot;
		}
		if (outcome === "ONE_COMES_FIRST") {
			return recurse(offset, pivot - offset);
		} else {
			return recurse(pivot + 1, length - (pivot + 1) - offset);
		}
	};
	return recurse(0, objects.length);
};

export type ObjectGroup<A extends ObjectProperties<A>, B extends string, C extends keyof A> = {
	value: A[C];
	objects: Array<Object<A, B>>;
};

export class ObjectIndex<A extends ObjectProperties<A>, B extends string, C extends keyof A> {
	protected groups: Array<ObjectGroup<A, B, C>>;
	protected id: B;
	protected key: C;
	protected collator: collators.Collator<ObjectValue>;

	protected collectObjects(min_group_index: number, max_group_index: number): Array<Object<A, B>> {
		let objects: Array<Object<A, B>> = [];
		min_group_index = Math.max(0, Math.min(min_group_index, this.groups.length));
		max_group_index = Math.max(0, Math.min(max_group_index, this.groups.length));
		for (let group_index = min_group_index; group_index < max_group_index; group_index += 1) {
			objects.push(...this.groups[group_index].objects);
		}
		return objects;
	}

	protected findGroupIndex(value: Object<A, B>[C]): number {
		return bisectSortedArray(this.groups, { value, objects: [] }, (group) => group.value, this.collator);
	}

	protected findObjectIndex(objects: Array<Object<A, B>>, object: Object<A, B>): number {
		return bisectSortedArray(objects, object, (object) => object[this.key], this.collator);
	}

	constructor(objects: Iterable<Object<A, B>>, id: B, key: C, collator: collators.Collator<ObjectValue>) {
		this.groups = [];
		this.id = id;
		this.key = key;
		this.collator = collator;
		for (let object of objects) {
			this.insert(object);
		}
	}

	insert(object: Object<A, B>): void {
		let value = object[this.key];
		let group_index = this.findGroupIndex(value);
		if (group_index >= 0 && group_index < this.groups.length) {
			let group = this.groups[group_index];
			if (this.collator(value, group.value) === "IDENTICAL") {
				let object_index = this.findObjectIndex(group.objects, object);
				if (object_index >= 0 && object_index < group.objects.length) {
					let existing_object = group.objects[object_index];
					if (existing_object[this.id] === object[this.id]) {
						return;
					}
				}
				group.objects.splice(object_index, 0, object);
				return;
			}
		}
		this.groups.splice(group_index, 0, {
			value: value,
			objects: [
				object
			]
		});
	}

	lookup(operator: schema.Operator, value: Object<A, B>[C]): Array<Object<A, B>> {
		let group_index = this.findGroupIndex(value);
		let collator_result = this.collator(this.groups[group_index]?.value, value);
		if (operator === "<") {
			if (collator_result === "ONE_COMES_FIRST") {
				return this.collectObjects(0, group_index + 1);
			}
			if (collator_result === "IDENTICAL") {
				return this.collectObjects(0, group_index);
			}
			if (collator_result === "TWO_COMES_FIRST") {
				return this.collectObjects(0, group_index);
			}
		}
		if (operator === "<=") {
			if (collator_result === "ONE_COMES_FIRST") {
				return this.collectObjects(0, group_index + 1);
			}
			if (collator_result === "IDENTICAL") {
				return this.collectObjects(0, group_index + 1);
			}
			if (collator_result === "TWO_COMES_FIRST") {
				return this.collectObjects(0, group_index);
			}
		}
		if (operator === "==") {
			if (collator_result === "ONE_COMES_FIRST") {
				return [];
			}
			if (collator_result === "IDENTICAL") {
				return this.collectObjects(group_index, group_index + 1);
			}
			if (collator_result === "TWO_COMES_FIRST") {
				return [];
			}
		}
		if (operator === "!=") {
			if (collator_result === "ONE_COMES_FIRST") {
				return [
					...this.collectObjects(0, group_index + 1),
					...this.collectObjects(group_index + 1, this.groups.length)
				];
			}
			if (collator_result === "IDENTICAL") {
				return [
					...this.collectObjects(0, group_index),
					...this.collectObjects(group_index + 1, this.groups.length)
				];
			}
			if (collator_result === "TWO_COMES_FIRST") {
				return [
					...this.collectObjects(0, group_index),
					...this.collectObjects(group_index, this.groups.length)
				];
			}
		}
		if (operator === ">") {
			if (collator_result === "ONE_COMES_FIRST") {
				return this.collectObjects(group_index + 1, this.groups.length);
			}
			if (collator_result === "IDENTICAL") {
				return this.collectObjects(group_index + 1, this.groups.length);
			}
			if (collator_result === "TWO_COMES_FIRST") {
				return this.collectObjects(group_index, this.groups.length);
			}
		}
		if (operator === ">=") {
			if (collator_result === "ONE_COMES_FIRST") {
				return this.collectObjects(group_index + 1, this.groups.length);
			}
			if (collator_result === "IDENTICAL") {
				return this.collectObjects(group_index, this.groups.length);
			}
			if (collator_result === "TWO_COMES_FIRST") {
				return this.collectObjects(group_index, this.groups.length);
			}
		}
		throw new errors.ExpectedUnreachableCodeError();
	}

	remove(object: Object<A, B>): void {
		let value = object[this.key];
		let group_index = this.findGroupIndex(value);
		if (group_index >= 0 && group_index < this.groups.length) {
			let group = this.groups[group_index];
			if (this.collator(value, group.value) === "IDENTICAL") {
				let object_index = this.findObjectIndex(group.objects, object);
				if (object_index >= 0 && object_index < group.objects.length) {
					let existing_object = group.objects[object_index];
					if (existing_object[this.id] === object[this.id]) {
						group.objects.splice(object_index, 1);
						if (group.objects.length === 0) {
							this.groups.splice(group_index, 1);
						}
						return;
					}
				}
			}
		}
	}
};

export type LookupWhere<A extends ObjectProperties<A>, B extends string> = {
	[C in Extract<keyof Object<A, B>, string>]:
		Object<A, B>[C] extends string | null | undefined ? {
			key: C;
			operator: schema.StringOperator;
			operand: Object<A, B>[C];
		} :
		Object<A, B>[C] extends number | null | undefined ? {
			key: C;
			operator: schema.IntegerOperator;
			operand: Object<A, B>[C];
		} :
		Object<A, B>[C] extends boolean | null | undefined ? {
			key: C;
			operator: schema.BooleanOperator;
			operand: Object<A, B>[C];
		} :
		Object<A, B>[C] extends Date | null | undefined ? {
			key: C;
			operator: schema.DateOperator;
			operand: Object<A, B>[C];
		} :
		never;
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

export abstract class ObjectStore<A extends ObjectProperties<A>, B extends string> {
	protected async getOptions(id: B, lookup_options?: LookupOptions<A, B>): Promise<Options> {
		lookup_options = lookup_options ?? {};
		let where: schema.Where = lookup_options.where ?? { all: [] };
		let order: schema.Order = lookup_options.order ?? { keys: [id], sort: "ASC" };
		let offset = lookup_options.offset;
		let length = lookup_options.length;
		if (lookup_options.anchor != null) {
			let anchor = await this.lookupObject(lookup_options.anchor);
			if (order.keys[order.keys.length - 1] !== id) {
				order = { keys: [...order.keys, id], sort: order.sort };
			}
			let any: schema.WhereAny = {
				any: []
			};
			for (let where_index = 0; where_index < order.keys.length; where_index += 1) {
				let all: schema.WhereAll = {
					all: []
				};
				for (let key_index = 0; key_index < order.keys.length - where_index; key_index += 1) {
					let key = order.keys[key_index];
					all.all.push({
						key: key,
						operator: key_index + 1 < order.keys.length - where_index ? "==" : order.sort === "ASC" ? ">" : "<",
						operand: anchor[key as keyof Object<A, B>]
					});
				}
				any.any.push(all);
			}
			where = {
				all: [
					where,
					any
				]
			};
		}
		return {
			where,
			order,
			offset,
			length
		};
	}

	abstract createObject(properties: A | Object<A, B>): Promise<Object<A, B>>;
	abstract lookupObject(id: string): Promise<Object<A, B>>;
	abstract lookupObjects(lookup_options?: LookupOptions<A, B>): Promise<Array<Object<A, B>>>;
	abstract updateObject(object: Object<A, B>): Promise<Object<A, B>>;
	abstract deleteObject(id: string): Promise<Object<A, B>>;
};

export type VolatileObjectStoreOptions<A extends ObjectProperties<A>, B extends string> = {
	immutable_keys?: Array<keyof A>;
	null_order?: NullOrder;
};

export class VolatileObjectStore<A extends ObjectProperties<A>, B extends string> extends ObjectStore<A, B> {
	protected id: B;
	protected unique_keys: Array<keyof A>;
	protected guard: autoguard.serialization.MessageGuard<Object<A, B>>;
	protected immutable_keys: Array<keyof A>;
	protected objects: Map<ObjectValue, Object<A, B>>;
	protected indices: Map<keyof A, ObjectIndex<A, B, keyof A>>;
	protected collator: collators.Collator<ObjectValue>;

	protected insertIntoIndices(object: Object<A, B>): void {
		for (let [key, index] of this.indices) {
			index.insert(object);
		}
	}

	protected updateObjectIndices(existing_object: Object<A, B>, object: Object<A, B>): void {
		this.removeFromIndices(existing_object);
		this.insertIntoIndices(object);
	}

	protected removeFromIndices(object: Object<A, B>): void {
		for (let [key, index] of this.indices) {
			index.remove(object);
		}
	}

	protected cloneObject(object: Object<A, B>): Object<A, B> {
		return {
			...object
		};
	}

	protected createId(): string {
		let id = ids.generateHexId(32);
		while (this.objects.has(id)) {
			id = ids.generateHexId(32);
		}
		return id;
	}

	protected getIndex<C extends keyof A>(key: C): ObjectIndex<A, B, C> {
		let index = this.indices.get(key) as ObjectIndex<A, B, C>;
		if (index == null) {
			index = new ObjectIndex(this.objects.values(), this.id, key, this.collator);
			this.indices.set(key, index);
		}
		return index;
	}

	protected matchesWhere(object: Object<A, B>, where: schema.Where): boolean {
		if (schema.WhereString.is(where)) {
			let one = object[where.key as keyof Object<A, B>];
			let two = where.operand;
			let collator_result = this.collator(one, two);
			if (where.operator === "<") {
				return collator_result === "ONE_COMES_FIRST";
			} else if (where.operator === "<=") {
				return collator_result === "ONE_COMES_FIRST" || collator_result === "IDENTICAL";
			} else if (where.operator === "==") {
				return collator_result === "IDENTICAL";
			} else if (where.operator === "!=") {
				return collator_result === "ONE_COMES_FIRST" || collator_result === "TWO_COMES_FIRST";
			} else if (where.operator === ">") {
				return collator_result === "TWO_COMES_FIRST";
			} else if (where.operator === ">=") {
				return collator_result === "TWO_COMES_FIRST" || collator_result === "IDENTICAL";
			} else if (where.operator === "^=") {
				return one != null && two != null && one.startsWith(two);
			} else if (where.operator === "*=") {
				return one != null && two != null && one.includes(two);
			} else if (where.operator === "$=") {
				return one != null && two != null && one.endsWith(two);
			} else {
				let dummy: never = where.operator;
			}
		} else if (schema.WhereInteger.is(where)) {
			let one = object[where.key as keyof Object<A, B>];
			let two = where.operand;
			let collator_result = this.collator(one, two);
			if (where.operator === "<") {
				return collator_result === "ONE_COMES_FIRST";
			} else if (where.operator === "<=") {
				return collator_result === "ONE_COMES_FIRST" || collator_result === "IDENTICAL";
			} else if (where.operator === "==") {
				return collator_result === "IDENTICAL";
			} else if (where.operator === "!=") {
				return collator_result === "ONE_COMES_FIRST" || collator_result === "TWO_COMES_FIRST";
			} else if (where.operator === ">") {
				return collator_result === "TWO_COMES_FIRST";
			} else if (where.operator === ">=") {
				return collator_result === "TWO_COMES_FIRST" || collator_result === "IDENTICAL";
			} else {
				let dummy: never = where.operator;
			}
		} else if (schema.WhereBoolean.is(where)) {
			let one = object[where.key as keyof Object<A, B>];
			let two = where.operand;
			let collator_result = this.collator(one, two);
			if (where.operator === "<") {
				return collator_result === "ONE_COMES_FIRST";
			} else if (where.operator === "<=") {
				return collator_result === "ONE_COMES_FIRST" || collator_result === "IDENTICAL";
			} else if (where.operator === "==") {
				return collator_result === "IDENTICAL";
			} else if (where.operator === "!=") {
				return collator_result === "ONE_COMES_FIRST" || collator_result === "TWO_COMES_FIRST";
			} else if (where.operator === ">") {
				return collator_result === "TWO_COMES_FIRST";
			} else if (where.operator === ">=") {
				return collator_result === "TWO_COMES_FIRST" || collator_result === "IDENTICAL";
			} else {
				let dummy: never = where.operator;
			}
		} else if (schema.WhereDate.is(where)) {
			let one = object[where.key as keyof Object<A, B>];
			let two = where.operand;
			let collator_result = this.collator(one, two);
			if (where.operator === "<") {
				return collator_result === "ONE_COMES_FIRST";
			} else if (where.operator === "<=") {
				return collator_result === "ONE_COMES_FIRST" || collator_result === "IDENTICAL";
			} else if (where.operator === "==") {
				return collator_result === "IDENTICAL";
			} else if (where.operator === "!=") {
				return collator_result === "ONE_COMES_FIRST" || collator_result === "TWO_COMES_FIRST";
			} else if (where.operator === ">") {
				return collator_result === "TWO_COMES_FIRST";
			} else if (where.operator === ">=") {
				return collator_result === "TWO_COMES_FIRST" || collator_result === "IDENTICAL";
			} else {
				let dummy: never = where.operator;
			}
		} else if (schema.WhereAll.is(where)) {
			for (let subwhere of where.all) {
				if (!this.matchesWhere(object, subwhere)) {
					return false;
				}
			}
			return true;
		} else if (schema.WhereAny.is(where)) {
			for (let subwhere of where.any) {
				if (this.matchesWhere(object, subwhere)) {
					return true;
				}
			}
			return false;
		} else if (schema.WhereNot.is(where)) {
			return !this.matchesWhere(object, where.not);
		} else {
			let dummy: never = where;
		}
		throw new Error(`Expected code to be unreachable!`);
	}

	constructor(id: B, unique_keys: Array<keyof A>, guard: autoguard.serialization.MessageGuard<Object<A, B>>, options?: VolatileObjectStoreOptions<A, B>) {
		super();
		this.id = id;
		this.unique_keys = [ ...unique_keys ];
		this.guard = guard;
		this.immutable_keys = options?.immutable_keys ?? [];
		this.collator = options?.null_order === "NULLS_LAST" ? collators.NULLS_LAST_OBJECT_VALUE_COLLATOR : collators.NULLS_FIRST_OBJECT_VALUE_COLLATOR
		this.objects = new Map();
		this.indices = new Map();
	}

	async createObject(properties: A | Object<A, B>): Promise<Object<A, B>> {
		let id = this.guard.is(properties) ? properties[this.id] : this.createId();
		let object = this.guard.to({
			...properties,
			[this.id]: id
		});
		for (let unique_key of this.unique_keys) {
			let value = object[unique_key];
			if (value != null) {
				let objects = await this.lookupObjects({
					where: {
						key: unique_key,
						operator: "==",
						operand: value
					} as LookupWhere<A, B> | undefined
				});
				if (objects.length !== 0) {
					throw new ExpectedUniquePropertyError(unique_key, value);
				}
			}
		}
		this.objects.set(id, object);
		this.insertIntoIndices(object);
		return this.cloneObject(object);
	}

	async lookupObject(id: string): Promise<Object<A, B>> {
		let object = this.objects.get(id);
		if (object == null) {
			throw new ExpectedObjectError(this.id, id);
		}
		return this.cloneObject(object);
	}

	async lookupObjects(lookup_options?: LookupOptions<A, B>): Promise<Array<Object<A, B>>> {
		let options = await this.getOptions(this.id, lookup_options);
		let objects = Array.from(this.objects.values());
		objects = objects.filter((object) => {
			return this.matchesWhere(object, options.where);
		});
		objects = objects.sort((one, two) => {
			for (let key of options.order.keys) {
				let collator_result = this.collator(one[key as keyof Object<A, B>], two[key as keyof Object<A, B>]);
				if (collator_result === "ONE_COMES_FIRST") {
					return options.order.sort === "ASC" ? -1 : 1;
				}
				if (collator_result === "TWO_COMES_FIRST") {
					return options.order.sort === "ASC" ? 1 : -1;
				}
			}
			return 0;
		});
		if (options.offset != null) {
			objects = objects.slice(options.offset);
		}
		if (options.length != null) {
			objects = objects.slice(0, options.length);
		}
		return objects.map((object) => this.cloneObject(object));
	}

	async updateObject(object: Object<A, B>): Promise<Object<A, B>> {
		object = this.guard.to(object);
		let id = object[this.id];
		let existing_object = this.objects.get(id);
		if (existing_object == null) {
			throw new ExpectedObjectError(this.id, id);
		}
		for (let unique_key of this.unique_keys) {
			let value = object[unique_key];
			if (value != null) {
				let objects = await this.lookupObjects({
					where: {
						key: unique_key,
						operator: "==",
						operand: value
					} as LookupWhere<A, B> | undefined
				});
				if (objects.length !== 0 && objects[0][this.id] !== id) {
					throw new ExpectedUniquePropertyError(unique_key, value);
				}
			}
		}
		for (let key of Object.keys(object) as Array<keyof A>) {
			if (this.immutable_keys.includes(key)) {
				let one = object[key];
				let two = existing_object[key];
				if (one !== two) {
					throw new ExpectedImmutablePropertyError(key, one, two);
				}
			}
		}
		this.objects.set(id, object);
		this.updateObjectIndices(existing_object, object);
		return this.cloneObject(object);
	}

	async deleteObject(id: string): Promise<Object<A, B>> {
		let object = this.objects.get(id);
		if (object == null) {
			throw new ExpectedObjectError(this.id, id);
		}
		this.objects.delete(id);
		this.removeFromIndices(object);
		return this.cloneObject(object);
	}
};

export type ConnectionLike = {
	query<A>(sql: string, parameters?: Array<ObjectValue>): Promise<A>;
};

export type DatabaseObjectStoreDetail = {
	getConnection(): Promise<ConnectionLike>;
	generateId?(): string;
};

export type DatabaseObjectStoreOptions<A extends ObjectProperties<A>, B extends string> = {
	use_ansi_quotes?: boolean;
	immutable_keys?: Array<keyof A>;
	null_order?: NullOrder;
};

export type NullOrder = "NULLS_FIRST" | "NULLS_LAST";

export class DatabaseObjectStore<A extends ObjectProperties<A>, B extends string> extends ObjectStore<A, B> {
	protected detail: DatabaseObjectStoreDetail;
	protected table: string;
	protected id: B;
	protected guard: autoguard.serialization.MessageGuard<Object<A, B>>;
	protected use_ansi_quotes: boolean;
	protected immutable_keys: Array<keyof A>;
	protected null_order: NullOrder | undefined;

	protected async createId(): Promise<string> {
		let id = this.detail.generateId?.() ?? ids.generateHexId(32);
		while (true) {
			let object = await this.lookupObject(id).catch(() => undefined);
			if (object == null) {
				break;
			}
			id = this.detail.generateId?.() ?? ids.generateHexId(32);
		}
		return id;
	}

	protected async detectNullOrder(): Promise<NullOrder> {
		let connection = await this.detail.getConnection();
		let objects = await connection.query<Array<{ value: number | null; }>>(`
			SELECT
				value
			FROM (
				(SELECT 0 AS value)
				UNION ALL
				(SELECT NULL AS value)
			) AS source
			ORDER BY
				value ASC;
		`, []);
		return objects[0].value == null ? "NULLS_FIRST" : "NULLS_LAST";
	}

	protected escapeIdentifier(identifier: string): string {
		if (this.use_ansi_quotes) {
			return `"${identifier.replaceAll("\"", "\"\"")}"`;
		} else {
			if (!/^[a-z_][a-z0-9_]*$/i.test(identifier)) {
				throw new ExpectedSafeIdentifierError(identifier);
			}
			return identifier;
		}
	}

	protected serializeWherePrimitive(where: { key: string; operator: schema.Operator; operand: string | boolean | number | Date | null; }, null_order: NullOrder): {
		sql: string;
		parameters: Array<ObjectValue>;
	} {
		if (null_order === "NULLS_FIRST") {
			if (where.operator === "<") {
				if (where.operand == null) {
					return {
						sql: `(FALSE)`,
						parameters: []
					};
				} else {
					return {
						sql: `(${this.escapeIdentifier(where.key)} IS NULL) OR (${this.escapeIdentifier(where.key)} < ?)`,
						parameters: [
							where.operand
						]
					};
				}
			} else if (where.operator === "<=") {
				if (where.operand == null) {
					return {
						sql: `(${this.escapeIdentifier(where.key)} IS NULL)`,
						parameters: []
					};
				} else {
					return {
						sql: `(${this.escapeIdentifier(where.key)} IS NULL) OR (${this.escapeIdentifier(where.key)} <= ?)`,
						parameters: [
							where.operand
						]
					};
				}
			} else if (where.operator === "==") {
				if (where.operand == null) {
					return {
						sql: `${this.escapeIdentifier(where.key)} IS NULL`,
						parameters: []
					};
				} else {
					return {
						sql: `${this.escapeIdentifier(where.key)} = ?`,
						parameters: [
							where.operand
						]
					};
				}
			} else if (where.operator === "!=") {
				if (where.operand == null) {
					return {
						sql: `${this.escapeIdentifier(where.key)} IS NOT NULL`,
						parameters: []
					};
				} else {
					return {
						sql: `(${this.escapeIdentifier(where.key)} IS NULL) OR (${this.escapeIdentifier(where.key)} <> ?)`,
						parameters: [
							where.operand
						]
					};
				}
			} else if (where.operator === ">") {
				if (where.operand == null) {
					return {
						sql: `(${this.escapeIdentifier(where.key)} IS NOT NULL)`,
						parameters: []
					};
				} else {
					return {
						sql: `(${this.escapeIdentifier(where.key)} > ?)`,
						parameters: [
							where.operand
						]
					};
				}
			} else if (where.operator === ">=") {
				if (where.operand == null) {
					return {
						sql: `(TRUE)`,
						parameters: []
					};
				} else {
					return {
						sql: `(${this.escapeIdentifier(where.key)} >= ?)`,
						parameters: [
							where.operand
						]
					};
				}
			} else {
				let dummy: never = where.operator;
			}
		} else {
			if (where.operator === "<") {
				if (where.operand == null) {
					return {
						sql: `(${this.escapeIdentifier(where.key)} IS NOT NULL)`,
						parameters: []
					};
				} else {
					return {
						sql: `(${this.escapeIdentifier(where.key)} < ?)`,
						parameters: [
							where.operand
						]
					};
				}
			} else if (where.operator === "<=") {
				if (where.operand == null) {
					return {
						sql: `(TRUE)`,
						parameters: []
					};
				} else {
					return {
						sql: `(${this.escapeIdentifier(where.key)} <= ?)`,
						parameters: [
							where.operand
						]
					};
				}
			} else if (where.operator === "==") {
				if (where.operand == null) {
					return {
						sql: `${this.escapeIdentifier(where.key)} IS NULL`,
						parameters: []
					};
				} else {
					return {
						sql: `${this.escapeIdentifier(where.key)} = ?`,
						parameters: [
							where.operand
						]
					};
				}
			} else if (where.operator === "!=") {
				if (where.operand == null) {
					return {
						sql: `${this.escapeIdentifier(where.key)} IS NOT NULL`,
						parameters: []
					};
				} else {
					return {
						sql: `(${this.escapeIdentifier(where.key)} IS NULL) OR (${this.escapeIdentifier(where.key)} <> ?)`,
						parameters: [
							where.operand
						]
					};
				}
			} else if (where.operator === ">") {
				if (where.operand == null) {
					return {
						sql: `(FALSE)`,
						parameters: []
					};
				} else {
					return {
						sql: `(${this.escapeIdentifier(where.key)} IS NULL) OR (${this.escapeIdentifier(where.key)} > ?)`,
						parameters: [
							where.operand
						]
					};
				}
			} else if (where.operator === ">=") {
				if (where.operand == null) {
					return {
						sql: `(${this.escapeIdentifier(where.key)} IS NULL)`,
						parameters: []
					};
				} else {
					return {
						sql: `(${this.escapeIdentifier(where.key)} IS NULL) OR (${this.escapeIdentifier(where.key)} >= ?)`,
						parameters: [
							where.operand
						]
					};
				}
			} else {
				let dummy: never = where.operator;
			}
		}
		throw new Error(`Expected code to be unreachable!`);
	}

	protected serializeWhere(where: schema.Where, null_order: NullOrder): {
		sql: string;
		parameters: Array<ObjectValue>;
	} {
		if (schema.WhereString.is(where)) {
			if (schema.Operator.is(where.operator)) {
				return this.serializeWherePrimitive({
					key: where.key,
					operator: where.operator,
					operand: where.operand
				}, null_order);
			} else {
				if (where.operator === "^=") {
					if (where.operand == null) {
						return {
							sql: `(FALSE)`,
							parameters: []
						};
					} else {
						return {
							sql: `${this.escapeIdentifier(where.key)} LIKE ? ESCAPE '\\\\'`,
							parameters: [
								`${where.operand.replace(/[\\%_]/g, (match) => `\\${match}`)}%`
							]
						};
					}
				} else if (where.operator === "*=") {
					if (where.operand == null) {
						return {
							sql: `(FALSE)`,
							parameters: []
						};
					} else {
						return {
							sql: `${this.escapeIdentifier(where.key)} LIKE ? ESCAPE '\\\\'`,
							parameters: [
								`%${where.operand.replace(/[\\%_]/g, (match) => `\\${match}`)}%`
							]
						};
					}
				} else if (where.operator === "$=") {
					if (where.operand == null) {
						return {
							sql: `(FALSE)`,
							parameters: []
						};
					} else {
						return {
							sql: `${this.escapeIdentifier(where.key)} LIKE ? ESCAPE '\\\\'`,
							parameters: [
								`%${where.operand.replace(/[\\%_]/g, (match) => `\\${match}`)}`
							]
						};
					}
				} else {
					let dummy: never = where.operator;
				}
			}
		} else if (schema.WhereInteger.is(where)) {
			return this.serializeWherePrimitive(where, null_order);
		} else if (schema.WhereBoolean.is(where)) {
			return this.serializeWherePrimitive(where, null_order);
		} else if (schema.WhereDate.is(where)) {
			return this.serializeWherePrimitive(where, null_order);
		} else if (schema.WhereAll.is(where)) {
			let results = where.all.map((where) => this.serializeWhere(where, null_order));
			return {
				sql: results.map((result) => `(${result.sql})`).join(" AND ") || "TRUE",
				parameters: results.reduce((parameters, result) => [...parameters, ...result.parameters], [] as Array<ObjectValue>)
			};
		} else if (schema.WhereAny.is(where)) {
			let results = where.any.map((where) => this.serializeWhere(where, null_order));
			return {
				sql: results.map((result) => `(${result.sql})`).join(" OR ") || "FALSE",
				parameters: results.reduce((parameters, result) => [...parameters, ...result.parameters], [] as Array<ObjectValue>)
			};
		} else if (schema.WhereNot.is(where)) {
			let result = this.serializeWhere(where.not, null_order);
			return {
				sql: `NOT (${result.sql})`,
				parameters: result.parameters
			};
		} else {
			let dummy: never = where;
		}
		throw new Error(`Expected code to be unreachable!`);
	}

	protected serializeOrder(order: schema.Order): {
		sql: Array<string>;
		parameters: Array<ObjectValue>;
	} {
		return {
			sql: order.keys.map((key) => `${this.escapeIdentifier(String(key))} ${order.sort}`).map((line, index, lines) => index < lines.length - 1 ? `${line},` : line),
			parameters: []
		};
	}

	protected serializeLength(length: number | undefined): {
		sql: Array<string>;
		parameters: Array<ObjectValue>;
	} {
		return {
			sql: length == null ? [] : [`LIMIT ${length}`],
			parameters: []
		};
	}

	protected serializeOffset(offset: number | undefined): {
		sql: Array<string>;
		parameters: Array<ObjectValue>;
	} {
		return {
			sql: offset == null ? [] : [`OFFSET ${offset}`],
			parameters: []
		};
	}

	constructor(detail: DatabaseObjectStoreDetail, table: string, id: B, guard: autoguard.serialization.MessageGuard<Object<A, B>>, options?: DatabaseObjectStoreOptions<A, B>) {
		super();
		this.detail = detail;
		this.table = table;
		this.id = id;
		this.guard = guard;
		this.use_ansi_quotes = options?.use_ansi_quotes ?? false;
		this.immutable_keys = options?.immutable_keys ?? [];
		this.null_order = options?.null_order ?? undefined;
	}

	async createObject(properties: A | Object<A, B>): Promise<Object<A, B>> {
		let connection = await this.detail.getConnection();
		let id = this.guard.is(properties) ? properties[this.id] : await this.createId();
		let object = this.guard.to({
			...properties,
			[this.id]: id
		});
		let columns = [
			...Object.keys(object)
		];
		let values = [
			...Object.values<ObjectValue>(object)
		];
		await connection.query(`
			INSERT INTO ${this.escapeIdentifier(this.table)} (
				${columns.map((column) => `${this.escapeIdentifier(column)}`).join(",\r\n				")}
			) VALUES (
				${"?".repeat(columns.length).split("").join(",\r\n				")}
			)
		`, values);
		return this.lookupObject(id);
	}

	async lookupObject(id: string): Promise<Object<A, B>> {
		let connection = await this.detail.getConnection();
		let objects = await connection.query<Array<Record<string, ObjectValue>>>(`
			SELECT
				*
			FROM
				${this.escapeIdentifier(this.table)}
			WHERE
				${this.escapeIdentifier(this.id)} = ?
		`, [
			id
		]);
		if (objects.length === 0) {
			throw new ExpectedObjectError(this.id, id);
		}
		return this.guard.to(objects[0]);
	}

	async lookupObjects(lookup_options?: LookupOptions<A, B>): Promise<Object<A, B>[]> {
		let connection = await this.detail.getConnection();
		let options = await this.getOptions(this.id, lookup_options);
		let null_order = this.null_order != null ? this.null_order : this.null_order = await this.detectNullOrder();
		let where = this.serializeWhere(options.where, null_order);
		let order = this.serializeOrder(options.order);
		let length = this.serializeLength(options.length);
		let offset = this.serializeOffset(options.offset);
		let objects = await connection.query<Array<Record<string, ObjectValue>>>(`
			SELECT
				*
			FROM
				${this.escapeIdentifier(this.table)}
			WHERE
				${where.sql}
			ORDER BY
				${order.sql.join("\n				")}
		`
		+ length.sql.join("\n			")
		+ offset.sql.join("\n			"), [
			...where.parameters,
			...order.parameters,
			...length.parameters,
			...offset.parameters
		]);
		return objects.map((object) => this.guard.to(object));
	}

	async updateObject(object: Object<A, B>): Promise<Object<A, B>> {
		object = this.guard.to(object);
		let connection = await this.detail.getConnection();
		let id = object[this.id];
		let existing_object = await this.lookupObject(id).catch(() => undefined);
		if (existing_object == null) {
			throw new ExpectedObjectError(this.id, id);
		}
		let columns = [
			...Object.keys(object)
		];
		let values = [
			...Object.values<ObjectValue>(object)
		];
		for (let key of Object.keys(object) as Array<keyof A>) {
			if (this.immutable_keys.includes(key)) {
				let one = object[key];
				let two = existing_object[key];
				if (one !== two) {
					throw new ExpectedImmutablePropertyError(key, one, two);
				}
			}
		}
		await connection.query(`
			UPDATE
				${this.escapeIdentifier(this.table)}
			SET
				${columns.map((column) => `${this.escapeIdentifier(column)} = ?`).join(",\r\n				")}
			WHERE
				${this.escapeIdentifier(this.id)} = ?
		`, [
			...values,
			id
		]);
		return this.lookupObject(id);
	}

	async deleteObject(id: string): Promise<Object<A, B>> {
		let connection = await this.detail.getConnection();
		let object = await this.lookupObject(id).catch(() => undefined);
		if (object == null) {
			throw new ExpectedObjectError(this.id, id);
		}
		await connection.query(`
			DELETE
			FROM
				${this.escapeIdentifier(this.table)}
			WHERE
				${this.escapeIdentifier(this.id)} = ?
		`, [
			id
		]);
		return object;
	}
};
