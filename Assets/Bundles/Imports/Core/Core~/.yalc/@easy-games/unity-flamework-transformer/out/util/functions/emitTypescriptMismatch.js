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
exports.emitTypescriptMismatch = void 0;
var chalk_1 = __importDefault(require("chalk"));
var path_1 = __importDefault(require("path"));
var typescript_1 = __importDefault(require("typescript"));
var logger_1 = require("../../classes/logger");
var getPackageJson_1 = require("./getPackageJson");
var isPathDescendantOf_1 = require("./isPathDescendantOf");
function tryResolve(name, path) {
    try {
        return require.resolve(name, { paths: [path] });
    }
    catch (e) { }
}
function emitMessages(messages) {
    logger_1.Logger.writeLine.apply(logger_1.Logger, __spreadArray([], __read(messages), false));
    process.exit(1);
}
/**
 * Spits out information about the mismatch.
 * This should only be called after a mismatch is detected.
 */
function emitTypescriptMismatch(state, baseMessage) {
    var messages = [baseMessage];
    // Check if they have a local install.
    var robloxTsPath = tryResolve("roblox-ts", state.rootDirectory);
    if (!robloxTsPath) {
        messages.push("It is recommended that you use a local install of roblox-ts.", "You can install a local version using ".concat(chalk_1.default.green("npm install -D roblox-ts")));
        emitMessages(messages);
    }
    // Check if they've used a global install.
    if (require.main) {
        if (!(0, isPathDescendantOf_1.isPathDescendantOf)(require.main.filename, path_1.default.join(state.rootDirectory, "node_modules"))) {
            messages.push("It appears you've run the transformer using a global install.", "You can run using the locally installed version using ".concat(chalk_1.default.green("npx rbxtsc")));
            emitMessages(messages);
        }
    }
    // They're using a local install
    // but they're using the wrong TypeScript version.
    var robloxTsTypeScript = tryResolve("typescript", robloxTsPath);
    if (robloxTsTypeScript) {
        var typescriptPackage = (0, getPackageJson_1.getPackageJson)(robloxTsTypeScript);
        if (typescriptPackage) {
            var requiredVersion = typescriptPackage.result.version;
            if (typescript_1.default.version !== requiredVersion) {
                messages.push("Flamework is using TypeScript version ".concat(typescript_1.default.version), "roblox-ts requires TypeScript version ".concat(requiredVersion), "You can fix this by setting your TypeScript version: ".concat(chalk_1.default.green("npm install -D typescript@=".concat(requiredVersion))));
            }
        }
    }
    emitMessages(messages);
}
exports.emitTypescriptMismatch = emitTypescriptMismatch;
//# sourceMappingURL=emitTypescriptMismatch.js.map