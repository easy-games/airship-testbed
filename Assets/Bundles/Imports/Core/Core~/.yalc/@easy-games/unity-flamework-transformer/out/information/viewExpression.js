"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.viewExpression = void 0;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
var VIEWERS = new Map([
// [ts.SyntaxKind.IfStatement, transformIfStatement],
]);
function viewExpression(state, expression) {
    // do stuff
    var viewer = VIEWERS.get(expression.kind);
    if (viewer) {
        viewer(state, expression);
    }
}
exports.viewExpression = viewExpression;
//# sourceMappingURL=viewExpression.js.map