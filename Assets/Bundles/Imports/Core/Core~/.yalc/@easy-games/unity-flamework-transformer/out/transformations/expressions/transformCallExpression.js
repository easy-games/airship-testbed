"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformCallExpression = void 0;
var typescript_1 = __importDefault(require("typescript"));
var factory_1 = require("../../util/factory");
var transformNode_1 = require("../transformNode");
var transformUserMacro_1 = require("../transformUserMacro");
function transformCallExpression(state, node) {
    var _a;
    var symbol = state.getSymbol(node.expression);
    if (symbol) {
        if (state.isUserMacro(symbol)) {
            var signature = state.typeChecker.getResolvedSignature(node);
            if (signature) {
                return (_a = (0, transformUserMacro_1.transformUserMacro)(state, node, signature)) !== null && _a !== void 0 ? _a : state.transform(node);
            }
        }
        var macro = state.callMacros.get(symbol);
        if (macro) {
            return macro.transform(state, node, { symbol: symbol, symbols: macro._symbols });
        }
        var valueSymbol = factory_1.f.is.namedDeclaration(symbol.valueDeclaration)
            ? state.getSymbol(symbol.valueDeclaration.name)
            : undefined;
        if (valueSymbol) {
            var macro_1 = state.callMacros.get(valueSymbol);
            if (macro_1) {
                return macro_1.transform(state, node, { symbol: valueSymbol, symbols: macro_1._symbols });
            }
        }
    }
    return typescript_1.default.visitEachChild(node, function (node) { return (0, transformNode_1.transformNode)(state, node); }, state.context);
}
exports.transformCallExpression = transformCallExpression;
//# sourceMappingURL=transformCallExpression.js.map