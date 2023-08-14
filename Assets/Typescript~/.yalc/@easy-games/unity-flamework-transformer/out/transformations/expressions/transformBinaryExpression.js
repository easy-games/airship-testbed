"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformBinaryExpression = void 0;
var typescript_1 = __importDefault(require("typescript"));
var diagnostics_1 = require("../../classes/diagnostics");
var factory_1 = require("../../util/factory");
var getIndexExpression_1 = require("../../util/functions/getIndexExpression");
var isAttributesAccess_1 = require("../../util/functions/isAttributesAccess");
var MUTATING_OPERATORS = new Map([
    [typescript_1.default.SyntaxKind.EqualsToken, typescript_1.default.SyntaxKind.EqualsToken],
    [typescript_1.default.SyntaxKind.BarEqualsToken, typescript_1.default.SyntaxKind.BarToken],
    [typescript_1.default.SyntaxKind.PlusEqualsToken, typescript_1.default.SyntaxKind.PlusToken],
    [typescript_1.default.SyntaxKind.MinusEqualsToken, typescript_1.default.SyntaxKind.MinusToken],
    [typescript_1.default.SyntaxKind.CaretEqualsToken, typescript_1.default.SyntaxKind.CaretToken],
    [typescript_1.default.SyntaxKind.SlashEqualsToken, typescript_1.default.SyntaxKind.SlashToken],
    [typescript_1.default.SyntaxKind.BarBarEqualsToken, typescript_1.default.SyntaxKind.BarBarToken],
    [typescript_1.default.SyntaxKind.PercentEqualsToken, typescript_1.default.SyntaxKind.PercentToken],
    [typescript_1.default.SyntaxKind.AsteriskEqualsToken, typescript_1.default.SyntaxKind.AsteriskToken],
    [typescript_1.default.SyntaxKind.AmpersandEqualsToken, typescript_1.default.SyntaxKind.AmpersandToken],
    [typescript_1.default.SyntaxKind.QuestionQuestionEqualsToken, typescript_1.default.SyntaxKind.QuestionQuestionToken],
    [typescript_1.default.SyntaxKind.AsteriskAsteriskEqualsToken, typescript_1.default.SyntaxKind.AsteriskAsteriskToken],
    [typescript_1.default.SyntaxKind.LessThanLessThanEqualsToken, typescript_1.default.SyntaxKind.LessThanLessThanToken],
    [typescript_1.default.SyntaxKind.AmpersandAmpersandEqualsToken, typescript_1.default.SyntaxKind.AmpersandAmpersandToken],
    [typescript_1.default.SyntaxKind.GreaterThanGreaterThanEqualsToken, typescript_1.default.SyntaxKind.GreaterThanGreaterThanToken],
    [typescript_1.default.SyntaxKind.GreaterThanGreaterThanGreaterThanEqualsToken, typescript_1.default.SyntaxKind.GreaterThanGreaterThanGreaterThanToken],
]);
function transformBinaryExpression(state, node) {
    var nonAssignmentOperator = MUTATING_OPERATORS.get(node.operatorToken.kind);
    if (nonAssignmentOperator) {
        if ((0, isAttributesAccess_1.isAttributesAccess)(state, node.left)) {
            var name_1 = (0, getIndexExpression_1.getIndexExpression)(node.left);
            if (!name_1)
                diagnostics_1.Diagnostics.error(node.left, "could not get index expression");
            if (!factory_1.f.is.accessExpression(node.left.expression))
                diagnostics_1.Diagnostics.error(node.left, "assignments not supported with direct access");
            var thisAccess = node.left.expression.expression;
            var valueExpr = nonAssignmentOperator === typescript_1.default.SyntaxKind.EqualsToken
                ? node.right
                : factory_1.f.binary(node.left, nonAssignmentOperator, node.right);
            return factory_1.f.call(factory_1.f.field(thisAccess, "setAttribute"), [name_1, valueExpr]);
        }
    }
    return state.transform(node);
}
exports.transformBinaryExpression = transformBinaryExpression;
//# sourceMappingURL=transformBinaryExpression.js.map