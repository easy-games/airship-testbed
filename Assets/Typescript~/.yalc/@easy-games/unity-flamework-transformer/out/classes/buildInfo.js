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
exports.BuildInfo = void 0;
var typescript_1 = __importDefault(require("typescript"));
var path_1 = __importDefault(require("path"));
var fs_1 = __importDefault(require("fs"));
var ajv_1 = __importDefault(require("ajv"));
var crypto_1 = __importDefault(require("crypto"));
var uuid_1 = require("uuid");
var constants_1 = require("./pathTranslator/constants");
var isPathDescendantOf_1 = require("../util/functions/isPathDescendantOf");
var BuildInfo = exports.BuildInfo = /** @class */ (function () {
    function BuildInfo(buildInfoPath, buildInfo) {
        var e_1, _a;
        this.buildInfoPath = buildInfoPath;
        this.buildInfos = [];
        this.identifiersLookup = new Map();
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        this.buildInfo = buildInfo !== null && buildInfo !== void 0 ? buildInfo : {
            version: 1,
            flameworkVersion: constants_1.PKG_VERSION,
            identifiers: {},
        };
        if (buildInfo) {
            try {
                for (var _b = __values(Object.entries(buildInfo.identifiers)), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var _d = __read(_c.value, 2), internalId = _d[0], id = _d[1];
                    this.identifiersLookup.set(id, internalId);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
        }
    }
    BuildInfo.fromPath = function (fileName) {
        if (!typescript_1.default.sys.fileExists(fileName))
            return new BuildInfo(fileName);
        var fileContents = typescript_1.default.sys.readFile(fileName);
        if (!fileContents)
            throw new Error("Could not read file ".concat(fileName));
        var buildInfo = JSON.parse(fileContents);
        if (this.validateBuild(buildInfo)) {
            return new BuildInfo(fileName, buildInfo);
        }
        throw new Error("Found invalid build info at ".concat(fileName));
    };
    BuildInfo.fromDirectory = function (directory) {
        var buildInfoPath = path_1.default.join(directory, "flamework.build");
        if (typescript_1.default.sys.fileExists(buildInfoPath)) {
            return this.fromPath(buildInfoPath);
        }
        var packageJsonPath = typescript_1.default.findPackageJson(directory, typescript_1.default.sys);
        if (packageJsonPath) {
            var buildInfoPath_1 = path_1.default.join(path_1.default.dirname(packageJsonPath), "flamework.build");
            if (buildInfoPath_1 && typescript_1.default.sys.fileExists(buildInfoPath_1)) {
                return this.fromPath(buildInfoPath_1);
            }
        }
    };
    BuildInfo.validateBuild = function (value) {
        if (!this.validateBuildFn) {
            var SCHEMA_PATH = path_1.default.join(constants_1.PACKAGE_ROOT, "flamework-schema.json");
            this.validateBuildFn = new ajv_1.default().compile(JSON.parse(fs_1.default.readFileSync(SCHEMA_PATH).toString()));
        }
        return this.validateBuildFn(value) === true;
    };
    BuildInfo.findCandidateUpper = function (startDirectory, depth) {
        if (depth === void 0) { depth = 4; }
        var cache = this.candidateCache.get(startDirectory);
        if (cache && cache.result) {
            return cache.result;
        }
        var buildPath = path_1.default.join(startDirectory, "flamework.build");
        if (!cache && fs_1.default.existsSync(buildPath)) {
            this.candidateCache.set(startDirectory, { result: buildPath });
            return buildPath;
        }
        else {
            this.candidateCache.set(startDirectory, {});
        }
        if (depth > 0) {
            return this.findCandidateUpper(path_1.default.dirname(startDirectory), depth - 1);
        }
    };
    BuildInfo.findCandidates = function (searchPath, depth, isNodeModules) {
        var e_2, _a;
        if (depth === void 0) { depth = 2; }
        if (isNodeModules === void 0) { isNodeModules = true; }
        var candidates = [];
        try {
            for (var _b = __values(fs_1.default.readdirSync(searchPath)), _c = _b.next(); !_c.done; _c = _b.next()) {
                var childPath = _c.value;
                // only search @* (@rbxts, @flamework, @custom, etc)
                if (!isNodeModules || childPath.startsWith("@")) {
                    var fullPath = path_1.default.join(searchPath, childPath);
                    var realPath = fs_1.default.realpathSync(fullPath);
                    if (fs_1.default.lstatSync(realPath).isDirectory() && depth !== 0) {
                        candidates.push.apply(candidates, __spreadArray([], __read(BuildInfo.findCandidates(fullPath, depth - 1, childPath === "node_modules")), false));
                    }
                    else {
                        if (childPath === "flamework.build") {
                            candidates.push(fullPath);
                        }
                    }
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
        return candidates;
    };
    /**
     * Saves the build info to a file.
     */
    BuildInfo.prototype.save = function () {
        fs_1.default.writeFileSync(this.buildInfoPath, JSON.stringify(this.buildInfo, undefined, "\t"));
    };
    /**
     * Retrieves the salt previously used to generate identifiers, or creates one.
     */
    BuildInfo.prototype.getSalt = function () {
        if (this.buildInfo.salt)
            return this.buildInfo.salt;
        var salt = crypto_1.default.randomBytes(64).toString("hex");
        this.buildInfo.salt = salt;
        return salt;
    };
    /**
     * Retrieves the version of flamework that this project was originally compiled on.
     */
    BuildInfo.prototype.getFlameworkVersion = function () {
        return this.buildInfo.flameworkVersion;
    };
    /**
     * Register a build info from an external source, normally packages.
     * @param buildInfo The BuildInfo to add
     */
    BuildInfo.prototype.addBuildInfo = function (buildInfo) {
        this.buildInfos.push(buildInfo);
    };
    /**
     * Register a new identifier to be saved with the build info.
     * @param internalId The internal, reproducible ID
     * @param id The random or incremental ID
     */
    BuildInfo.prototype.addIdentifier = function (internalId, id) {
        var identifier = this.getIdentifierFromInternal(internalId);
        if (identifier)
            throw new Error("Attempt to rewrite identifier ".concat(internalId, " -> ").concat(id, " (from ").concat(identifier, ")"));
        this.buildInfo.identifiers[internalId] = id;
        this.identifiersLookup.set(id, internalId);
    };
    BuildInfo.prototype.addBuildClass = function (classInfo) {
        if (this.getBuildClass(classInfo.internalId))
            throw new Error("Attempt to overwrite ".concat(classInfo.internalId, " class"));
        if (!this.buildInfo.classes)
            this.buildInfo.classes = [];
        this.buildInfo.classes.push(classInfo);
    };
    BuildInfo.prototype.getBuildInfoFromFile = function (fileName) {
        var e_3, _a;
        try {
            for (var _b = __values(this.buildInfos), _c = _b.next(); !_c.done; _c = _b.next()) {
                var build = _c.value;
                if ((0, isPathDescendantOf_1.isPathDescendantOf)(fileName, path_1.default.dirname(build.buildInfoPath))) {
                    return build;
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
    /**
     * Get the random or incremental Id from the internalId.
     * @param internalId The internal, reproducible ID
     */
    BuildInfo.prototype.getIdentifierFromInternal = function (internalId) {
        var e_4, _a;
        var id = this.buildInfo.identifiers[internalId];
        if (id)
            return id;
        try {
            for (var _b = __values(this.buildInfos), _c = _b.next(); !_c.done; _c = _b.next()) {
                var build = _c.value;
                var subId = build.getIdentifierFromInternal(internalId);
                if (subId)
                    return subId;
            }
        }
        catch (e_4_1) { e_4 = { error: e_4_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_4) throw e_4.error; }
        }
    };
    /**
     * Get the internal, reproducible Id from a random Id.
     * @param id The random or incremental Id
     */
    BuildInfo.prototype.getInternalFromIdentifier = function (id) {
        var e_5, _a;
        var internalId = this.identifiersLookup.get(id);
        if (internalId)
            return internalId;
        try {
            for (var _b = __values(this.buildInfos), _c = _b.next(); !_c.done; _c = _b.next()) {
                var build = _c.value;
                var subId = build.getIdentifierFromInternal(id);
                if (subId)
                    return subId;
            }
        }
        catch (e_5_1) { e_5 = { error: e_5_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_5) throw e_5.error; }
        }
    };
    BuildInfo.prototype.getBuildClass = function (internalId) {
        var e_6, _a;
        var _b;
        var buildClass = (_b = this.buildInfo.classes) === null || _b === void 0 ? void 0 : _b.find(function (x) { return x.internalId === internalId; });
        if (buildClass)
            return buildClass;
        try {
            for (var _c = __values(this.buildInfos), _d = _c.next(); !_d.done; _d = _c.next()) {
                var build = _d.value;
                var subClass = build.getBuildClass(internalId);
                if (subClass)
                    return subClass;
            }
        }
        catch (e_6_1) { e_6 = { error: e_6_1 }; }
        finally {
            try {
                if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
            }
            finally { if (e_6) throw e_6.error; }
        }
    };
    /**
     * Returns the next Id for incremental generation.
     */
    BuildInfo.prototype.getLatestId = function () {
        return Object.keys(this.buildInfo.identifiers).length + 1;
    };
    /**
     * Create a UUID, subsequent calls with the same string will have the same UUID.
     * @param str The string to hash
     */
    BuildInfo.prototype.hashString = function (str, context) {
        if (context === void 0) { context = "@"; }
        str = "".concat(context, ":").concat(str);
        var stringHashes = this.buildInfo.stringHashes;
        if (!stringHashes)
            this.buildInfo.stringHashes = stringHashes = {};
        if (stringHashes[str])
            return stringHashes[str];
        var strUuid = (0, uuid_1.v4)();
        stringHashes[str] = strUuid;
        return strUuid;
    };
    /**
     * Sets the prefix used for identifiers.
     * Used to generate IDs for packages.
     */
    BuildInfo.prototype.setIdentifierPrefix = function (prefix) {
        this.buildInfo.identifierPrefix = prefix;
    };
    /**
     * Gets the prefixed used for identifiers.
     */
    BuildInfo.prototype.getIdentifierPrefix = function () {
        return this.buildInfo.identifierPrefix;
    };
    BuildInfo.candidateCache = new Map();
    return BuildInfo;
}());
//# sourceMappingURL=buildInfo.js.map