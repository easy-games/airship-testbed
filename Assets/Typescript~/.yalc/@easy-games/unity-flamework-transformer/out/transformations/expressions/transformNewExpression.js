"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformNewExpression = void 0;
var transformUserMacro_1 = require("../transformUserMacro");
function transformNewExpression(state, node) {
    var _a;
    var symbol = state.getSymbol(node.expression);
    if (symbol) {
        if (state.isUserMacro(symbol)) {
            var signature = state.typeChecker.getResolvedSignature(node);
            if (signature) {
                return (_a = (0, transformUserMacro_1.transformUserMacro)(state, node, signature)) !== null && _a !== void 0 ? _a : state.transform(node);
            }
        }
    }
    return state.transform(node);
}
exports.transformNewExpression = transformNewExpression;
//# sourceMappingURL=transformNewExpression.js.map