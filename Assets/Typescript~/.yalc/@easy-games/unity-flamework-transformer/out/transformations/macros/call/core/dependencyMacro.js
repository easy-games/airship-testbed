"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DependencyMacro = void 0;
var diagnostics_1 = require("../../../../classes/diagnostics");
var factory_1 = require("../../../../util/factory");
var uid_1 = require("../../../../util/uid");
exports.DependencyMacro = {
    getSymbol: function (state) {
        return state.symbolProvider.flameworkFile.get("Dependency");
    },
    transform: function (state, node) {
        var _a, _b;
        if (factory_1.f.is.file(node.parent.parent)) {
            diagnostics_1.Diagnostics.warning(node, "The Dependency macro should not be used outside of a function as this may introduce race conditions.");
        }
        var importId = state.addFileImport(state.getSourceFile(node), "@easy-games/flamework-core", "Flamework");
        var firstArg = node.arguments[0];
        var firstType = (_a = node.typeArguments) === null || _a === void 0 ? void 0 : _a[0];
        if (firstArg && !firstType) {
            if (!factory_1.f.is.identifier(firstArg))
                diagnostics_1.Diagnostics.error(firstArg, "Expected identifier");
            var symbol = state.getSymbol(firstArg);
            if (!symbol)
                diagnostics_1.Diagnostics.error(firstArg, "Could not find symbol");
            return factory_1.f.as(factory_1.f.call(factory_1.f.field(importId, "resolveDependency"), [(0, uid_1.getNodeUid)(state, firstArg)]), factory_1.f.referenceType(firstArg));
        }
        else if (firstType && !firstArg) {
            if (!factory_1.f.is.referenceType(firstType))
                diagnostics_1.Diagnostics.error(node, "Expected type reference");
            var symbol = state.getSymbol(firstType.typeName);
            if (!symbol)
                diagnostics_1.Diagnostics.error(firstType, "Could not find symbol");
            var declaration = (_b = symbol.declarations) === null || _b === void 0 ? void 0 : _b[0];
            if (!declaration)
                diagnostics_1.Diagnostics.error(firstType, "Could not find declaration");
            return factory_1.f.as(factory_1.f.call(factory_1.f.field(importId, "resolveDependency"), [factory_1.f.string((0, uid_1.getNodeUid)(state, declaration))]), firstType);
        }
        else {
            diagnostics_1.Diagnostics.error(node, "Could not find specifier");
        }
    },
};
//# sourceMappingURL=dependencyMacro.js.map