import * as wtf from "@joelek/wtf";
import * as prequel from "../nodejs";
import * as mariadb from "./mariadb";
import * as objects from "./objects";

for (let operator of [">", ">=", "==", "!=", "<", "<="] as const) {
	for (let value of [5, null] as const) {
		for (let sort of ["ASC", "DESC"] as const) {
			wtf.test(`Stores should support integer lookup filters for operator ${operator}, value ${value} and sort ${sort}.`, async (assert) => {
				let store = new prequel.stores.VolatileObjectStore("object_id", [], objects.Object, {});
				for (let object of await mariadb.OBJECTS.lookupObjects()) {
					store.createObject(object);
				}
				let expected = await store.lookupObjects({
					where: {
						key: "optional_integer",
						operator: operator,
						operand: 5
					},
					order: {
						keys: ["optional_integer", "object_id"],
						sort: sort
					}
				});
				let observed: Array<objects.Object> = [];
				while (true) {
					let objects = await mariadb.OBJECTS.lookupObjects({
						where: {
							key: "optional_integer",
							operator: operator,
							operand: 5
						},
						order: {
							keys: ["optional_integer", "object_id"],
							sort: sort
						},
						anchor: observed[observed.length - 1]?.object_id,
						length: 1
					});
					if (objects.length === 0) {
						break;
					}
					observed.push(...objects);
				}
				assert.equals(observed, expected);
			});
		}
	}
}
