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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNodeUid = exports.getTypeUid = exports.getSymbolUid = exports.getDeclarationUid = exports.getInternalId = void 0;
var path_1 = __importDefault(require("path"));
var typescript_1 = __importDefault(require("typescript"));
var diagnostics_1 = require("../classes/diagnostics");
var logger_1 = require("../classes/logger");
var factory_1 = require("./factory");
var getDeclarationName_1 = require("./functions/getDeclarationName");
var getPackageJson_1 = require("./functions/getPackageJson");
var isDefinedType_1 = require("./functions/isDefinedType");
var isPathDescendantOf_1 = require("./functions/isPathDescendantOf");
/**
 * Format the internal id to be shorter, remove `out` part of path, and use hashPrefix.
 */
function formatInternalid(state, internalId, hashPrefix) {
    if (hashPrefix === void 0) { hashPrefix = state.config.hashPrefix; }
    var match = new RegExp("^.*:(.*)@(.+)$").exec(internalId);
    if (!match)
        return internalId;
    var _a = __read(match, 3), path = _a[1], name = _a[2];
    var revisedPath = path.replace(/^(.*?)[\/\\]/, "");
    return hashPrefix ? "".concat(hashPrefix, ":").concat(revisedPath, "@").concat(name) : "".concat(revisedPath, "@").concat(name);
}
/**
 * Gets the short ID for a node and includes the hash for uniqueness.
 */
