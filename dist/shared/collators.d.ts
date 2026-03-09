export type Collatable = string | number | boolean | null | Date | undefined;
export type CollatorResult = "ONE_COMES_FIRST" | "IDENTICAL" | "TWO_COMES_FIRST";
export type Collator<A> = (one: A, two: A) => CollatorResult;
export declare const NULLS_FIRST_OBJECT_VALUE_COLLATOR: Collator<Collatable>;
export declare const NULLS_LAST_OBJECT_VALUE_COLLATOR: Collator<Collatable>;
