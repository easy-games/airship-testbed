"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformExpression = void 0;
var typescript_1 = __importDefault(require("typescript"));
var diagnosticsUtils_1 = require("../util/diagnosticsUtils");
var transformAccessExpression_1 = require("./expressions/transformAccessExpression");
var transformBinaryExpression_1 = require("./expressions/transformBinaryExpression");
var transformCallExpression_1 = require("./expressions/transformCallExpression");
var transformNewExpression_1 = require("./expressions/transformNewExpression");
var transformUnaryExpression_1 = require("./expressions/transformUnaryExpression");
var transformNode_1 = require("./transformNode");
// eslint-disable-next-line @typescript-eslint/no-explicit-any
var TRANSFORMERS = new Map([
    [typescript_1.default.SyntaxKind.CallExpression, transformCallExpression_1.transformCallExpression],
    [typescript_1.default.SyntaxKind.NewExpression, transformNewExpression_1.transformNewExpression],
    [typescript_1.default.SyntaxKind.PrefixUnaryExpression, transformUnaryExpression_1.transformUnaryExpression],
    [typescript_1.default.SyntaxKind.PostfixUnaryExpression, transformUnaryExpression_1.transformUnaryExpression],
    [typescript_1.default.SyntaxKind.BinaryExpression, transformBinaryExpression_1.transformBinaryExpression],
    [typescript_1.default.SyntaxKind.ElementAccessExpression, transformAccessExpression_1.transformAccessExpression],
    [typescript_1.default.SyntaxKind.PropertyAccessExpression, transformAccessExpression_1.transformAccessExpression],
]);
function transformExpression(state, expression) {
    return (0, diagnosticsUtils_1.catchDiagnostic)(expression, function () {
        var transformer = TRANSFORMERS.get(expression.kind);
        if (transformer) {
            return transformer(state, expression);
        }
        return typescript_1.default.visitEachChild(expression, function (newNode) { return (0, transformNode_1.transformNode)(state, newNode); }, state.context);
    });
}
exports.transformExpression = transformExpression;
//# sourceMappingURL=transformExpression.js.map