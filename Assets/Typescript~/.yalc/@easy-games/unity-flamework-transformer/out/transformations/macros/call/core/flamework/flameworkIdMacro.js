"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlameworkIdMacro = void 0;
var diagnostics_1 = require("../../../../../classes/diagnostics");
var factory_1 = require("../../../../../util/factory");
var uid_1 = require("../../../../../util/uid");
exports.FlameworkIdMacro = {
    getSymbol: function (state) {
        return state.symbolProvider.flamework.get("id");
    },
    transform: function (state, node) {
        var _a;
        var typeArgument = (_a = node.typeArguments) === null || _a === void 0 ? void 0 : _a[0];
        if (!typeArgument)
            diagnostics_1.Diagnostics.error(node, "Expected type argument");
        return factory_1.f.string((0, uid_1.getNodeUid)(state, typeArgument));
    },
};
//# sourceMappingURL=flameworkIdMacro.js.map