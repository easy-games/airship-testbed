"use strict";
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SymbolProvider = void 0;
/* eslint-disable prettier/prettier */
var chalk_1 = __importDefault(require("chalk"));
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
var typescript_1 = __importDefault(require("typescript"));
var cache_1 = require("../util/cache");
var factory_1 = require("../util/factory");
var assert_1 = require("../util/functions/assert");
var emitTypescriptMismatch_1 = require("../util/functions/emitTypescriptMismatch");
var getPackageJson_1 = require("../util/functions/getPackageJson");
var isPathDescendantOf_1 = require("../util/functions/isPathDescendantOf");
var logger_1 = require("./logger");
var EXCLUDED_NAME_DIR = new Set(["src/", "lib/", "out/"]);
var SymbolProvider = /** @class */ (function () {
    function SymbolProvider(state) {
        this.state = state;
        this.fileSymbols = new Map();
        this.registeredFiles = 0;
        this.flameworkDir = this.resolveModuleDir("@easy-games/flamework-core");
        this.componentsDir = this.resolveModuleDir("@easy-games/flamework-components");
        this.networkingDir = this.resolveModuleDir("@easy-games/flamework-networking");
    }
    SymbolProvider.prototype.resolveModuleDir = function (moduleName) {
        var modulePath = cache_1.Cache.moduleResolution.get(moduleName);
        if (modulePath !== undefined)
            return modulePath || undefined;
        var dummyFile = path_1.default.join(this.state.srcDir, "dummy.ts");
        var module = typescript_1.default.resolveModuleName(moduleName, dummyFile, this.state.options, typescript_1.default.sys);
        var resolvedModule = module.resolvedModule;
        if (resolvedModule) {
            var modulePath_1 = fs_1.default.realpathSync(path_1.default.join(resolvedModule.resolvedFileName, "../"));
            cache_1.Cache.moduleResolution.set(moduleName, modulePath_1);
            return modulePath_1;
        }
        cache_1.Cache.moduleResolution.set(moduleName, false);
    };
    SymbolProvider.prototype.findFile = function (name) {
        return this.fileSymbols.get(name);
    };
    SymbolProvider.prototype.getFile = function (name) {
        var fileSymbol = this.findFile(name);
        (0, assert_1.assert)(fileSymbol, "Could not find fileSymbol for '".concat(name, "'"));
        return fileSymbol;
    };
    SymbolProvider.prototype.registerInterestingFiles = function () {
        var e_1, _a;
        try {
            for (var _b = __values(this.state.program.getSourceFiles()), _c = _b.next(); !_c.done; _c = _b.next()) {
                var file = _c.value;
                if (this.isFileInteresting(file)) {
                    this.registerFileSymbol(file);
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        this.finalize();
    };
    SymbolProvider.prototype.getName = function (packageName, directory, file) {
        var relativePath = path_1.default
            .relative(directory, file.fileName)
            .replace(/\\/g, "/")
            .replace(/(\.d)?.ts$/, "");
        if (EXCLUDED_NAME_DIR.has(relativePath.substr(0, 4))) {
            return "".concat(packageName, "/").concat(relativePath.substr(4));
        }
        return "".concat(packageName, "/").concat(relativePath);
    };
    SymbolProvider.prototype.registerFileSymbol = function (file) {
        var _a = (0, getPackageJson_1.getPackageJson)(file.fileName), result = _a.result, directory = _a.directory;
        (0, assert_1.assert)(result.name);
        var name = this.getName(result.name, directory, file);
        if (this.fileSymbols.has(name)) {
            logger_1.Logger.warn("duplicate file symbol. name=" + name + ", fileName=" + file.fileName);
            return this.fileSymbols.get(name);
        }
        // assert(!this.fileSymbols.has(name), "Attempt to register file twice: " + name + ", fileName=" + file.fileName);
        // console.log("registering " + name + " to file " + file.fileName);
        var fileSymbol = new FileSymbol(this.state, file, name);
        this.fileSymbols.set(name, fileSymbol);
        this.registeredFiles++;
        return fileSymbol;
    };
    SymbolProvider.prototype.isFileInteresting = function (file) {
        if (this.state.config.$rbxpackmode$ && (0, isPathDescendantOf_1.isPathDescendantOf)(file.fileName, this.state.srcDir)) {
            return true;
        }
        if (this.flameworkDir && (0, isPathDescendantOf_1.isPathDescendantOf)(file.fileName, this.flameworkDir)) {
            return true;
        }
        if (this.componentsDir && (0, isPathDescendantOf_1.isPathDescendantOf)(file.fileName, this.componentsDir)) {
            return true;
        }
        if (this.networkingDir && (0, isPathDescendantOf_1.isPathDescendantOf)(file.fileName, this.networkingDir)) {
            return true;
        }
        return false;
    };
    SymbolProvider.prototype.finalize = function () {
        var _a, _b;
        this.moddingFile = this.getFile("@easy-games/flamework-core/modding");
        console.log("modding file exists: ", this.moddingFile !== undefined);
        this.flameworkFile = this.getFile("@easy-games/flamework-core/flamework");
        this.componentsFile = this.findFile("@easy-games/flamework-components/index");
        this.networkingFile = this.findFile("@easy-games/flamework-networking/index");
        if (!this.flameworkFile.namespaces.has("Flamework") ||
            (this.componentsFile && !this.componentsFile.classes.has("Components")) ||
            (this.networkingFile && !this.networkingFile.namespaces.has("Networking"))) {
            (0, emitTypescriptMismatch_1.emitTypescriptMismatch)(this.state, chalk_1.default.red("Failed to load! Symbols were not populated"));
        }
        this.flamework = this.flameworkFile.getNamespace("Flamework");
        this.components = (_a = this.componentsFile) === null || _a === void 0 ? void 0 : _a.getClass("Components");
        this.networking = (_b = this.networkingFile) === null || _b === void 0 ? void 0 : _b.getNamespace("Networking");
        logger_1.Logger.writeLineIfVerbose("Registered symbols in ".concat(this.registeredFiles, " files"));
    };
    return SymbolProvider;
}());
exports.SymbolProvider = SymbolProvider;
var ClassSymbol = /** @class */ (function () {
    function ClassSymbol(fileSymbol, parentSymbol, node) {
        this.fileSymbol = fileSymbol;
        this.parentSymbol = parentSymbol;
        this.node = node;
        var classSymbol = fileSymbol.state.getSymbol(node.name);
        (0, assert_1.assert)(classSymbol);
        this.classSymbol = classSymbol;
    }
    ClassSymbol.prototype.get = function (name) {
        var _a;
        var memberSymbol = (_a = this.classSymbol.members) === null || _a === void 0 ? void 0 : _a.get(name);
        (0, assert_1.assert)(memberSymbol, "Name ".concat(name, " not found in ").concat(this.classSymbol.name));
        return memberSymbol;
    };
    ClassSymbol.prototype.getStatic = function (name) {
        var _a;
        var exportSymbol = (_a = this.classSymbol.exports) === null || _a === void 0 ? void 0 : _a.get(name);
        (0, assert_1.assert)(exportSymbol, "Static name ".concat(name, " not found in ").concat(this.classSymbol.name));
        return exportSymbol;
    };
    return ClassSymbol;
}());
var TypeSymbol = /** @class */ (function () {
    function TypeSymbol(fileSymbol, parentSymbol, node) {
        this.fileSymbol = fileSymbol;
        this.parentSymbol = parentSymbol;
        this.node = node;
        var typeSymbol = fileSymbol.state.getSymbol(node.name);
        (0, assert_1.assert)(typeSymbol);
        this.typeSymbol = typeSymbol;
    }
    TypeSymbol.prototype.get = function (name) {
        var _a;
        var memberSymbol = (_a = this.typeSymbol.members) === null || _a === void 0 ? void 0 : _a.get(name);
        (0, assert_1.assert)(memberSymbol, "Name ".concat(name, " not found in ").concat(this.typeSymbol.name));
        return memberSymbol;
    };
    return TypeSymbol;
}());
var NamespaceSymbol = /** @class */ (function () {
    function NamespaceSymbol(fileSymbol, parentSymbol, node) {
        this.fileSymbol = fileSymbol;
        this.parentSymbol = parentSymbol;
        this.node = node;
        this.classes = new Map();
        this.namespaces = new Map();
        this.types = new Map();
        var namespaceSymbol = fileSymbol.state.getSymbol(node.name);
        (0, assert_1.assert)(namespaceSymbol);
        this.namespaceSymbol = namespaceSymbol;
        this.register();
    }
    NamespaceSymbol.prototype.get = function (name) {
        var _a;
        var exportSymbol = (_a = this.namespaceSymbol.exports) === null || _a === void 0 ? void 0 : _a.get(name);
        (0, assert_1.assert)(exportSymbol, "Name ".concat(name, " not found in ").concat(this.namespaceSymbol.name));
        return exportSymbol;
    };
    NamespaceSymbol.prototype.getNamespace = function (name) {
        var namespace = this.namespaces.get(name);
        (0, assert_1.assert)(namespace);
        return namespace;
    };
    NamespaceSymbol.prototype.getClass = function (name) {
        var classSymbol = this.classes.get(name);
        (0, assert_1.assert)(classSymbol);
        return classSymbol;
    };
    NamespaceSymbol.prototype.getType = function (name) {
        var typeSymbol = this.types.get(name);
        (0, assert_1.assert)(typeSymbol);
        return typeSymbol;
    };
    NamespaceSymbol.prototype.registerNamespace = function (node) {
        (0, assert_1.assert)(factory_1.f.is.moduleBlockDeclaration(node.body));
        var namespaceSymbol = new NamespaceSymbol(this.fileSymbol, this, node);
        namespaceSymbol.register();
        this.namespaces.set(node.name.text, namespaceSymbol);
    };
    NamespaceSymbol.prototype.registerClass = function (node) {
        (0, assert_1.assert)(node.name);
        var classSymbol = new ClassSymbol(this.fileSymbol, this, node);
        this.classes.set(node.name.text, classSymbol);
    };
    NamespaceSymbol.prototype.registerType = function (node) {
        var typeSymbol = new TypeSymbol(this.fileSymbol, this, node);
        this.types.set(node.name.text, typeSymbol);
    };
    NamespaceSymbol.prototype.register = function () {
        var e_2, _a;
        (0, assert_1.assert)(factory_1.f.is.moduleBlockDeclaration(this.node.body));
        try {
            for (var _b = __values(this.node.body.statements), _c = _b.next(); !_c.done; _c = _b.next()) {
                var statement = _c.value;
                if (factory_1.f.is.namespaceDeclaration(statement)) {
                    this.registerNamespace(statement);
                }
                else if (factory_1.f.is.classDeclaration(statement)) {
                    this.registerClass(statement);
                }
                else if (factory_1.f.is.typeAliasDeclaration(statement) || factory_1.f.is.interfaceDeclaration(statement)) {
                    this.registerType(statement);
                }
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_2) throw e_2.error; }
        }
    };
    return NamespaceSymbol;
}());
var FileSymbol = /** @class */ (function () {
    function FileSymbol(state, file, name) {
        this.state = state;
        this.file = file;
        this.name = name;
        this.namespaces = new Map();
        this.classes = new Map();
        this.types = new Map();
        var fileSymbol = this.state.getSymbol(file);
        (0, assert_1.assert)(fileSymbol);
        this.fileSymbol = fileSymbol;
        this.register();
    }
    FileSymbol.prototype.get = function (name) {
        var _a;
        var exportSymbol = (_a = this.fileSymbol.exports) === null || _a === void 0 ? void 0 : _a.get(name);
        (0, assert_1.assert)(exportSymbol);
        return exportSymbol;
    };
    FileSymbol.prototype.getNamespace = function (name) {
        var namespace = this.namespaces.get(name);
        (0, assert_1.assert)(namespace);
        return namespace;
    };
    FileSymbol.prototype.getClass = function (name) {
        var classSymbol = this.classes.get(name);
        (0, assert_1.assert)(classSymbol);
        return classSymbol;
    };
    FileSymbol.prototype.getType = function (name) {
        var typeSymbol = this.types.get(name);
        (0, assert_1.assert)(typeSymbol);
        return typeSymbol;
    };
    FileSymbol.prototype.registerNamespace = function (node) {
        (0, assert_1.assert)(factory_1.f.is.moduleBlockDeclaration(node.body));
        var namespaceSymbol = new NamespaceSymbol(this, this, node);
        this.namespaces.set(node.name.text, namespaceSymbol);
    };
    FileSymbol.prototype.registerClass = function (node) {
        if (!node.name)
            console.log(node.getText());
        (0, assert_1.assert)(node.name);
        var classSymbol = new ClassSymbol(this, this, node);
        this.classes.set(node.name.text, classSymbol);
    };
    FileSymbol.prototype.registerType = function (node) {
        var typeSymbol = new TypeSymbol(this, this, node);
        this.types.set(node.name.text, typeSymbol);
    };
    FileSymbol.prototype.register = function () {
        var e_3, _a;
        try {
            for (var _b = __values(this.file.statements), _c = _b.next(); !_c.done; _c = _b.next()) {
                var statement = _c.value;
                if (factory_1.f.is.namespaceDeclaration(statement)) {
                    this.registerNamespace(statement);
                }
                else if (factory_1.f.is.classDeclaration(statement)) {
                    this.registerClass(statement);
                }
                else if (factory_1.f.is.typeAliasDeclaration(statement) || factory_1.f.is.interfaceDeclaration(statement)) {
                    this.registerType(statement);
                }
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_3) throw e_3.error; }
        }
    };
    return FileSymbol;
}());
//# sourceMappingURL=symbolProvider.js.map