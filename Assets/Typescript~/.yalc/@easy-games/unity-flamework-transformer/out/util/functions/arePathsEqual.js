"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.arePathsEqual = void 0;
var path_1 = __importDefault(require("path"));
function arePathsEqual(path1, path2) {
    if (process.platform === "win32") {
        path1 = path1.toLowerCase();
        path2 = path2.toLowerCase();
    }
    return path_1.default.normalize(path1) === path_1.default.normalize(path2);
}
exports.arePathsEqual = arePathsEqual;
//# sourceMappingURL=arePathsEqual.js.map