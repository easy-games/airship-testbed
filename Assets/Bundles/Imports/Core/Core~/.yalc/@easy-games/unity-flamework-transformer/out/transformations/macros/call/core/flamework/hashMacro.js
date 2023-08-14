"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlameworkHashMacro = void 0;
var diagnostics_1 = require("../../../../../classes/diagnostics");
var factory_1 = require("../../../../../util/factory");
exports.FlameworkHashMacro = {
    getSymbol: function (state) {
        return state.symbolProvider.flamework.get("hash");
    },
    transform: function (state, node) {
        var firstArg = node.arguments[0];
        var secondArg = node.arguments[1];
        if (!factory_1.f.is.string(firstArg))
            diagnostics_1.Diagnostics.error(firstArg !== null && firstArg !== void 0 ? firstArg : node, "Expected string");
        if (secondArg && !factory_1.f.is.string(secondArg))
            diagnostics_1.Diagnostics.error(secondArg, "Expected string");
        return factory_1.f.string(state.buildInfo.hashString(firstArg.text, secondArg === null || secondArg === void 0 ? void 0 : secondArg.text));
    },
};
//# sourceMappingURL=hashMacro.js.map