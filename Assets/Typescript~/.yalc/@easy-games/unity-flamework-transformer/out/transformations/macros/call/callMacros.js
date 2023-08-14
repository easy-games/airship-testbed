"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CALL_MACROS = void 0;
var dependencyMacro_1 = require("./core/dependencyMacro");
var createGuardMacro_1 = require("./core/flamework/createGuardMacro");
var flameworkIdMacro_1 = require("./core/flamework/flameworkIdMacro");
var hashMacro_1 = require("./core/flamework/hashMacro");
var implementsMacro_1 = require("./core/flamework/implementsMacro");
var genericIdMacro_1 = require("./core/genericIdMacro");
var connectMacro_1 = require("./networking/connectMacro");
var createEventMacro_1 = require("./networking/createEventMacro");
exports.CALL_MACROS = new Array(
// @easy-games/flamework-networking
connectMacro_1.NetworkingConnectMacro, createEventMacro_1.NetworkingCreateEventMacro, 
// @easy-games/flamework-core
genericIdMacro_1.GenericIdMacro, dependencyMacro_1.DependencyMacro, flameworkIdMacro_1.FlameworkIdMacro, hashMacro_1.FlameworkHashMacro, 
// FlameworkAddPathsMacro,
implementsMacro_1.FlameworkImplementsMacro, createGuardMacro_1.FlameworkCreateGuardMacro);
//# sourceMappingURL=callMacros.js.map