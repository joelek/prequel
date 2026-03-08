import * as mariadb from "mariadb";
import * as prequel from "../nodejs";
export declare function getConnection(): Promise<mariadb.Connection>;
export declare const OBJECTS: prequel.stores.DatabaseObjectStore<{
    object_id: string;
    optional_boolean: boolean | null;
    optional_integer: number | null;
    optional_string: string | null;
}, "object_id">;
