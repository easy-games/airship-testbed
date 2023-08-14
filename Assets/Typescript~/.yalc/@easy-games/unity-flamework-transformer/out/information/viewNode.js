"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.viewNode = void 0;
var typescript_1 = __importDefault(require("typescript"));
var viewExpression_1 = require("./viewExpression");
var viewStatement_1 = require("./viewStatement");
function viewNode(state, node) {
    if (typescript_1.default.isExpression(node)) {
        (0, viewExpression_1.viewExpression)(state, node);
    }
    else if (typescript_1.default.isStatement(node)) {
        (0, viewStatement_1.viewStatement)(state, node);
    }
}
exports.viewNode = viewNode;
//# sourceMappingURL=viewNode.js.map