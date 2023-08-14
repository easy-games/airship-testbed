"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPathTranslator = void 0;
var path_1 = __importDefault(require("path"));
var pathTranslator_1 = require("../../classes/pathTranslator");
function findAncestorDir(dirs) {
    dirs = dirs.map(path_1.default.normalize).map(function (v) { return (v.endsWith(path_1.default.sep) ? v : v + path_1.default.sep); });
    var currentDir = dirs[0];
    while (!dirs.every(function (v) { return v.startsWith(currentDir); })) {
        currentDir = path_1.default.join(currentDir, "..");
    }
    return currentDir;
}
function getRootDirs(compilerOptions) {
    if (compilerOptions.rootDir !== undefined) {
        return [compilerOptions.rootDir];
    }
    else if (compilerOptions.rootDirs !== undefined) {
        return compilerOptions.rootDirs;
    }
    var rootDirs = [
        path_1.default.join(compilerOptions.baseUrl, "Server"),
        path_1.default.join(compilerOptions.baseUrl, "Client"),
        path_1.default.join(compilerOptions.baseUrl, "Shared"),
    ];
    return rootDirs;
    // const rootDirs = compilerOptions.rootDir ? [compilerOptions.rootDir] : compilerOptions.rootDirs;
    // if (!rootDirs) assert(false, "rootDir or rootDirs must be specified");
    // return rootDirs;
}
function createPathTranslator(program) {
    var compilerOptions = program.getCompilerOptions();
    var rootDir = findAncestorDir(__spreadArray([program.getCommonSourceDirectory()], __read(getRootDirs(compilerOptions)), false));
    var outDir = compilerOptions.outDir;
    return new pathTranslator_1.PathTranslator(rootDir, outDir, undefined, compilerOptions.declaration || false);
}
exports.createPathTranslator = createPathTranslator;
//# sourceMappingURL=createPathTranslator.js.map