"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OBJECTS = exports.getConnection = void 0;
const mariadb = require("mariadb");
const prequel = require("../nodejs");
const objects = require("./objects");
let CONNECTION;
async function getConnection() {
    if (CONNECTION == null) {
        CONNECTION = await mariadb.createConnection({
            host: "localhost",
            port: 3306,
            user: "root",
            database: "prequel",
            password: "",
            bigIntAsNumber: true,
            decimalAsNumber: true,
            checkNumberRange: true,
            typeCast: (field, next) => {
                if ([1 /* mariadb.TypeNumbers.TINY */, 2 /* mariadb.TypeNumbers.SHORT */, 3 /* mariadb.TypeNumbers.LONG */].includes(field.columnType) && field.columnLength === 1) {
                    let value = field.int();
                    return value == null ? null : value === 1;
                }
                return next();
            }
        });
        await CONNECTION.query(`SET SQL_MODE = 'ANSI_QUOTES,TRADITIONAL'`);
        /*
                await CONNECTION.query(`
                    DROP TABLE IF EXISTS objects
                `, []);
                await CONNECTION.query(`
                    CREATE TABLE IF NOT EXISTS objects (
                        object_id VARCHAR(32) PRIMARY KEY NOT NULL,
                            UNIQUE INDEX object_id (object_id),
                        optional_boolean BOOL,
                            UNIQUE INDEX optional_boolean (optional_boolean, object_id),
                        optional_integer INT,
                            UNIQUE INDEX optional_integer (optional_integer, object_id),
                        optional_string VARCHAR(15),
                            UNIQUE INDEX optional_string (optional_string, object_id),
                        optional_date DATETIME,
                            UNIQUE INDEX optional_date (optional_date, object_id)
                    )
                `, []);
                for (let i = 0; i < 1000; i++) {
                    await CONNECTION.query(`
                        INSERT INTO objects (
                            object_id,
                            optional_boolean,
                            optional_integer,
                            optional_string,
                            optional_date
                        ) VALUES (
                            ?,
                            ?,
                            ?,
                            ?,
                            ?
                        )
                    `, [
                        prequel.ids.generateHexId(32),
                        Math.random() < 0.1 ? null : Math.random() < 0.5 ? true : false,
                        Math.random() < 0.1 ? null : Math.floor(Math.random() * 10),
                        Math.random() < 0.1 ? null : String.fromCharCode("A".charCodeAt(0) + Math.floor(Math.random() * 10)),
                        Math.random() < 0.1 ? null : new Date(Math.floor(Math.random() * 10000))
                    ]);
                }
        */
    }
    return CONNECTION;
}
exports.getConnection = getConnection;
;
const DETAIL = {
    getConnection: getConnection,
    generateId: () => prequel.ids.generateHexId(32)
};
exports.OBJECTS = new prequel.stores.DatabaseObjectStore(DETAIL, "objects", "object_id", objects.Object, {});
