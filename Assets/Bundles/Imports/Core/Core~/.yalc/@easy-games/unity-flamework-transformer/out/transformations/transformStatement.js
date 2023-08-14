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
exports.transformStatement = void 0;
var typescript_1 = __importDefault(require("typescript"));
var diagnosticsUtils_1 = require("../util/diagnosticsUtils");
var getNodeList_1 = require("../util/functions/getNodeList");
var transformClassDeclaration_1 = require("./statements/transformClassDeclaration");
var transformNode_1 = require("./transformNode");
// eslint-disable-next-line @typescript-eslint/no-explicit-any
var TRANSFORMERS = new Map([
    [typescript_1.default.SyntaxKind.ClassDeclaration, transformClassDeclaration_1.transformClassDeclaration],
]);
function transformStatement(state, statement) {
    return (0, diagnosticsUtils_1.catchDiagnostic)(statement, function () {
        var _a = __read(state.capture(function () {
            var transformer = TRANSFORMERS.get(statement.kind);
            if (transformer) {
                return transformer(state, statement);
            }
            return typescript_1.default.visitEachChild(statement, function (newNode) { return (0, transformNode_1.transformNode)(state, newNode); }, state.context);
        }), 2), node = _a[0], prereqs = _a[1];
        return __spreadArray(__spreadArray([], __read(prereqs), false), __read((0, getNodeList_1.getNodeList)(node)), false);
    });
}
exports.transformStatement = transformStatement;
//# sourceMappingURL=transformStatement.js.map