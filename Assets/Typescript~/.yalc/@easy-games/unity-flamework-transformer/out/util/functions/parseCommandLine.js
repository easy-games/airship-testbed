"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseCommandLine = void 0;
var typescript_1 = __importDefault(require("typescript"));
var path_1 = __importDefault(require("path"));
var fs_1 = __importDefault(require("fs"));
function findTsConfigPath(projectPath) {
    var tsConfigPath = path_1.default.resolve(projectPath);
    if (!fs_1.default.existsSync(tsConfigPath) || !fs_1.default.statSync(tsConfigPath).isFile()) {
        tsConfigPath = typescript_1.default.findConfigFile(tsConfigPath, typescript_1.default.sys.fileExists);
        if (tsConfigPath === undefined) {
            throw new Error("Unable to find tsconfig.json!");
        }
    }
    return path_1.default.resolve(process.cwd(), tsConfigPath);
}
function parseCommandLine() {
    var options = {};
    var projectIndex = process.argv.findIndex(function (x) { return x === "-p" || x === "--project"; });
    if (projectIndex !== -1) {
        options.tsconfigPath = findTsConfigPath(process.argv[projectIndex + 1]);
    }
    else {
        options.tsconfigPath = findTsConfigPath(".");
    }
    options.project = path_1.default.dirname(options.tsconfigPath);
    return options;
}
exports.parseCommandLine = parseCommandLine;
//# sourceMappingURL=parseCommandLine.js.map