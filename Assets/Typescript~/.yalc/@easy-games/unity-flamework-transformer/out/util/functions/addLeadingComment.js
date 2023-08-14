"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addLeadingComment = void 0;
var typescript_1 = __importDefault(require("typescript"));
function addLeadingComment(node, text, multiline) {
    if (multiline === void 0) { multiline = false; }
    if (node === undefined)
        return node;
    return typescript_1.default.addSyntheticLeadingComment(node, multiline ? typescript_1.default.SyntaxKind.MultiLineCommentTrivia : typescript_1.default.SyntaxKind.SingleLineCommentTrivia, text, true);
}
exports.addLeadingComment = addLeadingComment;
//# sourceMappingURL=addLeadingComment.js.map