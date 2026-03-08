import * as autoguard from "@joelek/autoguard/dist/lib-shared";
export declare const Operator: autoguard.serialization.MessageGuard<Operator>;
export type Operator = autoguard.guards.Union<[
    autoguard.guards.StringLiteral<">">,
    autoguard.guards.StringLiteral<">=">,
    autoguard.guards.StringLiteral<"==">,
    autoguard.guards.StringLiteral<"!=">,
    autoguard.guards.StringLiteral<"<">,
    autoguard.guards.StringLiteral<"<=">
]>;
export declare const IntegerOperator: autoguard.serialization.MessageGuard<IntegerOperator>;
export type IntegerOperator = autoguard.guards.Reference<Operator>;
export declare const WhereInteger: autoguard.serialization.MessageGuard<WhereInteger>;
export type WhereInteger = autoguard.guards.Object<{
    "key": autoguard.guards.String;
    "operator": autoguard.guards.Reference<IntegerOperator>;
    "operand": autoguard.guards.Union<[
        autoguard.guards.Integer,
        autoguard.guards.Null
    ]>;
}, {}>;
export declare const StringOperator: autoguard.serialization.MessageGuard<StringOperator>;
export type StringOperator = autoguard.guards.Union<[
    autoguard.guards.Reference<Operator>,
    autoguard.guards.StringLiteral<"^=">,
    autoguard.guards.StringLiteral<"*=">,
    autoguard.guards.StringLiteral<"$=">
]>;
export declare const WhereString: autoguard.serialization.MessageGuard<WhereString>;
export type WhereString = autoguard.guards.Object<{
    "key": autoguard.guards.String;
    "operator": autoguard.guards.Reference<StringOperator>;
    "operand": autoguard.guards.Union<[
        autoguard.guards.String,
        autoguard.guards.Null
    ]>;
}, {}>;
export declare const BooleanOperator: autoguard.serialization.MessageGuard<BooleanOperator>;
export type BooleanOperator = autoguard.guards.Reference<Operator>;
export declare const WhereBoolean: autoguard.serialization.MessageGuard<WhereBoolean>;
export type WhereBoolean = autoguard.guards.Object<{
    "key": autoguard.guards.String;
    "operator": autoguard.guards.Reference<BooleanOperator>;
    "operand": autoguard.guards.Union<[
        autoguard.guards.Boolean,
        autoguard.guards.Null
    ]>;
}, {}>;
export declare const WhereAll: autoguard.serialization.MessageGuard<WhereAll>;
export type WhereAll = autoguard.guards.Object<{
    "all": autoguard.guards.Array<autoguard.guards.Reference<Where>>;
}, {}>;
export declare const WhereAny: autoguard.serialization.MessageGuard<WhereAny>;
export type WhereAny = autoguard.guards.Object<{
    "any": autoguard.guards.Array<autoguard.guards.Reference<Where>>;
}, {}>;
export declare const WhereNot: autoguard.serialization.MessageGuard<WhereNot>;
export type WhereNot = autoguard.guards.Object<{
    "not": autoguard.guards.Reference<Where>;
}, {}>;
export declare const Where: autoguard.serialization.MessageGuard<Where>;
export type Where = autoguard.guards.Union<[
    autoguard.guards.Reference<WhereInteger>,
    autoguard.guards.Reference<WhereString>,
    autoguard.guards.Reference<WhereBoolean>,
    autoguard.guards.Reference<WhereAll>,
    autoguard.guards.Reference<WhereAny>,
    autoguard.guards.Reference<WhereNot>
]>;
export declare const Sort: autoguard.serialization.MessageGuard<Sort>;
export type Sort = autoguard.guards.Union<[
    autoguard.guards.StringLiteral<"ASC">,
    autoguard.guards.StringLiteral<"DESC">
]>;
export declare const Order: autoguard.serialization.MessageGuard<Order>;
export type Order = autoguard.guards.Object<{
    "keys": autoguard.guards.Array<autoguard.guards.String>;
    "sort": autoguard.guards.Reference<Sort>;
}, {}>;
export declare namespace Autoguard {
    const Guards: {
        Operator: autoguard.guards.ReferenceGuard<"<" | "<=" | ">=" | ">" | "==" | "!=">;
        IntegerOperator: autoguard.guards.ReferenceGuard<"<" | "<=" | ">=" | ">" | "==" | "!=">;
        WhereInteger: autoguard.guards.ReferenceGuard<{
            key: string;
            operator: "<" | "<=" | ">=" | ">" | "==" | "!=";
            operand: number | null;
        }>;
        StringOperator: autoguard.guards.ReferenceGuard<"<" | "<=" | ">=" | ">" | "==" | "!=" | "^=" | "*=" | "$=">;
        WhereString: autoguard.guards.ReferenceGuard<{
            key: string;
            operator: "<" | "<=" | ">=" | ">" | "==" | "!=" | "^=" | "*=" | "$=";
            operand: string | null;
        }>;
        BooleanOperator: autoguard.guards.ReferenceGuard<"<" | "<=" | ">=" | ">" | "==" | "!=">;
        WhereBoolean: autoguard.guards.ReferenceGuard<{
            key: string;
            operator: "<" | "<=" | ">=" | ">" | "==" | "!=";
            operand: boolean | null;
        }>;
        WhereAll: autoguard.guards.ReferenceGuard<{
            all: autoguard.guards.Array<{
                key: string;
                operator: "<" | "<=" | ">=" | ">" | "==" | "!=";
                operand: number | null;
            } | {
                key: string;
                operator: "<" | "<=" | ">=" | ">" | "==" | "!=" | "^=" | "*=" | "$=";
                operand: string | null;
            } | {
                key: string;
                operator: "<" | "<=" | ">=" | ">" | "==" | "!=";
                operand: boolean | null;
            } | any | {
                any: autoguard.guards.Array<{
                    key: string;
                    operator: "<" | "<=" | ">=" | ">" | "==" | "!=";
                    operand: number | null;
                } | {
                    key: string;
                    operator: "<" | "<=" | ">=" | ">" | "==" | "!=" | "^=" | "*=" | "$=";
                    operand: string | null;
                } | {
                    key: string;
                    operator: "<" | "<=" | ">=" | ">" | "==" | "!=";
                    operand: boolean | null;
                } | any | any | {
                    not: {
                        key: string;
                        operator: "<" | "<=" | ">=" | ">" | "==" | "!=";
                        operand: number | null;
                    } | {
                        key: string;
                        operator: "<" | "<=" | ">=" | ">" | "==" | "!=" | "^=" | "*=" | "$=";
                        operand: string | null;
                    } | {
                        key: string;
                        operator: "<" | "<=" | ">=" | ">" | "==" | "!=";
                        operand: boolean | null;
                    } | any | any | any;
                }>;
            } | {
                not: {
                    key: string;
                    operator: "<" | "<=" | ">=" | ">" | "==" | "!=";
                    operand: number | null;
                } | {
                    key: string;
                    operator: "<" | "<=" | ">=" | ">" | "==" | "!=" | "^=" | "*=" | "$=";
                    operand: string | null;
                } | {
                    key: string;
                    operator: "<" | "<=" | ">=" | ">" | "==" | "!=";
                    operand: boolean | null;
                } | any | any | any;
            }>;
        }>;
        WhereAny: autoguard.guards.ReferenceGuard<{
            any: autoguard.guards.Array<{
                key: string;
                operator: "<" | "<=" | ">=" | ">" | "==" | "!=";
                operand: number | null;
            } | {
                key: string;
                operator: "<" | "<=" | ">=" | ">" | "==" | "!=" | "^=" | "*=" | "$=";
                operand: string | null;
            } | {
                key: string;
                operator: "<" | "<=" | ">=" | ">" | "==" | "!=";
                operand: boolean | null;
            } | any | any | {
                not: {
                    key: string;
                    operator: "<" | "<=" | ">=" | ">" | "==" | "!=";
                    operand: number | null;
                } | {
                    key: string;
                    operator: "<" | "<=" | ">=" | ">" | "==" | "!=" | "^=" | "*=" | "$=";
                    operand: string | null;
                } | {
                    key: string;
                    operator: "<" | "<=" | ">=" | ">" | "==" | "!=";
                    operand: boolean | null;
                } | any | any | any;
            }>;
        }>;
        WhereNot: autoguard.guards.ReferenceGuard<{
            not: {
                key: string;
                operator: "<" | "<=" | ">=" | ">" | "==" | "!=";
                operand: number | null;
            } | {
                key: string;
                operator: "<" | "<=" | ">=" | ">" | "==" | "!=" | "^=" | "*=" | "$=";
                operand: string | null;
            } | {
                key: string;
                operator: "<" | "<=" | ">=" | ">" | "==" | "!=";
                operand: boolean | null;
            } | any | any | any;
        }>;
        Where: autoguard.guards.ReferenceGuard<{
            key: string;
            operator: "<" | "<=" | ">=" | ">" | "==" | "!=";
            operand: number | null;
        } | {
            key: string;
            operator: "<" | "<=" | ">=" | ">" | "==" | "!=" | "^=" | "*=" | "$=";
            operand: string | null;
        } | {
            key: string;
            operator: "<" | "<=" | ">=" | ">" | "==" | "!=";
            operand: boolean | null;
        } | {
            all: autoguard.guards.Array<{
                key: string;
                operator: "<" | "<=" | ">=" | ">" | "==" | "!=";
                operand: number | null;
            } | {
                key: string;
                operator: "<" | "<=" | ">=" | ">" | "==" | "!=" | "^=" | "*=" | "$=";
                operand: string | null;
            } | {
                key: string;
                operator: "<" | "<=" | ">=" | ">" | "==" | "!=";
                operand: boolean | null;
            } | any | {
                any: autoguard.guards.Array<{
                    key: string;
                    operator: "<" | "<=" | ">=" | ">" | "==" | "!=";
                    operand: number | null;
                } | {
                    key: string;
                    operator: "<" | "<=" | ">=" | ">" | "==" | "!=" | "^=" | "*=" | "$=";
                    operand: string | null;
                } | {
                    key: string;
                    operator: "<" | "<=" | ">=" | ">" | "==" | "!=";
                    operand: boolean | null;
                } | any | any | {
                    not: {
                        key: string;
                        operator: "<" | "<=" | ">=" | ">" | "==" | "!=";
                        operand: number | null;
                    } | {
                        key: string;
                        operator: "<" | "<=" | ">=" | ">" | "==" | "!=" | "^=" | "*=" | "$=";
                        operand: string | null;
                    } | {
                        key: string;
                        operator: "<" | "<=" | ">=" | ">" | "==" | "!=";
                        operand: boolean | null;
                    } | any | any | any;
                }>;
            } | {
                not: {
                    key: string;
                    operator: "<" | "<=" | ">=" | ">" | "==" | "!=";
                    operand: number | null;
                } | {
                    key: string;
                    operator: "<" | "<=" | ">=" | ">" | "==" | "!=" | "^=" | "*=" | "$=";
                    operand: string | null;
                } | {
                    key: string;
                    operator: "<" | "<=" | ">=" | ">" | "==" | "!=";
                    operand: boolean | null;
                } | any | any | any;
            }>;
        } | {
            any: autoguard.guards.Array<{
                key: string;
                operator: "<" | "<=" | ">=" | ">" | "==" | "!=";
                operand: number | null;
            } | {
                key: string;
                operator: "<" | "<=" | ">=" | ">" | "==" | "!=" | "^=" | "*=" | "$=";
                operand: string | null;
            } | {
                key: string;
                operator: "<" | "<=" | ">=" | ">" | "==" | "!=";
                operand: boolean | null;
            } | any | any | {
                not: {
                    key: string;
                    operator: "<" | "<=" | ">=" | ">" | "==" | "!=";
                    operand: number | null;
                } | {
                    key: string;
                    operator: "<" | "<=" | ">=" | ">" | "==" | "!=" | "^=" | "*=" | "$=";
                    operand: string | null;
                } | {
                    key: string;
                    operator: "<" | "<=" | ">=" | ">" | "==" | "!=";
                    operand: boolean | null;
                } | any | any | any;
            }>;
        } | {
            not: {
                key: string;
                operator: "<" | "<=" | ">=" | ">" | "==" | "!=";
                operand: number | null;
            } | {
                key: string;
                operator: "<" | "<=" | ">=" | ">" | "==" | "!=" | "^=" | "*=" | "$=";
                operand: string | null;
            } | {
                key: string;
                operator: "<" | "<=" | ">=" | ">" | "==" | "!=";
                operand: boolean | null;
            } | any | any | any;
        }>;
        Sort: autoguard.guards.ReferenceGuard<"ASC" | "DESC">;
        Order: autoguard.guards.ReferenceGuard<{
            keys: autoguard.guards.Array<string>;
            sort: "ASC" | "DESC";
        }>;
    };
    type Guards = {
        [A in keyof typeof Guards]: ReturnType<typeof Guards[A]["as"]>;
    };
    const Requests: {};
    type Requests = {
        [A in keyof typeof Requests]: ReturnType<typeof Requests[A]["as"]>;
    };
    const Responses: {};
    type Responses = {
        [A in keyof typeof Responses]: ReturnType<typeof Responses[A]["as"]>;
    };
}
