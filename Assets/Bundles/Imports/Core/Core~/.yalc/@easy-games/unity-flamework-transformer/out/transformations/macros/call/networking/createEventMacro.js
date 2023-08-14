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
Object.defineProperty(exports, "__esModule", { value: true });
exports.NetworkingCreateEventMacro = void 0;
var diagnostics_1 = require("../../../../classes/diagnostics");
var factory_1 = require("../../../../util/factory");
var buildGuardFromType_1 = require("../../../../util/functions/buildGuardFromType");
var uid_1 = require("../../../../util/uid");
exports.NetworkingCreateEventMacro = {
    getSymbol: function (state) {
        if (!state.symbolProvider.networking)
            return [];
        return [
            state.symbolProvider.networking.get("createEvent"),
            state.symbolProvider.networking.get("createFunction"),
        ];
    },
    transform: function (state, node, macro) {
        var _a, _b;
        var file = state.getSourceFile(node);
        var signature = state.typeChecker.getResolvedSignature(node);
        var serverTypeArg = (_a = node.typeArguments) === null || _a === void 0 ? void 0 : _a[0];
        var clientTypeArg = (_b = node.typeArguments) === null || _b === void 0 ? void 0 : _b[1];
        if (!serverTypeArg)
            diagnostics_1.Diagnostics.error(node, "Missing ServerType type argument");
        if (!clientTypeArg)
            diagnostics_1.Diagnostics.error(node, "Missing ClientType type argument");
        if (!signature)
            diagnostics_1.Diagnostics.error(node, "Signature could not be resolved");
        var serverType = state.typeChecker.getTypeAtLocation(serverTypeArg);
        var clientType = state.typeChecker.getTypeAtLocation(clientTypeArg);
        if (!serverType)
            diagnostics_1.Diagnostics.error(serverTypeArg, "Could not get type");
        if (!clientType)
            diagnostics_1.Diagnostics.error(clientTypeArg, "Could not get type");
        var parentDeclaration = node.parent;
        if (!factory_1.f.is.namedDeclaration(parentDeclaration))
            return diagnostics_1.Diagnostics.error(node, "Must be under a declaration.");
        var convertTypeToGuardArray = function (type, source, generateReturn) {
            var e_1, _a, e_2, _b;
            var _c, _d, _e;
            if (generateReturn === void 0) { generateReturn = false; }
            var assignments = new Array();
            try {
                for (var _f = __values(type.getProperties()), _g = _f.next(); !_g.done; _g = _f.next()) {
                    var prop = _g.value;
                    var propType = state.typeChecker.getTypeOfPropertyOfType(type, prop.name);
                    if (!propType)
                        diagnostics_1.Diagnostics.error(source, "Could not get property type ".concat(prop.name));
                    var propSource = (_e = (_c = prop.valueDeclaration) !== null && _c !== void 0 ? _c : (_d = prop.declarations) === null || _d === void 0 ? void 0 : _d[0]) !== null && _e !== void 0 ? _e : source;
                    var callSignature = propType.getCallSignatures()[0];
                    if (!callSignature)
                        diagnostics_1.Diagnostics.error(propSource, "This type does not have a call signature");
                    var guards = new Array();
                    try {
                        for (var _h = (e_2 = void 0, __values(callSignature.parameters)), _j = _h.next(); !_j.done; _j = _h.next()) {
                            var param = _j.value;
                            var paramType = state.typeChecker.getTypeOfSymbolAtLocation(param, node);
                            guards.push((0, buildGuardFromType_1.buildGuardFromType)(state, file, paramType));
                        }
                    }
                    catch (e_2_1) { e_2 = { error: e_2_1 }; }
                    finally {
                        try {
                            if (_j && !_j.done && (_b = _h.return)) _b.call(_h);
                        }
                        finally { if (e_2) throw e_2.error; }
                    }
                    assignments.push(factory_1.f.propertyAssignmentDeclaration(state.obfuscateText(prop.name, "remotes"), generateReturn
                        ? [guards, (0, buildGuardFromType_1.buildGuardFromType)(state, file, callSignature.getReturnType())]
                        : guards));
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_g && !_g.done && (_a = _f.return)) _a.call(_f);
                }
                finally { if (e_1) throw e_1.error; }
            }
            return assignments;
        };
        var isFunction = macro.symbol === macro.symbols[1];
        var networkingPath = isFunction ? "functions" : "events";
        var networkingCreateName = isFunction ? "createNetworkingFunction" : "createNetworkingEvent";
        var createNetworkingEvent = state.addFileImport(file, "@easy-games/flamework-networking/out/".concat(networkingPath, "/").concat(networkingCreateName), networkingCreateName);
        var obfuscatedServerTypeArg = createObfuscatedType(state, serverTypeArg, serverType);
        var obfuscatedClientTypeArg = createObfuscatedType(state, clientTypeArg, clientType);
        return factory_1.f.update.call(node, createNetworkingEvent, __spreadArray([
            (0, uid_1.getNodeUid)(state, parentDeclaration),
            factory_1.f.object(convertTypeToGuardArray(serverType, serverTypeArg, isFunction)),
            factory_1.f.object(convertTypeToGuardArray(clientType, clientTypeArg, isFunction))
        ], __read(obfuscateMiddleware(state, node.arguments)), false), [obfuscatedServerTypeArg, obfuscatedClientTypeArg]);
    },
};
function obfuscateMiddleware(state, args) {
    var e_3, _a;
    var newArgs = new Array();
    try {
        for (var args_1 = __values(args), args_1_1 = args_1.next(); !args_1_1.done; args_1_1 = args_1.next()) {
            var expression = args_1_1.value;
            if (factory_1.f.is.object(expression)) {
                newArgs.push(factory_1.f.update.object(expression, expression.properties.map(function (prop) {
                    if (factory_1.f.is.propertyAssignmentDeclaration(prop) && "text" in prop.name) {
                        return factory_1.f.update.propertyAssignmentDeclaration(prop, prop.initializer, factory_1.f.string(state.obfuscateText(prop.name.text, "remotes")));
                    }
                    return prop;
                })));
            }
            else {
                newArgs.push(expression);
            }
        }
    }
    catch (e_3_1) { e_3 = { error: e_3_1 }; }
    finally {
        try {
            if (args_1_1 && !args_1_1.done && (_a = args_1.return)) _a.call(args_1);
        }
        finally { if (e_3) throw e_3.error; }
    }
    return newArgs;
}
function createObfuscatedType(state, originType, node) {
    return state.config.obfuscation
        ? factory_1.f.typeLiteralType(node
            .getProperties()
            .map(function (x) {
            return factory_1.f.propertySignatureType(factory_1.f.string(state.obfuscateText(x.name, "remotes")), factory_1.f.indexedAccessType(originType, factory_1.f.literalType(factory_1.f.string(x.name))));
        }))
        : originType;
}
//# sourceMappingURL=createEventMacro.js.map