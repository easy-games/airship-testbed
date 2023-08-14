"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIndexExpression = void 0;
var factory_1 = require("../factory");
/**
 * Gets the expression used to index the AccessExpression.
 * Converts properties to strings.
 */
function getIndexExpression(expression) {
    if (factory_1.f.is.propertyAccessExpression(expression)) {
        return factory_1.f.string(expression.name.text);
    }
    else {
        return expression.argumentExpression;
    }
}
exports.getIndexExpression = getIndexExpression;
//# sourceMappingURL=getIndexExpression.js.map