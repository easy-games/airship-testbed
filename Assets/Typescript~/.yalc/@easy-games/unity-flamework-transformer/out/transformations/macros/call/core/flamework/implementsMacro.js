"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlameworkImplementsMacro = void 0;
var diagnostics_1 = require("../../../../../classes/diagnostics");
var factory_1 = require("../../../../../util/factory");
var uid_1 = require("../../../../../util/uid");
exports.FlameworkImplementsMacro = {
    getSymbol: function (state) {
        return state.symbolProvider.flamework.get("implements");
    },
    transform: function (state, node) {
        var _a;
        var firstType = (_a = node.typeArguments) === null || _a === void 0 ? void 0 : _a[0];
        if (!factory_1.f.is.referenceType(firstType))
            diagnostics_1.Diagnostics.error(firstType !== null && firstType !== void 0 ? firstType : node, "Invalid type argument");
        var importId = state.addFileImport(state.getSourceFile(node), "@easy-games/flamework-core", "Flamework");
        return factory_1.f.call(factory_1.f.field(importId, "_implements"), [node.arguments[0], (0, uid_1.getNodeUid)(state, firstType)], node.typeArguments ? __spreadArray([], __read(node.typeArguments), false) : []);
    },
};
//# sourceMappingURL=implementsMacro.js.map