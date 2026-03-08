"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpectedUnreachableCodeError = void 0;
class ExpectedUnreachableCodeError extends Error {
    constructor() {
        super();
    }
    toString() {
        return `Expected code to be unreachable!`;
    }
}
exports.ExpectedUnreachableCodeError = ExpectedUnreachableCodeError;
;
