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
exports.TransformState = void 0;
var unity_rojo_resolver_1 = require("@easy-games/unity-rojo-resolver");
var crypto_1 = __importDefault(require("crypto"));
var fs_1 = __importDefault(require("fs"));
var hashids_1 = __importDefault(require("hashids"));
var path_1 = __importDefault(require("path"));
var typescript_1 = __importDefault(require("typescript"));
var callMacros_1 = require("../transformations/macros/call/callMacros");
var transformNode_1 = require("../transformations/transformNode");
var cache_1 = require("../util/cache");
var factory_1 = require("../util/factory");
var arePathsEqual_1 = require("../util/functions/arePathsEqual");
var assert_1 = require("../util/functions/assert");
var createPathTranslator_1 = require("../util/functions/createPathTranslator");
var getPackageJson_1 = require("../util/functions/getPackageJson");
var isCleanBuildDirectory_1 = require("../util/functions/isCleanBuildDirectory");
var isPathDescendantOf_1 = require("../util/functions/isPathDescendantOf");
var parseCommandLine_1 = require("../util/functions/parseCommandLine");
var buildInfo_1 = require("./buildInfo");
var logger_1 = require("./logger");
var nodeMetadata_1 = require("./nodeMetadata");
var symbolProvider_1 = require("./symbolProvider");
var IGNORE_RBXTS_REGEX = /node_modules\/@rbxts\/(compiler-types|types)\/.*\.d\.ts$/;
var TransformState = /** @class */ (function () {
    function TransformState(program, context, config) {
        var _a, _b, _c, _d, _e;
        this.program = program;
        this.context = context;
        this.config = config;
        this.parsedCommandLine = (0, parseCommandLine_1.parseCommandLine)();
        this.currentDirectory = this.parsedCommandLine.project;
        this.options = this.program.getCompilerOptions();
        this.srcDir = (_a = this.options.rootDir) !== null && _a !== void 0 ? _a : this.currentDirectory;
        this.outDir = (_b = this.options.outDir) !== null && _b !== void 0 ? _b : this.currentDirectory;
        this.rootDirs = this.options.rootDirs ? this.options.rootDirs : [this.srcDir];
        this.typeChecker = this.program.getTypeChecker();
        this.symbolProvider = new symbolProvider_1.SymbolProvider(this);
        this.classes = new Map();
        this.callMacros = new Map();
        this.inferExpressions = new Map();
        this.isUserMacroCache = new Map();
        this.areMacrosSetup = false;
        this.fileImports = new Map();
        this.hasErrors = false;
        this.hoistedToTop = new Map();
        this.prereqStack = new Array();
        this.setupRojo();
        this.setupBuildInfo();
        (_c = config.idGenerationMode) !== null && _c !== void 0 ? _c : (config.idGenerationMode = config.obfuscation ? "obfuscated" : "full");
        var _f = (0, getPackageJson_1.getPackageJson)(this.currentDirectory), packageJson = _f.result, directory = _f.directory;
        this.rootDirectory = directory;
        (0, assert_1.assert)(packageJson.name);
        this.packageName = packageJson.name;
        this.isGame = !this.packageName.startsWith("@");
        if (!this.isGame)
            (_d = config.hashPrefix) !== null && _d !== void 0 ? _d : (config.hashPrefix = this.packageName);
        this.buildInfo.setIdentifierPrefix(config.hashPrefix);
        if (((_e = config.hashPrefix) === null || _e === void 0 ? void 0 : _e.startsWith("$")) && !config.$rbxpackmode$) {
            throw new Error("The hashPrefix $ is used internally by Flamework");
        }
        cache_1.Cache.isInitialCompile = false;
    }
    TransformState.prototype.setupBuildInfo = function () {
        var e_1, _a, e_2, _b;
        var _c;
        var baseBuildInfo = buildInfo_1.BuildInfo.fromDirectory(this.currentDirectory);
        if (!baseBuildInfo || (cache_1.Cache.isInitialCompile && (0, isCleanBuildDirectory_1.isCleanBuildDirectory)(this.options))) {
            if (this.options.incremental && this.options.tsBuildInfoFile) {
                if (typescript_1.default.sys.fileExists(this.options.tsBuildInfoFile)) {
                    throw new Error("Flamework cannot be built in a dirty environment, please delete your tsbuildinfo");
                }
            }
            baseBuildInfo = new buildInfo_1.BuildInfo(path_1.default.join(this.currentDirectory, "flamework.build"));
        }
        this.buildInfo = baseBuildInfo;
        var candidates = (_c = cache_1.Cache.buildInfoCandidates) !== null && _c !== void 0 ? _c : [];
        if (!cache_1.Cache.buildInfoCandidates) {
            cache_1.Cache.buildInfoCandidates = candidates;
            var candidatesSet = new Set();
            try {
                for (var _d = __values(this.program.getSourceFiles()), _e = _d.next(); !_e.done; _e = _d.next()) {
                    var file = _e.value;
                    var buildCandidate = buildInfo_1.BuildInfo.findCandidateUpper(path_1.default.dirname(file.fileName));
                    if (buildCandidate &&
                        !(0, arePathsEqual_1.arePathsEqual)(buildCandidate, baseBuildInfo.buildInfoPath) &&
                        !candidatesSet.has(buildCandidate)) {
                        candidatesSet.add(buildCandidate);
                        candidates.push(buildCandidate);
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_e && !_e.done && (_a = _d.return)) _a.call(_d);
                }
                finally { if (e_1) throw e_1.error; }
            }
        }
        try {
            for (var candidates_1 = __values(candidates), candidates_1_1 = candidates_1.next(); !candidates_1_1.done; candidates_1_1 = candidates_1.next()) {
                var candidate = candidates_1_1.value;
                var relativeCandidate = path_1.default.relative(this.currentDirectory, candidate);
                var buildInfo = buildInfo_1.BuildInfo.fromPath(candidate);
                if (buildInfo) {
                    logger_1.Logger.infoIfVerbose("Loaded buildInfo at ".concat(relativeCandidate, ", next id: ").concat(buildInfo.getLatestId()));
                    baseBuildInfo.addBuildInfo(buildInfo);
                }
                else {
                    logger_1.Logger.warn("Build info not valid at ".concat(relativeCandidate));
                }
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (candidates_1_1 && !candidates_1_1.done && (_b = candidates_1.return)) _b.call(candidates_1);
            }
            finally { if (e_2) throw e_2.error; }
        }
    };
    TransformState.prototype.setupRojo = function () {
        this.pathTranslator = (0, createPathTranslator_1.createPathTranslator)(this.program);
        var rojoArgvIndex = process.argv.findIndex(function (v) { return v === "--rojo"; });
        var rojoArg = rojoArgvIndex !== -1 ? process.argv[rojoArgvIndex + 1] : undefined;
        var rojoConfig;
        if (rojoArg && rojoArg !== "") {
            rojoConfig = path_1.default.resolve(rojoArg);
        }
        else {
            rojoConfig = unity_rojo_resolver_1.RojoResolver.findRojoConfigFilePath(this.currentDirectory).path;
        }
        if (rojoConfig !== undefined) {
            var rojoContents = fs_1.default.readFileSync(rojoConfig, { encoding: "ascii" });
            var sum = crypto_1.default.createHash("md5").update(rojoContents).digest("hex");
            if (sum === cache_1.Cache.rojoSum) {
                this.rojoResolver = cache_1.Cache.rojoResolver;
            }
            else {
                this.rojoResolver = unity_rojo_resolver_1.RojoResolver.fromPath(rojoConfig);
                cache_1.Cache.rojoSum = sum;
                cache_1.Cache.rojoResolver = this.rojoResolver;
            }
        }
    };
    TransformState.prototype.isUserMacro = function (symbol) {
        var e_3, _a;
        var cached = this.isUserMacroCache.get(symbol);
        if (cached !== undefined)
            return cached;
        if (symbol.declarations) {
            try {
                for (var _b = __values(symbol.declarations), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var declaration = _c.value;
                    var metadata = new nodeMetadata_1.NodeMetadata(this, declaration);
                    if (metadata.isRequested("macro")) {
                        this.isUserMacroCache.set(symbol, true);
                        return true;
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
        }
        this.isUserMacroCache.set(symbol, false);
        return false;
    };
    TransformState.prototype.setupMacros = function () {
        var e_4, _a, e_5, _b;
        if (this.areMacrosSetup)
            return;
        this.areMacrosSetup = true;
        try {
            for (var CALL_MACROS_1 = __values(callMacros_1.CALL_MACROS), CALL_MACROS_1_1 = CALL_MACROS_1.next(); !CALL_MACROS_1_1.done; CALL_MACROS_1_1 = CALL_MACROS_1.next()) {
                var macro = CALL_MACROS_1_1.value;
                var symbols = macro.getSymbol(this);
                if (Array.isArray(symbols)) {
                    try {
                        for (var symbols_1 = (e_5 = void 0, __values(symbols)), symbols_1_1 = symbols_1.next(); !symbols_1_1.done; symbols_1_1 = symbols_1.next()) {
                            var symbol = symbols_1_1.value;
                            this.callMacros.set(symbol, macro);
                        }
                    }
                    catch (e_5_1) { e_5 = { error: e_5_1 }; }
                    finally {
                        try {
                            if (symbols_1_1 && !symbols_1_1.done && (_b = symbols_1.return)) _b.call(symbols_1);
                        }
                        finally { if (e_5) throw e_5.error; }
                    }
                    macro._symbols = symbols;
                }
                else {
                    this.callMacros.set(symbols, macro);
                    macro._symbols = [symbols];
                }
            }
        }
        catch (e_4_1) { e_4 = { error: e_4_1 }; }
        finally {
            try {
                if (CALL_MACROS_1_1 && !CALL_MACROS_1_1.done && (_a = CALL_MACROS_1.return)) _a.call(CALL_MACROS_1);
            }
            finally { if (e_4) throw e_4.error; }
        }
    };
    TransformState.prototype.addFileImport = function (file, importPath, name) {
        var e_6, _a, e_7, _b;
        var _c;
        var symbolProvider = this.symbolProvider;
        if (importPath === "@easy-games/flamework-core") {
            if ((file === symbolProvider.flameworkFile.file ||
                this.getSymbol(file) === symbolProvider.flameworkFile.fileSymbol) &&
                name === "Flamework") {
                return factory_1.f.identifier("Flamework");
            }
            var flameworkDir = path_1.default.dirname(symbolProvider.flameworkFile.file.fileName);
            var modulePath = path_1.default.join(flameworkDir, name === "Reflect" ? "reflect" : "flamework");
            if ((0, isPathDescendantOf_1.isPathDescendantOf)(file.fileName, flameworkDir)) {
                importPath = "./" + path_1.default.relative(path_1.default.dirname(file.fileName), modulePath) || ".";
            }
        }
        var importInfos = this.fileImports.get(file.fileName);
        if (!importInfos)
            this.fileImports.set(file.fileName, (importInfos = []));
        var importInfo = importInfos.find(function (x) { return x.path === importPath; });
        if (!importInfo)
            importInfos.push((importInfo = { path: importPath, entries: [] }));
        var identifier = (_c = importInfo.entries.find(function (x) { return x.name === name; })) === null || _c === void 0 ? void 0 : _c.identifier;
        if (!identifier) {
            if (!file.identifiers.has(name)) {
                identifier = factory_1.f.identifier(name);
                importInfo.entries.push({ name: name, identifier: identifier });
            }
        }
        if (!identifier) {
            try {
                start: for (var _d = __values(file.statements), _e = _d.next(); !_e.done; _e = _d.next()) {
                    var statement = _e.value;
                    if (!factory_1.f.is.importDeclaration(statement))
                        break;
                    if (!factory_1.f.is.string(statement.moduleSpecifier))
                        continue;
                    if (!factory_1.f.is.importClauseDeclaration(statement.importClause))
                        continue;
                    if (!factory_1.f.is.namedImports(statement.importClause.namedBindings))
                        continue;
                    if (statement.moduleSpecifier.text !== importPath)
                        continue;
                    try {
                        for (var _f = (e_7 = void 0, __values(statement.importClause.namedBindings.elements)), _g = _f.next(); !_g.done; _g = _f.next()) {
                            var importElement = _g.value;
                            if (importElement.propertyName) {
                                if (importElement.propertyName.text === name) {
                                    identifier = importElement.name;
                                    break start;
                                }
                            }
                            else {
                                if (importElement.name.text === name) {
                                    identifier = importElement.name;
                                    break start;
                                }
                            }
                        }
                    }
                    catch (e_7_1) { e_7 = { error: e_7_1 }; }
                    finally {
                        try {
                            if (_g && !_g.done && (_b = _f.return)) _b.call(_f);
                        }
                        finally { if (e_7) throw e_7.error; }
                    }
                }
            }
            catch (e_6_1) { e_6 = { error: e_6_1 }; }
            finally {
                try {
                    if (_e && !_e.done && (_a = _d.return)) _a.call(_d);
                }
                finally { if (e_6) throw e_6.error; }
            }
        }
        if (!identifier)
            importInfo.entries.push({
                name: name,
                identifier: (identifier = factory_1.f.identifier(name, true)),
            });
        return identifier;
    };
    TransformState.prototype.getSourceFile = function (node) {
        var parseNode = typescript_1.default.getParseTreeNode(node);
        if (!parseNode)
            throw new Error("Could not find parse tree node");
        return typescript_1.default.getSourceFileOfNode(parseNode);
    };
    TransformState.prototype.getSymbol = function (node, followAlias) {
        if (followAlias === void 0) { followAlias = true; }
        if (factory_1.f.is.namedDeclaration(node)) {
            return this.getSymbol(node.name);
        }
        var symbol = this.typeChecker.getSymbolAtLocation(node);
        if (symbol && followAlias) {
            return typescript_1.default.skipAlias(symbol, this.typeChecker);
        }
        else {
            return symbol;
        }
    };
    TransformState.prototype.hash = function (id, noPrefix) {
        var _a;
        var hashPrefix = this.config.hashPrefix;
        var salt = (_a = this.config.salt) !== null && _a !== void 0 ? _a : this.buildInfo.getSalt();
        var hashGenerator = new hashids_1.default(salt, 2);
        if ((this.isGame && !hashPrefix) || noPrefix) {
            return "".concat(hashGenerator.encode(id));
        }
        else {
            // If the package name is namespaced, then it can be used in
            // other projects so we want to add a prefix to the Id to prevent
            // collisions with other packages or the game.
            return "".concat(hashPrefix !== null && hashPrefix !== void 0 ? hashPrefix : this.packageName, ":").concat(hashGenerator.encode(id));
        }
    };
    TransformState.prototype.obfuscateText = function (text, context) {
        return this.config.obfuscation ? this.buildInfo.hashString(text, context) : text;
    };
    TransformState.prototype.addDiagnostic = function (diag) {
        if (diag.category === typescript_1.default.DiagnosticCategory.Error) {
            this.hasErrors = true;
        }
        this.context.addDiagnostic(diag);
    };
    TransformState.prototype.hoistToTop = function (file, node) {
        var hoisted = this.hoistedToTop.get(file);
        if (!hoisted)
            this.hoistedToTop.set(file, (hoisted = []));
        hoisted.push(node);
    };
    TransformState.prototype.capture = function (cb) {
        this.prereqStack.push([]);
        var result = cb();
        return [result, this.prereqStack.pop()];
    };
    TransformState.prototype.prereq = function (statement) {
        var stack = this.prereqStack[this.prereqStack.length - 1];
        if (stack)
            stack.push(statement);
    };
    TransformState.prototype.prereqList = function (statements) {
        var stack = this.prereqStack[this.prereqStack.length - 1];
        if (stack)
            stack.push.apply(stack, __spreadArray([], __read(statements), false));
    };
    TransformState.prototype.isCapturing = function (threshold) {
        if (threshold === void 0) { threshold = 1; }
        return this.prereqStack.length > threshold;
    };
    TransformState.prototype.transform = function (node) {
        var _this = this;
        return typescript_1.default.visitEachChild(node, function (newNode) { return (0, transformNode_1.transformNode)(_this, newNode); }, this.context);
    };
    TransformState.prototype.transformNode = function (node) {
        var _this = this;
        return typescript_1.default.visitNode(node, function (newNode) { return (0, transformNode_1.transformNode)(_this, newNode); });
    };
    TransformState.prototype.transformList = function (nodes) {
        var _this = this;
        return typescript_1.default.visitNodes(nodes, function (newNode) { return (0, transformNode_1.transformNode)(_this, newNode); });
    };
    TransformState.prototype._shouldViewFile = function (file) {
        var e_8, _a;
        var fileName = path_1.default.posix.normalize(file.fileName);
        if (IGNORE_RBXTS_REGEX.test(fileName))
            return false;
        var buildCandidates = cache_1.Cache.buildInfoCandidates;
        try {
            for (var buildCandidates_1 = __values(buildCandidates), buildCandidates_1_1 = buildCandidates_1.next(); !buildCandidates_1_1.done; buildCandidates_1_1 = buildCandidates_1.next()) {
                var candidate = buildCandidates_1_1.value;
                var realPath = cache_1.Cache.realPath.get(candidate);
                if (!realPath)
                    cache_1.Cache.realPath.set(candidate, (realPath = fs_1.default.realpathSync(candidate)));
                var candidateDir = path_1.default.dirname(realPath);
                if ((0, isPathDescendantOf_1.isPathDescendantOf)(file.fileName, candidateDir) &&
                    !(0, isPathDescendantOf_1.isPathDescendantOf)(file.fileName, path_1.default.join(candidateDir, "node_modules"))) {
                    return true;
                }
            }
        }
        catch (e_8_1) { e_8 = { error: e_8_1 }; }
        finally {
            try {
                if (buildCandidates_1_1 && !buildCandidates_1_1.done && (_a = buildCandidates_1.return)) _a.call(buildCandidates_1);
            }
            finally { if (e_8) throw e_8.error; }
        }
        return false;
    };
    TransformState.prototype.shouldViewFile = function (file) {
        var _a;
        var cached = (_a = cache_1.Cache.shouldView) === null || _a === void 0 ? void 0 : _a.get(file.fileName);
        if (cached !== undefined)
            return cached;
        var result = this._shouldViewFile(file);
        cache_1.Cache.shouldView.set(file.fileName, result);
        return result;
    };
    return TransformState;
}());
exports.TransformState = TransformState;
//# sourceMappingURL=transformState.js.map