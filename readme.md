# @joelek/prequel

Type-safe object–relational mapper.

```ts
import * as prequel from "@joelek/prequel";

const OBJECTS = new prequel.stores.VolatileObjectStore("object_id", [], prequel.guards.Object.of({
	property: prequel.guards.String
}));

let object = await OBJECTS.createObject({
	property: "value"
});

let objects = await OBJECTS.lookupObjects({
	where: {
		key: "property",
		operator: "==",
		operand: "value"
	},
	order: {
		keys: ["object_id"],
		sort: "ASC"
	}
});
```

## Features

### Object stores

Prequel includes support for interfacing with different object storage systems through the abstract `ObjectStore` class. It uses the following signature where the `A` type denotes the properties record and the `B` type the name of the id field, uniquely identifying each object.

```ts
createObject(properties: ObjectWithOptionalId<A, B>): Promise<Object<A, B>>;
lookupObject(id: string): Promise<Object<A, B>>;
lookupObjects(lookup_options?: LookupOptions<A, B>): Promise<Array<Object<A, B>>>;
updateObject(object: Object<A, B>): Promise<Object<A, B>>;
deleteObject(id: string): Promise<Object<A, B>>;
```

There are two implementations of the abstract class, `VolatileObjectStore` and `DatabaseObjectStore`.

The `VolatileObjectStore` class stores objects using volatile storage (i.e. in memory). It is simple to integrate and can be used to quickly test new functionality without having to write a full-fledged database backend. It is not intended for production use since its performance is not guaranteed to be optimized for all scenarios.

```ts
import * as prequel from "@joelek/prequel";

const OBJECTS = new prequel.stores.VolatileObjectStore("object_id", [], prequel.guards.Object.of({
	property: prequel.guards.String
}));
```

The `DatabaseObjectStore` class stores objects using a database backend, communicating through standardized ANSI SQL statements. It is a bit more complicated to integrate since database tables and indices have to be created and the connection configured. It is intended for production use as long as the database backend is properly configured.

```ts
import * as prequel from "@joelek/prequel";

const DETAIL = {
	async getConnection() {
		return {
			async query(sql, parameters) {
				// Should execute the provided sql using the provided parameters and return the result, preferrably using a prepared statement.
			}
		};
	}
};

const OBJECTS = new prequel.stores.DatabaseObjectStore(DETAIL, "objects", "object_id", prequel.guards.Object.of({
	property: prequel.guards.String
}));
```

## Sponsorship

The continued development of this software depends on your sponsorship. Please consider sponsoring this project if you find that the software creates value for you and your organization.

The sponsor button can be used to view the different sponsoring options. Contributions of all sizes are welcome.

Thank you for your support!

### Ethereum

Ethereum contributions can be made to address `0xf1B63d95BEfEdAf70B3623B1A4Ba0D9CE7F2fE6D`.

![](./eth.png)

## Installation

Releases follow semantic versioning and release packages are published using the GitHub platform. Use the following command to install the latest release.

```
npm install joelek/prequel#semver:^0.1
```

Use the following command to install the very latest build. The very latest build may include breaking changes and should not be used in production environments.

```
npm install joelek/prequel#master
```

NB: This project targets TypeScript 4 in strict mode.

## Roadmap

* Write unit tests.
