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
exports.FlameworkAddPathsMacro = void 0;
/* eslint-disable prettier/prettier */
var glob_1 = __importDefault(require("glob"));
var path_1 = __importDefault(require("path"));
var diagnostics_1 = require("../../../../../classes/diagnostics");
var factory_1 = require("../../../../../util/factory");
function getPathFromSpecifier(state, source, hostDir, specifier) {
    var _a;
    var sourceDir = path_1.default.dirname(source.fileName);
    var absolutePath = specifier.startsWith(".") ? path_1.default.join(sourceDir, specifier) : path_1.default.join(hostDir, specifier);
    var outputPath = state.pathTranslator.getOutputPath(absolutePath);
    return (_a = state.rojoResolver) === null || _a === void 0 ? void 0 : _a.getRbxPathFromFilePath(outputPath);
}
exports.FlameworkAddPathsMacro = {
    getSymbol: function (state) {
        return state.symbolProvider.flamework.get("addPaths");
    },
    transform: function (state, node) {
        var e_1, _a, e_2, _b;
        if (!state.rojoResolver)
            diagnostics_1.Diagnostics.error(node, "addPaths was used but Rojo could not be resolved");
        var importId = state.addFileImport(state.getSourceFile(node), "@easy-games/flamework-core", "Flamework");
        var convertedArguments = [];
        try {
            for (var _c = __values(node.arguments), _d = _c.next(); !_d.done; _d = _c.next()) {
                var arg = _d.value;
                if (!factory_1.f.is.string(arg))
                    diagnostics_1.Diagnostics.error(arg, "Expected string");
                if (glob_1.default.hasMagic(arg.text)) {
                    var paths = glob_1.default.sync("".concat(arg.text, "/"), {
                        root: state.rootDirectory,
                        cwd: state.rootDirectory,
                        nomount: true,
                        nocase: true,
                    });
                    try {
                        for (var paths_1 = (e_2 = void 0, __values(paths)), paths_1_1 = paths_1.next(); !paths_1_1.done; paths_1_1 = paths_1.next()) {
                            var path_2 = paths_1_1.value;
                            var rbxPath = getPathFromSpecifier(state, state.getSourceFile(node), state.rootDirectory, path_2);
                            if (!rbxPath)
                                diagnostics_1.Diagnostics.error(arg, "Could not find rojo data");
                            convertedArguments.push(factory_1.f.array(rbxPath.map(factory_1.f.string)));
                        }
                    }
                    catch (e_2_1) { e_2 = { error: e_2_1 }; }
                    finally {
                        try {
                            if (paths_1_1 && !paths_1_1.done && (_b = paths_1.return)) _b.call(paths_1);
                        }
                        finally { if (e_2) throw e_2.error; }
                    }
                }
                else {
                    var rbxPath = getPathFromSpecifier(state, state.getSourceFile(node), state.rootDirectory, arg.text);
                    if (!rbxPath)
                        diagnostics_1.Diagnostics.error(arg, "Could not find rojo data");
                    convertedArguments.push(factory_1.f.array(rbxPath.map(factory_1.f.string)));
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return factory_1.f.call(factory_1.f.field(importId, "_addPaths"), convertedArguments);
    },
};
//# sourceMappingURL=addPathsMacro.js.map