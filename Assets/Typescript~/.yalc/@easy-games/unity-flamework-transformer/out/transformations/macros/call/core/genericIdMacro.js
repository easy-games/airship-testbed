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
exports.GenericIdMacro = void 0;
var diagnostics_1 = require("../../../../classes/diagnostics");
var factory_1 = require("../../../../util/factory");
var assert_1 = require("../../../../util/functions/assert");
var getGenericIdMap_1 = require("../../../../util/functions/getGenericIdMap");
var uid_1 = require("../../../../util/uid");
function formatOrdinal(num) {
    var _a;
    return (_a = ["1st", "2nd", "3rd"][num - 1]) !== null && _a !== void 0 ? _a : "".concat(num, "th");
}
exports.GenericIdMacro = {
    getSymbol: function (state) {
        return __spreadArray([], __read((0, getGenericIdMap_1.getGenericIdMap)(state).keys()), false);
    },
    transform: function (state, node, _a) {
        var _b;
        var symbol = _a.symbol;
        var genericInfo = (0, getGenericIdMap_1.getGenericIdMap)(state).get(symbol);
        (0, assert_1.assert)(genericInfo);
        var argument = node.arguments[genericInfo.index];
        if (!((_b = node.typeArguments) === null || _b === void 0 ? void 0 : _b[0])) {
            if (!genericInfo.optional && !argument) {
                diagnostics_1.Diagnostics.error(node.expression, "This macro requires you to specify a type argument.", "You can also specify the ID (".concat(formatOrdinal(genericInfo.index + 1), " parameter)"));
            }
        }
        else if (!argument) {
            var id = (0, uid_1.getNodeUid)(state, node.typeArguments[0]);
            var parameters = new Array();
            for (var i = 0; i < genericInfo.index; i++) {
                parameters.push(node.arguments[i] ? state.transformNode(node.arguments[i]) : factory_1.f.nil());
            }
            parameters.push(factory_1.f.string(id));
            return factory_1.f.update.call(node, state.transformNode(node.expression), parameters);
        }
        return state.transform(node);
    },
};
//# sourceMappingURL=genericIdMacro.js.map