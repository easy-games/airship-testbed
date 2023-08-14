"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInferExpression = void 0;
var factory_1 = require("../factory");
function getInferExpression(state, file) {
    var expression = state.inferExpressions.get(file);
    if (expression)
        return expression;
    var identifier = factory_1.f.identifier("inferExpression", file.identifiers.has("inferExpression"));
    state.inferExpressions.set(file, identifier);
    var typeParameter = factory_1.f.identifier("T");
    state.hoistToTop(file, factory_1.f.functionDeclaration(identifier, factory_1.f.block([factory_1.f.returnStatement(factory_1.f.bang("undefined"))]), [factory_1.f.parameterDeclaration("_", factory_1.f.functionType([], factory_1.f.referenceType(typeParameter)))], factory_1.f.referenceType(typeParameter), [factory_1.f.typeParameterDeclaration(typeParameter)]));
    return identifier;
}
exports.getInferExpression = getInferExpression;
//# sourceMappingURL=getInferExpression.js.map