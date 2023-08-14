"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPackageJson = void 0;
var typescript_1 = __importDefault(require("typescript"));
var path_1 = __importDefault(require("path"));
var normalize_package_data_1 = __importDefault(require("normalize-package-data"));
var isPathDescendantOf_1 = require("./isPathDescendantOf");
var cache_1 = require("../cache");
/**
 * Looks recursively at ancestors until a package.json is found
 * @param directory The directory to start under.
 */
function getPackageJson(directory) {
    var existing = cache_1.Cache.pkgJsonCache.get(path_1.default.normalize(directory));
    if (existing)
        return existing;
    var result = getPackageJsonInner(directory);
    cache_1.Cache.pkgJsonCache.set(path_1.default.normalize(directory), result);
    typescript_1.default.forEachAncestorDirectory(directory, function (dir) {
        if ((0, isPathDescendantOf_1.isPathDescendantOf)(dir, result.directory)) {
            cache_1.Cache.pkgJsonCache.set(path_1.default.normalize(dir), result);
        }
        else {
            return true;
        }
    });
    return result;
}
exports.getPackageJson = getPackageJson;
function getPackageJsonInner(directory) {
    var packageJsonPath = typescript_1.default.findPackageJson(directory, typescript_1.default.sys);
    if (!packageJsonPath)
        throw new Error("package.json not found in ".concat(directory));
    var text = packageJsonPath ? typescript_1.default.sys.readFile(packageJsonPath) : undefined;
    var packageJson = text ? JSON.parse(text) : {};
    (0, normalize_package_data_1.default)(packageJson);
    return {
        directory: path_1.default.dirname(packageJsonPath),
        path: packageJsonPath,
        result: packageJson,
    };
}
//# sourceMappingURL=getPackageJson.js.map