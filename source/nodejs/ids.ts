import * as libcrypto from "crypto";

export function generateDigitId(length: number): string {
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
};

export function generateHexId(length: number): string {
	let count = Math.ceil(length / 2);
	let bytes = libcrypto.randomBytes(count);
	let string = bytes.toString("hex").slice(0, length);
	return string;
};
