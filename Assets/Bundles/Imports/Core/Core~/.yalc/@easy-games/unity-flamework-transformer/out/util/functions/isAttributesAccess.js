"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAttributesAccess = void 0;
var factory_1 = require("../factory");
/**
 * Checks if an expression is attempting to access component attributes.
 * E.g `this.attributes.myProp`
 */
function isAttributesAccess(state, expression) {
    if (!factory_1.f.is.accessExpression(expression))
        return false;
    if (!state.symbolProvider.componentsFile)
        return false;
    var baseComponent = state.symbolProvider.componentsFile.get("BaseComponent");
    var lhs = state.getSymbol(expression.expression);
    if (lhs &&
        lhs.name === "attributes" &&
        state.getSourceFile(expression) !== state.symbolProvider.componentsFile.file &&
        lhs.parent === baseComponent) {
        return true;
    }
    return false;
}
exports.isAttributesAccess = isAttributesAccess;
//# sourceMappingURL=isAttributesAccess.js.map