"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NULLS_LAST_OBJECT_VALUE_COLLATOR = exports.NULLS_FIRST_OBJECT_VALUE_COLLATOR = void 0;
const NULLS_FIRST_OBJECT_VALUE_COLLATOR = (one, two) => {
    if (one == null) {
        if (two == null) {
            return "IDENTICAL";
        }
        else {
            return "ONE_COMES_FIRST";
        }
    }
    else {
        if (two == null) {
            return "TWO_COMES_FIRST";
        }
        else {
            if (one < two) {
                return "ONE_COMES_FIRST";
            }
            if (two < one) {
                return "TWO_COMES_FIRST";
            }
            return "IDENTICAL";
        }
    }
};
exports.NULLS_FIRST_OBJECT_VALUE_COLLATOR = NULLS_FIRST_OBJECT_VALUE_COLLATOR;
const NULLS_LAST_OBJECT_VALUE_COLLATOR = (one, two) => {
    if (one == null) {
        if (two == null) {
            return "IDENTICAL";
        }
        else {
            return "TWO_COMES_FIRST";
        }
    }
    else {
        if (two == null) {
            return "ONE_COMES_FIRST";
        }
        else {
            if (one < two) {
                return "ONE_COMES_FIRST";
            }
            if (two < one) {
                return "TWO_COMES_FIRST";
            }
            return "IDENTICAL";
        }
    }
};
exports.NULLS_LAST_OBJECT_VALUE_COLLATOR = NULLS_LAST_OBJECT_VALUE_COLLATOR;
