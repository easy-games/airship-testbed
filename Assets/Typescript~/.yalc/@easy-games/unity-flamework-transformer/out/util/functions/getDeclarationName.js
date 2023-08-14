"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDeclarationName = void 0;
var typescript_1 = __importDefault(require("typescript"));
var factory_1 = require("../factory");
/**
 * Calculates a name, including all named ancestors, such as Enum.Material.Air
 * @param node The node to retrieve the name of
 */
function getDeclarationName(node) {
    if (!factory_1.f.is.identifier(node.name))
        return "$p:error";
    var name = node.name.text;
    for (var parent_1 = node.parent; parent_1 !== undefined; parent_1 = parent_1.parent) {
        if (typescript_1.default.isNamedDeclaration(parent_1)) {
            name = parent_1.name.getText() + "." + name;
        }
    }
    return name;
}
exports.getDeclarationName = getDeclarationName;
//# sourceMappingURL=getDeclarationName.js.map