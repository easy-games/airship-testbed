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
exports.getInstanceTypeFromType = void 0;
var typescript_1 = __importDefault(require("typescript"));
var diagnostics_1 = require("../../classes/diagnostics");
var assert_1 = require("./assert");
var getDeclarationOfType_1 = require("./getDeclarationOfType");
function getInstanceTypeFromType(file, type) {
    var e_1, _a, e_2, _b;
    var _c, _d, _e;
    (0, assert_1.assert)(type.getProperty("_nominal_Instance"), "non instance type was passed into getInstanceTypeFromType");
    var diagnosticsLocation = (_c = (0, getDeclarationOfType_1.getDeclarationOfType)(type)) !== null && _c !== void 0 ? _c : file;
    var nominalProperties = getNominalProperties(type);
    var specificType = type, specificTypeCount = 0;
    try {
        for (var nominalProperties_1 = __values(nominalProperties), nominalProperties_1_1 = nominalProperties_1.next(); !nominalProperties_1_1.done; nominalProperties_1_1 = nominalProperties_1.next()) {
            var property = nominalProperties_1_1.value;
            var noNominalName = (_d = /_nominal_(.*)/.exec(property.name)) === null || _d === void 0 ? void 0 : _d[1];
            (0, assert_1.assert)(noNominalName);
            var instanceSymbol = type.checker.resolveName(noNominalName, undefined, typescript_1.default.SymbolFlags.Type, false);
            if (!instanceSymbol)
                continue;
            var instanceDeclaration = (_e = instanceSymbol.declarations) === null || _e === void 0 ? void 0 : _e[0];
            if (!instanceDeclaration)
                continue;
            var instanceType = type.checker.getTypeAtLocation(instanceDeclaration);
            var subNominalProperties = getNominalProperties(instanceType);
            if (subNominalProperties.length > specificTypeCount) {
                specificType = instanceType;
                specificTypeCount = subNominalProperties.length;
            }
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (nominalProperties_1_1 && !nominalProperties_1_1.done && (_a = nominalProperties_1.return)) _a.call(nominalProperties_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    try {
        // intersection between two nominal types?
        for (var nominalProperties_2 = __values(nominalProperties), nominalProperties_2_1 = nominalProperties_2.next(); !nominalProperties_2_1.done; nominalProperties_2_1 = nominalProperties_2.next()) {
            var property = nominalProperties_2_1.value;
            if (!specificType.getProperty(property.name)) {
                diagnostics_1.Diagnostics.error(diagnosticsLocation, "Intersection between nominal types is forbidden.");
            }
        }
    }
    catch (e_2_1) { e_2 = { error: e_2_1 }; }
    finally {
        try {
            if (nominalProperties_2_1 && !nominalProperties_2_1.done && (_b = nominalProperties_2.return)) _b.call(nominalProperties_2);
        }
        finally { if (e_2) throw e_2.error; }
    }
    return specificType;
}
exports.getInstanceTypeFromType = getInstanceTypeFromType;
function getNominalProperties(type) {
    return type.getProperties().filter(function (x) { return x.name.startsWith("_nominal_"); });
}
//# sourceMappingURL=getInstanceTypeFromType.js.map