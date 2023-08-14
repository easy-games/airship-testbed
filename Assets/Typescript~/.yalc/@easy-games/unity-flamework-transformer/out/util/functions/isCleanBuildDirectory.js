"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isCleanBuildDirectory = void 0;
var fs_1 = __importDefault(require("fs"));
function isCleanBuildDirectory(compilerOptions) {
    if (compilerOptions.incremental && compilerOptions.tsBuildInfoFile) {
        return !fs_1.default.existsSync(compilerOptions.tsBuildInfoFile);
    }
    return true;
}
exports.isCleanBuildDirectory = isCleanBuildDirectory;
//# sourceMappingURL=isCleanBuildDirectory.js.map