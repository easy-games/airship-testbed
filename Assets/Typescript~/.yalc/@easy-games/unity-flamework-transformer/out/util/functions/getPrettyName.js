"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPrettyName = void 0;
var factory_1 = require("../factory");
function getPrettyName(state, node, fallback, prefix) {
    if (prefix === void 0) { prefix = "_"; }
    if (!node)
        return "".concat(prefix).concat(fallback);
    return "".concat(prefix).concat(getPrettyNameInner(state, node, fallback));
}
exports.getPrettyName = getPrettyName;
function getPrettyNameInner(state, node, fallback) {
    if (factory_1.f.is.referenceType(node)) {
        var symbol = state.getSymbol(node.typeName);
        if (symbol) {
            return camelCase(symbol.name);
        }
    }
    else if (factory_1.f.is.identifier(node)) {
        return camelCase(node.text);
    }
    return fallback;
}
function camelCase(name) {
    return name.substr(0, 1).toLowerCase() + name.substr(1);
}
//# sourceMappingURL=getPrettyName.js.map