import * as autoguard from "@joelek/autoguard/dist/lib-shared";
export declare const Object: autoguard.serialization.MessageGuard<Object>;
export type Object = autoguard.guards.Object<{
    "object_id": autoguard.guards.String;
    "optional_boolean": autoguard.guards.Union<[
        autoguard.guards.Boolean,
        autoguard.guards.Null
    ]>;
    "optional_integer": autoguard.guards.Union<[
        autoguard.guards.Integer,
        autoguard.guards.Null
    ]>;
    "optional_string": autoguard.guards.Union<[
        autoguard.guards.String,
        autoguard.guards.Null
    ]>;
}, {}>;
export declare namespace Autoguard {
    const Guards: {
        Object: autoguard.guards.ReferenceGuard<{
            object_id: string;
            optional_boolean: boolean | null;
            optional_integer: number | null;
            optional_string: string | null;
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
