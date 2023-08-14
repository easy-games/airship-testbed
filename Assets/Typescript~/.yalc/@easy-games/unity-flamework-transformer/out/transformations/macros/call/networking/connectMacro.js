"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NetworkingConnectMacro = void 0;
var diagnostics_1 = require("../../../../classes/diagnostics");
var diagnosticsUtils_1 = require("../../../../util/diagnosticsUtils");
var factory_1 = require("../../../../util/factory");
var buildGuardFromType_1 = require("../../../../util/functions/buildGuardFromType");
exports.NetworkingConnectMacro = {
    getSymbol: function (state) {
        var symbols = state.symbolProvider;
        var networking = symbols.findFile("@easy-games/flamework-networking/events/types");
        if (!networking)
            return [];
        return [
            networking.getType("ServerReceiver").get("connect"),
            networking.getType("ClientReceiver").get("connect"),
        ];
    },
    transform: function (state, node, macro) {
        var cb = node.arguments[0];
        var customGuards = node.arguments[1];
        if (!factory_1.f.is.functionExpression(cb))
            return state.transform(node);
        if (customGuards !== undefined && !factory_1.f.is.array(customGuards))
            diagnostics_1.Diagnostics.error(customGuards, "Expected array or undefined");
        if (!cb.parameters.some(function (x) { return x.type !== undefined; })) {
            return state.transform(node);
        }
        var undefinedId = factory_1.f.identifier("undefined");
        var generatedGuards = new Array();
        for (var i = 0, index = 0; i < cb.parameters.length; index = ++i) {
            if (macro.symbol === macro.symbols[0]) {
                if (i === 0)
                    continue;
                index = i - 1;
            }
            var param = cb.parameters[i];
            var customElement = customGuards === null || customGuards === void 0 ? void 0 : customGuards.elements[index];
            var isUndefinedElement = factory_1.f.is.omitted(customElement) || (factory_1.f.is.identifier(customElement) && customElement.text === "undefined");
            if (customElement && !isUndefinedElement) {
                generatedGuards[index] = customElement;
            }
            else if (param.type) {
                var tId = state.addFileImport(node.getSourceFile(), "@rbxts/t", "t");
                var type = state.typeChecker.getTypeAtLocation(param);
                var guard = (0, diagnosticsUtils_1.relocateDiagnostic)(param.type, buildGuardFromType_1.buildGuardFromType, state, state.getSourceFile(node), type);
                generatedGuards[index] = factory_1.f.as(guard, factory_1.f.referenceType(factory_1.f.qualifiedNameType(tId, "check"), [param.type]), true);
            }
            else {
                generatedGuards[index] = undefinedId;
            }
        }
        for (var i = generatedGuards.length - 1; i >= 0; i--) {
            if (generatedGuards[i] !== undefinedId) {
                break;
            }
            generatedGuards.pop();
        }
        return factory_1.f.update.call(node, state.transformNode(node.expression), [state.transform(cb), generatedGuards]);
    },
};
//# sourceMappingURL=connectMacro.js.map