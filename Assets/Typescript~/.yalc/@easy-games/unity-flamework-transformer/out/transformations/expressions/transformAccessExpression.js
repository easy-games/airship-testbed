"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformAccessExpression = void 0;
var factory_1 = require("../../util/factory");
function transformAccessExpression(state, node) {
    var _a;
    var name = getAccessName(node);
    return (_a = transformNetworkEvent(state, node, name)) !== null && _a !== void 0 ? _a : state.transform(node);
}
exports.transformAccessExpression = transformAccessExpression;
function transformNetworkEvent(state, node, name) {
    var networking = state.symbolProvider.findFile("@easy-games/flamework-networking/events/types");
    if (!networking)
        return;
    if (!name)
        return;
    var type = state.typeChecker.getTypeAtLocation(node.expression);
    if (type.getProperty("_nominal_NetworkingObfuscationMarker") === undefined)
        return;
    return factory_1.f.elementAccessExpression(node.expression, state.obfuscateText(name, "remotes"));
}
function getAccessName(node) {
    if (factory_1.f.is.propertyAccessExpression(node)) {
        return node.name.text;
    }
    else {
        if (factory_1.f.is.string(node.argumentExpression) ||
            factory_1.f.is.identifier(node.argumentExpression)) {
            return node.argumentExpression.text;
        }
    }
}
//# sourceMappingURL=transformAccessExpression.js.map