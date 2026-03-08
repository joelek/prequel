"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const wtf = require("@joelek/wtf");
const collators = require("../shared/collators");
const stores = require("./stores");
wtf.test(`ObjectIndex should support lookups.`, async (assert) => {
    let index = new stores.ObjectIndex([], "id", "value", collators.NULLS_FIRST_OBJECT_VALUE_COLLATOR);
    index.insert({
        id: "a",
        value: 1
    });
    index.insert({
        id: "b",
        value: 3
    });
    assert.equals(index.lookup("<", 0).map((object) => object.id), []);
    assert.equals(index.lookup("<", 1).map((object) => object.id), []);
    assert.equals(index.lookup("<", 2).map((object) => object.id), ["a"]);
    assert.equals(index.lookup("<", 3).map((object) => object.id), ["a"]);
    assert.equals(index.lookup("<", 4).map((object) => object.id), ["a", "b"]);
    assert.equals(index.lookup("<=", 0).map((object) => object.id), []);
    assert.equals(index.lookup("<=", 1).map((object) => object.id), ["a"]);
    assert.equals(index.lookup("<=", 2).map((object) => object.id), ["a"]);
    assert.equals(index.lookup("<=", 3).map((object) => object.id), ["a", "b"]);
    assert.equals(index.lookup("<=", 4).map((object) => object.id), ["a", "b"]);
    assert.equals(index.lookup("==", 0).map((object) => object.id), []);
    assert.equals(index.lookup("==", 1).map((object) => object.id), ["a"]);
    assert.equals(index.lookup("==", 2).map((object) => object.id), []);
    assert.equals(index.lookup("==", 3).map((object) => object.id), ["b"]);
    assert.equals(index.lookup("==", 4).map((object) => object.id), []);
    assert.equals(index.lookup("!=", 0).map((object) => object.id), ["a", "b"]);
    assert.equals(index.lookup("!=", 1).map((object) => object.id), ["b"]);
    assert.equals(index.lookup("!=", 2).map((object) => object.id), ["a", "b"]);
    assert.equals(index.lookup("!=", 3).map((object) => object.id), ["a"]);
    assert.equals(index.lookup("!=", 4).map((object) => object.id), ["a", "b"]);
    assert.equals(index.lookup(">", 0).map((object) => object.id), ["a", "b"]);
    assert.equals(index.lookup(">", 1).map((object) => object.id), ["b"]);
    assert.equals(index.lookup(">", 2).map((object) => object.id), ["b"]);
    assert.equals(index.lookup(">", 3).map((object) => object.id), []);
    assert.equals(index.lookup(">", 4).map((object) => object.id), []);
    assert.equals(index.lookup(">=", 0).map((object) => object.id), ["a", "b"]);
    assert.equals(index.lookup(">=", 1).map((object) => object.id), ["a", "b"]);
    assert.equals(index.lookup(">=", 2).map((object) => object.id), ["b"]);
    assert.equals(index.lookup(">=", 3).map((object) => object.id), ["b"]);
    assert.equals(index.lookup(">=", 4).map((object) => object.id), []);
});
wtf.test(`Filter should support typed filters.`, async (assert) => {
    let filter1 = {
        key: "required_boolean",
        operator: "==",
        operand: false
    };
    let filter2 = {
        key: "required_string",
        operator: "==",
        operand: ""
    };
    let filter3 = {
        key: "required_number",
        operator: "==",
        operand: 0
    };
    let filter4 = {
        key: "required_enum",
        operator: "==",
        operand: "one"
    };
    let filter5 = {
        key: "optional_boolean",
        operator: "==",
        operand: null
    };
    let filter6 = {
        key: "optional_string",
        operator: "==",
        operand: null
    };
    let filter7 = {
        key: "optional_number",
        operator: "==",
        operand: null
    };
    let filter8 = {
        key: "optional_enum",
        operator: "==",
        operand: null
    };
    let filter9 = {
        not: {
            key: "id",
            operator: "==",
            operand: ""
        }
    };
});
