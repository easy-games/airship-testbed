"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.viewStatement = void 0;
var typescript_1 = __importDefault(require("typescript"));
var viewClassDeclaration_1 = require("./statements/viewClassDeclaration");
// eslint-disable-next-line @typescript-eslint/no-explicit-any
var VIEWERS = new Map([
    [typescript_1.default.SyntaxKind.ClassDeclaration, viewClassDeclaration_1.viewClassDeclaration],
]);
function viewStatement(state, expression) {
    // do stuff
    var viewer = VIEWERS.get(expression.kind);
    if (viewer) {
        viewer(state, expression);
    }
}
exports.viewStatement = viewStatement;
//# sourceMappingURL=viewStatement.js.map