function getShortId(state, node, hashPrefix) {
    if (hashPrefix === void 0) { hashPrefix = state.config.hashPrefix; }
    var hash = state.hash(state.buildInfo.getLatestId(), true);
    var fullName = (0, getDeclarationName_1.getDeclarationName)(node);
    var fileName = path_1.default.parse(node.getSourceFile().fileName).name;
    var luaFileName = fileName === "index" ? "init" : fileName;
    var isShort = state.config.idGenerationMode === "short";
    var shortId = "".concat(isShort ? luaFileName + "@" : "").concat(fullName, "{").concat(hash, "}");
    return hashPrefix ? "".concat(state.config.hashPrefix, ":").concat(shortId) : shortId;
}
function getInternalId(state, node) {
    var filePath = state.getSourceFile(node).fileName;
    var fullName = (0, getDeclarationName_1.getDeclarationName)(node);
    var packageDirectory;
    var packageName;
    var isPackage = false;
    if (filePath.includes("Types~" + path_1.default.sep)) {
        // Example:
        // /Users/luke/easy-unity/bedwars-airship/Assets/Bundles/Types~/ExamplePackage/Server/ExampleService.d.ts
        var split = filePath.split("Types~" + path_1.default.sep);
        packageName = split[1].split(path_1.default.sep)[0];
        var rightSideSplit = filePath.split("Types~" + path_1.default.sep + packageName);
        packageDirectory = filePath.replace(rightSideSplit[1], "");
        isPackage = true;
    }
    else if (filePath.includes(path_1.default.join("Assets", "Bundles", "Imports"))) {
        var left = filePath.split("~")[0];
        var split = left.split(path_1.default.sep);
        packageName = split[split.length - 1];
        packageDirectory = filePath.split(path_1.default.join("Assets", "Bundles"))[1];
        logger_1.Logger.writeLine("filePath=" + filePath + ", packageName=" + packageName);
        isPackage = true;
    }
    else {
        var _a = (0, getPackageJson_1.getPackageJson)(path_1.default.dirname(filePath)), directory = _a.directory, result = _a.result;
        packageDirectory = directory;
        packageName = result.name;
        isPackage = false;
    }
    if ((0, isPathDescendantOf_1.isPathDescendantOfAny)(filePath, state.rootDirs)) {
        logger_1.Logger.writeLine("1");
        var outputPath = state.pathTranslator.getOutputPath(filePath).replace(/(\.lua)$/, "");
        var relativePath_1 = path_1.default.relative(state.currentDirectory, outputPath);
        relativePath_1 = relativePath_1.replace(".." + path_1.default.sep, "");
        var internalId_1 = "".concat(packageName, ":").concat(relativePath_1.replace(/\\/g, "/"), "@").concat(fullName);
        return {
            isPackage: isPackage,
            internalId: internalId_1,
        };
    }
    logger_1.Logger.writeLine("2");
    var relativePath = path_1.default.relative(packageDirectory, filePath.replace(/(\.d)?.ts$/, "").replace(/index$/, "init"));
    var internalId = "".concat(packageName, ":").concat(relativePath.replace(/\\/g, "/"), "@").concat(fullName);
    return {
        isPackage: true,
        internalId: internalId,
    };
}
exports.getInternalId = getInternalId;
function getDeclarationUid(state, node) {
    var _a = getInternalId(state, node), isPackage = _a.isPackage, internalId = _a.internalId;
    var id = state.buildInfo.getIdentifierFromInternal(internalId);
    if (id)
        return id;
    // this is a package, and the package itself did not generate an id
    // use the internal ID to prevent breakage between packages and games.
    if (isPackage) {
        var buildInfo = state.buildInfo.getBuildInfoFromFile(state.getSourceFile(node).fileName);
        if (buildInfo) {
            var prefix = buildInfo.getIdentifierPrefix();
            if (prefix) {
                return formatInternalid(state, internalId, prefix);
            }
        }
        return internalId;
    }
    var newId;
    if (state.config.idGenerationMode === "obfuscated") {
        newId = state.hash(state.buildInfo.getLatestId());
    }
    else if (state.config.idGenerationMode === "short" || state.config.idGenerationMode === "tiny") {
        newId = getShortId(state, node);
    }
    else {
        newId = formatInternalid(state, internalId);
    }
    state.buildInfo.addIdentifier(internalId, newId);
    return newId;
}
exports.getDeclarationUid = getDeclarationUid;
function getSymbolUid(state, symbol, trace) {
    var _a;
    if (symbol.valueDeclaration) {
        return getDeclarationUid(state, symbol.valueDeclaration);
    }
    else if ((_a = symbol.declarations) === null || _a === void 0 ? void 0 : _a[0]) {
        return getDeclarationUid(state, symbol.declarations[0]);
    }
    else if (trace) {
        diagnostics_1.Diagnostics.error(trace, "Could not find UID for symbol \"".concat(symbol.name, "\""));
    }
}
exports.getSymbolUid = getSymbolUid;
function getTypeUid(state, type, trace) {
    if (type.symbol) {
        return getSymbolUid(state, type.symbol, trace);
    }
    else if ((0, isDefinedType_1.isDefinedType)(type)) {
        return "$p:defined";
    }
    else if (type.flags & typescript_1.default.TypeFlags.Intrinsic) {
        return "$p:".concat(type.intrinsicName);
    }
    else if (type.flags & typescript_1.default.TypeFlags.NumberLiteral) {
        return "$pn:".concat(type.value);
    }
    else if (type.flags & typescript_1.default.TypeFlags.StringLiteral) {
        return "$ps:".concat(type.value);
    }
    else if (trace) {
        diagnostics_1.Diagnostics.error(trace, "Could not find UID for type \"".concat(type.checker.typeToString(type), "\""));
    }
}
exports.getTypeUid = getTypeUid;
function getNodeUid(state, node) {
    if (factory_1.f.is.namedDeclaration(node)) {
        return getDeclarationUid(state, node);
    }
    // resolve type aliases to the alias declaration
    if (factory_1.f.is.referenceType(node)) {
        return getNodeUid(state, node.typeName);
    }
    else if (factory_1.f.is.queryType(node)) {
        return getNodeUid(state, node.exprName);
    }
    var symbol = state.getSymbol(node);
    if (symbol) {
        return getSymbolUid(state, symbol, node);
    }
    var type = state.typeChecker.getTypeAtLocation(node);
    return getTypeUid(state, type, node);
}
exports.getNodeUid = getNodeUid;
//# sourceMappingURL=uid.js.map