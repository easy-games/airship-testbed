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
exports.transformUserMacro = void 0;
var crypto_1 = require("crypto");
var typescript_1 = __importDefault(require("typescript"));
var diagnostics_1 = require("../classes/diagnostics");
var factory_1 = require("../util/factory");
var buildGuardFromType_1 = require("../util/functions/buildGuardFromType");
var uid_1 = require("../util/uid");
function transformUserMacro(state, node, signature) {
    var args = node.arguments ? __spreadArray([], __read(node.arguments), false) : [];
    var parameters = new Map();
    var highestParameterIndex = -1;
    for (var i = 0; i < signature.parameters.length; i++) {
        var targetParameter = state.typeChecker.getParameterType(signature, i).getNonNullableType();
        var userMacro = getUserMacroOfType(state, targetParameter);
        if (userMacro) {
            parameters.set(i, userMacro);
            highestParameterIndex = Math.max(highestParameterIndex, i);
        }
    }
    for (var i = 0; i <= highestParameterIndex; i++) {
        var userMacro = parameters.get(i);
        if (userMacro && isUndefinedArgument(args[i])) {
            args[i] = buildUserMacro(state, node, userMacro);
        }
        else {
            args[i] = args[i] ? state.transform(args[i]) : factory_1.f.nil();
        }
    }
    if (highestParameterIndex >= 0) {
        if (typescript_1.default.isNewExpression(node)) {
            return typescript_1.default.factory.updateNewExpression(node, state.transformNode(node.expression), node.typeArguments, args);
        }
        else if (typescript_1.default.isCallExpression(node)) {
            return typescript_1.default.factory.updateCallExpression(node, state.transformNode(node.expression), node.typeArguments, args);
        }
        else {
            diagnostics_1.Diagnostics.error(node, "Macro could not be transformed.");
        }
    }
    return state.transform(node);
}
exports.transformUserMacro = transformUserMacro;
function isUndefinedArgument(argument) {
    return argument ? factory_1.f.is.identifier(argument) && argument.text === "undefined" : true;
}
function buildUserMacro(state, node, macro) {
    var members = new Array();
    if (macro.kind === "generic") {
        if (macro.metadata.has("id")) {
            members.push(["id", factory_1.f.string((0, uid_1.getTypeUid)(state, macro.target, node))]);
        }
        if (macro.metadata.has("guard")) {
            members.push(["guard", (0, buildGuardFromType_1.buildGuardFromType)(state, node.getSourceFile(), macro.target)]);
        }
        if (macro.metadata.has("text")) {
            members.push(["text", factory_1.f.string(state.typeChecker.typeToString(macro.target))]);
        }
    }
    else if (macro.kind === "caller") {
        var lineAndCharacter = typescript_1.default.getLineAndCharacterOfPosition(node.getSourceFile(), node.getStart());
        if (macro.metadata.has("line")) {
            members.push(["line", factory_1.f.number(lineAndCharacter.line + 1)]);
        }
        if (macro.metadata.has("character")) {
            members.push(["character", factory_1.f.number(lineAndCharacter.character + 1)]);
        }
        if (macro.metadata.has("width")) {
            members.push(["width", factory_1.f.number(node.getWidth())]);
        }
        if (macro.metadata.has("uuid")) {
            members.push(["uuid", factory_1.f.string((0, crypto_1.randomUUID)())]);
        }
        if (macro.metadata.has("text")) {
            members.push(["text", factory_1.f.string(node.getText())]);
        }
    }
    var modding = state.addFileImport(node.getSourceFile(), "@easy-games/flamework-core", "Modding");
    if (members.length === 1) {
        return factory_1.f.call(factory_1.f.propertyAccessExpression(modding, factory_1.f.identifier("macro")), [members[0][0], members[0][1]]);
    }
    return factory_1.f.call(factory_1.f.propertyAccessExpression(modding, factory_1.f.identifier("macro")), [
        factory_1.f.array(members.map(function (_a) {
            var _b = __read(_a, 2), name = _b[0], value = _b[1];
            return factory_1.f.array([factory_1.f.string(name), value]);
        })),
    ]);
}
function getMetadataFromType(metadataType) {
    var e_1, _a;
    var metadata = new Set();
    try {
        // Metadata is represented as { [k in Metadata]: k } to preserve assignability.
        for (var _b = __values(metadataType.checker.getPropertiesOfType(metadataType)), _c = _b.next(); !_c.done; _c = _b.next()) {
            var property = _c.value;
            metadata.add(property.name);
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return metadata;
}
function getUserMacroOfType(state, targetParameter) {
    var genericMetadata = state.typeChecker.getTypeOfPropertyOfType(targetParameter, "_flamework_macro_generic");
    if (genericMetadata) {
        var targetType = state.typeChecker.getTypeOfPropertyOfType(genericMetadata, "0");
        var metadataType = state.typeChecker.getTypeOfPropertyOfType(genericMetadata, "1");
        if (!targetType)
            return;
        if (!metadataType)
            return;
        var metadata = getMetadataFromType(metadataType);
        if (!metadata)
            return;
        return {
            kind: "generic",
            target: targetType,
            metadata: metadata,
        };
    }
    var callerMetadata = state.typeChecker.getTypeOfPropertyOfType(targetParameter, "_flamework_macro_caller");
    if (callerMetadata) {
        var metadata = getMetadataFromType(callerMetadata);
        if (!metadata)
            return;
        return {
            kind: "caller",
            metadata: metadata,
        };
    }
}
//# sourceMappingURL=transformUserMacro.js.map