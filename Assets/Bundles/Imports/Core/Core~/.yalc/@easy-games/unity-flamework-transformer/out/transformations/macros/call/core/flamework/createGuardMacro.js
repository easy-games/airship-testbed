"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlameworkCreateGuardMacro = void 0;
var diagnostics_1 = require("../../../../../classes/diagnostics");
var diagnosticsUtils_1 = require("../../../../../util/diagnosticsUtils");
var factory_1 = require("../../../../../util/factory");
var buildGuardFromType_1 = require("../../../../../util/functions/buildGuardFromType");
exports.FlameworkCreateGuardMacro = {
    getSymbol: function (state) {
        return state.symbolProvider.flamework.get("createGuard");
    },
    transform: function (state, node) {
        var _a;
        var firstType = (_a = node.typeArguments) === null || _a === void 0 ? void 0 : _a[0];
        if (!firstType)
            diagnostics_1.Diagnostics.error(node, "Expected type argument");
        var tId = state.addFileImport(node.getSourceFile(), "@rbxts/t", "t");
        var type = state.typeChecker.getTypeAtLocation(firstType);
        var guard = (0, diagnosticsUtils_1.relocateDiagnostic)(node, buildGuardFromType_1.buildGuardFromType, state, state.getSourceFile(node), type);
        return factory_1.f.as(guard, factory_1.f.referenceType(factory_1.f.qualifiedNameType(tId, "check"), [firstType]), true);
    },
};
//# sourceMappingURL=createGuardMacro.js.map