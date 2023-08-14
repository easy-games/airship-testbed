"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectType = exports.INIT_NAME = exports.INDEX_NAME = exports.LUA_EXT = exports.D_EXT = exports.TSX_EXT = exports.TS_EXT = exports.PKG_VERSION = exports.PACKAGE_ROOT = void 0;
var path_1 = __importDefault(require("path"));
exports.PACKAGE_ROOT = path_1.default.join(__dirname, "..", "..", "..");
// intentionally not using PACKAGE_ROOT because playground has webpack issues
// eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
exports.PKG_VERSION = require("../../../package.json").version;
exports.TS_EXT = ".ts";
exports.TSX_EXT = ".tsx";
exports.D_EXT = ".d";
exports.LUA_EXT = ".lua";
exports.INDEX_NAME = "index";
exports.INIT_NAME = "init";
var ProjectType;
(function (ProjectType) {
    ProjectType["Game"] = "game";
    ProjectType["Model"] = "model";
    ProjectType["Package"] = "package";
})(ProjectType || (exports.ProjectType = ProjectType = {}));
//# sourceMappingURL=constants.js.map