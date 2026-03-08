"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateHexId = exports.generateDigitId = void 0;
const libcrypto = require("crypto");
function generateDigitId(length) {
    let count = Math.ceil((Math.log2(10) * length) / 8);
    let bytes = libcrypto.randomBytes(count);
    let value = BigInt(0);
    for (let i = 0; i < bytes.length; i += 1) {
        value = (value << BigInt(8)) | BigInt(bytes[i]);
    }
    let modulus = BigInt(10) ** BigInt(length);
    value = value % modulus;
    let string = value.toString().padStart(length, "0");
    return string;
}
exports.generateDigitId = generateDigitId;
;
function generateHexId(length) {
    let count = Math.ceil(length / 2);
    let bytes = libcrypto.randomBytes(count);
    let string = bytes.toString("hex").slice(0, length);
    return string;
}
exports.generateHexId = generateHexId;
;
