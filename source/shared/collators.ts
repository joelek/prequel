export type Collatable = string | number | boolean | null | Date | undefined;

export type CollatorResult = "ONE_COMES_FIRST" | "IDENTICAL" | "TWO_COMES_FIRST";

export type Collator<A> = (one: A, two: A) => CollatorResult;

export const NULLS_FIRST_OBJECT_VALUE_COLLATOR: Collator<Collatable> = (one, two) => {
	if (one == null) {
		if (two == null) {
			return "IDENTICAL";
		} else {
			return "ONE_COMES_FIRST";
		}
	} else {
		if (two == null) {
			return "TWO_COMES_FIRST";
		} else {
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

export const NULLS_LAST_OBJECT_VALUE_COLLATOR: Collator<Collatable> = (one, two) => {
	if (one == null) {
		if (two == null) {
			return "IDENTICAL";
		} else {
			return "TWO_COMES_FIRST";
		}
	} else {
		if (two == null) {
			return "ONE_COMES_FIRST";
		} else {
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
