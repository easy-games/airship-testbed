"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformUnaryExpression = void 0;
var typescript_1 = __importDefault(require("typescript"));
var diagnostics_1 = require("../../classes/diagnostics");
var factory_1 = require("../../util/factory");
var getIndexExpression_1 = require("../../util/functions/getIndexExpression");
var isAttributesAccess_1 = require("../../util/functions/isAttributesAccess");
var MUTATING_OPERATORS = new Map([
    [typescript_1.default.SyntaxKind.PlusPlusToken, typescript_1.default.SyntaxKind.PlusToken],
    [typescript_1.default.SyntaxKind.MinusMinusToken, typescript_1.default.SyntaxKind.MinusToken],
]);
function transformUnaryExpression(state, node) {
    var nonAssignmentOperator = MUTATING_OPERATORS.get(node.operator);
    if (nonAssignmentOperator) {
        if ((0, isAttributesAccess_1.isAttributesAccess)(state, node.operand)) {
            var name_1 = (0, getIndexExpression_1.getIndexExpression)(node.operand);
            if (!name_1)
                diagnostics_1.Diagnostics.error(node.operand, "could not get index expression");
            if (!factory_1.f.is.accessExpression(node.operand.expression))
                diagnostics_1.Diagnostics.error(node.operand, "assignments not supported with direct access");
            var thisAccess = node.operand.expression.expression;
            var args = [name_1, factory_1.f.binary(node.operand, nonAssignmentOperator, 1)];
            return factory_1.f.call(factory_1.f.field(thisAccess, "setAttribute"), factory_1.f.is.postfixUnary(node) ? __spreadArray(__spreadArray([], __read(args), false), [true], false) : args);
        }
    }
    return state.transform(node);
}
exports.transformUnaryExpression = transformUnaryExpression;
//# sourceMappingURL=transformUnaryExpression.js.map