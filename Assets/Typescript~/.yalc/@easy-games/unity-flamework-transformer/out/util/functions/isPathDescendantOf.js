"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isPathDescendantOfAny = exports.isPathDescendantOf = void 0;
var path_1 = __importDefault(require("path"));
/**
 * Checks if the `filePath` path is a descendant of the `dirPath` path.
 * @param filePath A path to a file.
 * @param dirPath A path to a directory.
 */
function isPathDescendantOf(filePath, dirPath) {
    return dirPath === filePath || !path_1.default.relative(dirPath, filePath).startsWith("..");
}
exports.isPathDescendantOf = isPathDescendantOf;
/**
 * Checks if the `filePath` is a descendant of any of the specified `dirPaths` paths.
 * @param filePath A path to a file.
 * @param dirPaths The directories to check.
 */
function isPathDescendantOfAny(filePath, dirPaths) {
    return dirPaths.some(function (dirPath) { return isPathDescendantOf(filePath, dirPath); });
}
exports.isPathDescendantOfAny = isPathDescendantOfAny;
//# sourceMappingURL=isPathDescendantOf.js.map