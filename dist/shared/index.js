"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.guards = exports.schema = exports.errors = exports.collators = void 0;
exports.collators = require("./collators");
exports.errors = require("./errors");
exports.schema = require("./schema");
var autoguard_1 = require("@joelek/autoguard");
Object.defineProperty(exports, "guards", { enumerable: true, get: function () { return autoguard_1.guards; } });
