"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformNode = void 0;
var typescript_1 = __importDefault(require("typescript"));
var transformExpression_1 = require("./transformExpression");
var transformStatement_1 = require("./transformStatement");
function transformNode(state, node) {
    if (typescript_1.default.isExpression(node)) {
        return (0, transformExpression_1.transformExpression)(state, node);
    }
    else if (typescript_1.default.isStatement(node)) {
        return (0, transformStatement_1.transformStatement)(state, node);
    }
    return typescript_1.default.visitEachChild(node, function (newNode) { return transformNode(state, newNode); }, state.context);
}
exports.transformNode = transformNode;
//# sourceMappingURL=transformNode.js.map