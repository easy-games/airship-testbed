"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDeclarationOfType = void 0;
function getDeclarationOfType(type) {
    var _a, _b;
    return (_b = (_a = type.symbol) === null || _a === void 0 ? void 0 : _a.declarations) === null || _b === void 0 ? void 0 : _b[0];
}
exports.getDeclarationOfType = getDeclarationOfType;
//# sourceMappingURL=getDeclarationOfType.js.map