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
exports.buildGuardFromType = exports.buildGuardsFromType = void 0;
var typescript_1 = __importDefault(require("typescript"));
var diagnostics_1 = require("../../classes/diagnostics");
var factory_1 = require("../factory");
var getDeclarationOfType_1 = require("./getDeclarationOfType");
var getInstanceTypeFromType_1 = require("./getInstanceTypeFromType");
/**
 * Convert a type into a list of typeguards.
 * @param state The TransformState
 * @param file The file that this type belongs to
 * @param type The type to convert
 * @param isInterfaceType Determines whether unknown should be omitted.
 * @returns An array of property assignments.
 */
function buildGuardsFromType(state, file, type, isInterfaceType) {
    var e_1, _a;
    var _b;
    if (isInterfaceType === void 0) { isInterfaceType = false; }
    var typeChecker = state.typeChecker;
    var diagnosticsLocation = (_b = (0, getDeclarationOfType_1.getDeclarationOfType)(type)) !== null && _b !== void 0 ? _b : file;
    var guards = new Array();
    try {
        for (var _c = __values(type.getProperties()), _d = _c.next(); !_d.done; _d = _c.next()) {
            var property = _d.value;
            var propertyType = typeChecker.getTypeOfPropertyOfType(type, property.name);
            if (!propertyType)
                diagnostics_1.Diagnostics.error(diagnosticsLocation, "Could not find type for field");
            if (isInterfaceType && (propertyType.flags & typescript_1.default.TypeFlags.Unknown) !== 0) {
                continue;
            }
            var attribute = buildGuardFromType(state, file, propertyType);
            guards.push(factory_1.f.propertyAssignmentDeclaration(property.name, attribute));
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return guards;
}
exports.buildGuardsFromType = buildGuardsFromType;
var rbxTypes = [
    "UDim",
    "UDim2",
    "BrickColor",
    "Color3",
    "Vector2",
    "Vector3",
    "NumberSequence",
    "NumberSequenceKeypoint",
    "ColorSequence",
    "ColorSequenceKeypoint",
    "NumberRange",
    "Rect",
    "DockWidgetPluginGuiInfo",
    "CFrame",
    "Axes",
    "Faces",
    "Instance",
    "Ray",
    "Random",
    "Region3",
    "Region3int16",
    "Enum",
    "TweenInfo",
    "PhysicalProperties",
    "Vector3int16",
    "Vector2int16",
    "PathWaypoint",
    "EnumItem",
    "RBXScriptSignal",
    "RBXScriptConnection",
    "thread",
];
/**
 * Convert a type into a type guard.
 * @param state The TransformState
 * @param file The file that this type belongs to
 * @param type The type to convert
 * @returns An array of property assignments.
 */
function buildGuardFromType(state, file, type) {
    var e_2, _a, e_3, _b;
    var _c, _d, _e, _f, _g, _h, _j;
    var typeChecker = state.typeChecker;
    var diagnosticsLocation = (_c = (0, getDeclarationOfType_1.getDeclarationOfType)(type)) !== null && _c !== void 0 ? _c : file;
    var tId = state.addFileImport(file, "@rbxts/t", "t");
    if (type.isUnion()) {
        return buildUnionGuard(state, file, type);
    }
    if (isInstanceType(type)) {
        var instanceType = (0, getInstanceTypeFromType_1.getInstanceTypeFromType)(file, type);
        var additionalGuards = new Array();
        try {
            for (var _k = __values(type.getProperties()), _l = _k.next(); !_l.done; _l = _k.next()) {
                var property = _l.value;
                var propertyType = type.checker.getTypeOfPropertyOfType(type, property.name);
                if (propertyType && !instanceType.getProperty(property.name)) {
                    // assume intersections are children
                    additionalGuards.push(factory_1.f.propertyAssignmentDeclaration(property.name, buildGuardFromType(state, file, propertyType)));
                }
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_l && !_l.done && (_a = _k.return)) _a.call(_k);
            }
            finally { if (e_2) throw e_2.error; }
        }
        var baseGuard = factory_1.f.call(factory_1.f.field(tId, "instanceIsA"), [instanceType.symbol.name]);
        return additionalGuards.length === 0
            ? baseGuard
            : factory_1.f.call(factory_1.f.field(tId, "intersection"), [
                baseGuard,
                factory_1.f.call(factory_1.f.field(tId, "children"), [factory_1.f.object(additionalGuards)]),
            ]);
    }
    if (type.isIntersection()) {
        return buildIntersectionGuard(state, file, type);
    }
    if (isConditionalType(type)) {
        return factory_1.f.call(factory_1.f.field(tId, "union"), [
            buildGuardFromType(state, file, type.resolvedTrueType),
            buildGuardFromType(state, file, type.resolvedFalseType),
        ]);
    }
    if ((type.flags & typescript_1.default.TypeFlags.TypeVariable) !== 0) {
        var constraint = type.checker.getBaseConstraintOfType(type);
        if (!constraint)
            diagnostics_1.Diagnostics.error(diagnosticsLocation, "could not find constraint of type parameter");
        return buildGuardFromType(state, file, constraint);
    }
    if (type.isStringLiteral() || type.isNumberLiteral()) {
        return factory_1.f.call(factory_1.f.field(tId, "literal"), [type.value]);
    }
    if (typeChecker.isTupleType(type)) {
        var typeArgs = (_d = type.resolvedTypeArguments) !== null && _d !== void 0 ? _d : [];
        return factory_1.f.call(factory_1.f.field(tId, "strictArray"), typeArgs.map(function (x) { return buildGuardFromType(state, file, x); }));
    }
    if (typeChecker.isArrayType(type)) {
        var typeArg = (_e = type.typeArguments) === null || _e === void 0 ? void 0 : _e[0];
        return factory_1.f.call(factory_1.f.field(tId, "array"), [
            typeArg ? buildGuardFromType(state, file, typeArg) : factory_1.f.field(tId, "any"),
        ]);
    }
    if (type.getCallSignatures().length > 0) {
        return factory_1.f.field(tId, "callback");
    }
    var voidType = typeChecker.getVoidType();
    var undefinedType = typeChecker.getUndefinedType();
    if (type === voidType || type === undefinedType) {
        return factory_1.f.field(tId, "none");
    }
    var anyType = typeChecker.getAnyType();
    if (type === anyType) {
        return factory_1.f.field(tId, "any");
    }
    var trueType = typeChecker.getTrueType();
    if (type === trueType) {
        return factory_1.f.call(factory_1.f.field(tId, "literal"), [true]);
    }
    var falseType = typeChecker.getFalseType();
    if (type === falseType) {
        return factory_1.f.call(factory_1.f.field(tId, "literal"), [false]);
    }
    var stringType = typeChecker.getStringType();
    if (type === stringType) {
        return factory_1.f.field(tId, "string");
    }
    var numberType = typeChecker.getNumberType();
    if (type === numberType) {
        return factory_1.f.field(tId, "number");
    }
    if ((type.flags & typescript_1.default.TypeFlags.Unknown) !== 0) {
        return factory_1.f.call(factory_1.f.field(tId, "union"), [factory_1.f.field(tId, "any"), factory_1.f.field(tId, "none")]);
    }
    var symbol = type.getSymbol();
    if (!symbol)
        diagnostics_1.Diagnostics.error(diagnosticsLocation, "Attribute type has no symbol");
    var enumType = type.checker.resolveName("Enum", undefined, typescript_1.default.SymbolFlags.Type, false);
    if (((_f = symbol.parent) === null || _f === void 0 ? void 0 : _f.parent) && type.checker.getMergedSymbol(symbol.parent.parent) === enumType) {
        return factory_1.f.call(factory_1.f.field(tId, "literal"), [factory_1.f.field(factory_1.f.field("Enum", symbol.parent.name), symbol.name)]);
    }
    var mapSymbol = typeChecker.resolveName("Map", undefined, typescript_1.default.SymbolFlags.Type, false);
    var readonlyMapSymbol = typeChecker.resolveName("ReadonlyMap", undefined, typescript_1.default.SymbolFlags.Type, false);
    var weakMapSymbol = typeChecker.resolveName("WeakMap", undefined, typescript_1.default.SymbolFlags.Type, false);
    if (symbol === mapSymbol || symbol === readonlyMapSymbol || symbol === weakMapSymbol) {
        var keyType = (_g = type.typeArguments) === null || _g === void 0 ? void 0 : _g[0];
        var valueType = (_h = type.typeArguments) === null || _h === void 0 ? void 0 : _h[1];
        return factory_1.f.call(factory_1.f.field(tId, "map"), [
            keyType ? buildGuardFromType(state, file, keyType) : factory_1.f.field(tId, "any"),
            valueType ? buildGuardFromType(state, file, valueType) : factory_1.f.field(tId, "any"),
        ]);
    }
    var setSymbol = typeChecker.resolveName("Set", undefined, typescript_1.default.SymbolFlags.Type, false);
    var readonlySetSymbol = typeChecker.resolveName("ReadonlySet", undefined, typescript_1.default.SymbolFlags.Type, false);
    if (symbol === setSymbol || symbol === readonlySetSymbol) {
        var valueType = (_j = type.typeArguments) === null || _j === void 0 ? void 0 : _j[0];
        return factory_1.f.call(factory_1.f.field(tId, "set"), [
            valueType ? buildGuardFromType(state, file, valueType) : factory_1.f.field(tId, "any"),
        ]);
    }
    var promiseSymbol = typeChecker.resolveName("Promise", undefined, typescript_1.default.SymbolFlags.Type, false);
    if (symbol === promiseSymbol) {
        return factory_1.f.field("Promise", "is");
    }
    try {
        for (var rbxTypes_1 = __values(rbxTypes), rbxTypes_1_1 = rbxTypes_1.next(); !rbxTypes_1_1.done; rbxTypes_1_1 = rbxTypes_1.next()) {
            var guard = rbxTypes_1_1.value;
            var guardSymbol = typeChecker.resolveName(guard, undefined, typescript_1.default.SymbolFlags.Type, false);
            if (!guardSymbol)
                diagnostics_1.Diagnostics.error(diagnosticsLocation, "Could not find symbol for ".concat(guard));
            if (symbol === guardSymbol) {
                return factory_1.f.field(tId, guard);
            }
        }
    }
    catch (e_3_1) { e_3 = { error: e_3_1 }; }
    finally {
        try {
            if (rbxTypes_1_1 && !rbxTypes_1_1.done && (_b = rbxTypes_1.return)) _b.call(rbxTypes_1);
        }
        finally { if (e_3) throw e_3.error; }
    }
    if (type.isClass()) {
        diagnostics_1.Diagnostics.error(diagnosticsLocation, "Invalid type: class");
    }
    var isObject = isObjectType(type);
    var indexInfos = type.checker.getIndexInfosOfType(type);
    if (isObject && type.getApparentProperties().length === 0 && indexInfos.length === 0) {
        return factory_1.f.field(tId, "any");
    }
    if (isObject || type.isClassOrInterface()) {
        var guards = [];
        if (type.getApparentProperties().length > 0) {
            guards.push(factory_1.f.call(factory_1.f.field(tId, "interface"), [factory_1.f.object(buildGuardsFromType(state, file, type, true))]));
        }
        var indexInfo = indexInfos[0];
        if (indexInfo) {
            if (indexInfos.length > 1) {
                diagnostics_1.Diagnostics.error(diagnosticsLocation, "Flamework cannot generate types with multiple index signatures.");
            }
            guards.push(factory_1.f.call(factory_1.f.field(tId, "map"), [
                buildGuardFromType(state, file, indexInfo.keyType),
                buildGuardFromType(state, file, indexInfo.type),
            ]));
        }
        return guards.length > 1 ? factory_1.f.call(factory_1.f.field(tId, "intersection"), guards) : guards[0];
    }
    diagnostics_1.Diagnostics.error(diagnosticsLocation, "Invalid type: ".concat(typeChecker.typeToString(type)));
}
exports.buildGuardFromType = buildGuardFromType;
function buildUnionGuard(state, file, type) {
    var tId = state.addFileImport(file, "@rbxts/t", "t");
    var boolType = type.checker.getBooleanType();
    if (type === boolType) {
        return factory_1.f.field(tId, "boolean");
    }
    var _a = simplifyUnion(type), enums = _a.enums, simplifiedTypes = _a.types;
    var _b = __read(extractTypes(type.checker, simplifiedTypes), 2), isOptional = _b[0], types = _b[1];
    var guards = types.map(function (type) { return buildGuardFromType(state, file, type); });
    guards.push.apply(guards, __spreadArray([], __read(enums.map(function (enumId) { return factory_1.f.call(factory_1.f.field(tId, "enum"), [factory_1.f.field("Enum", enumId)]); })), false));
    var union = guards.length > 1 ? factory_1.f.call(factory_1.f.field(tId, "union"), guards) : guards[0];
    if (!union)
        return factory_1.f.field(tId, "none");
    return isOptional ? factory_1.f.call(factory_1.f.field(tId, "optional"), [union]) : union;
}
function buildIntersectionGuard(state, file, type) {
    var _a;
    var tId = state.addFileImport(file, "@rbxts/t", "t");
    if (type.checker.getIndexInfosOfType(type).length > 1) {
        diagnostics_1.Diagnostics.error((_a = (0, getDeclarationOfType_1.getDeclarationOfType)(type)) !== null && _a !== void 0 ? _a : file, "Flamework cannot generate intersections with multiple index signatures.");
    }
    var guards = type.types.map(function (x) { return buildGuardFromType(state, file, x); });
    return factory_1.f.call(factory_1.f.field(tId, "intersection"), guards);
}
function simplifyUnion(type) {
    var e_4, _a, e_5, _b;
    var _c, _d;
    var enumType = type.checker.resolveName("Enum", undefined, typescript_1.default.SymbolFlags.Type, false);
    if (type.aliasSymbol &&
        type.aliasSymbol.parent &&
        type.checker.getMergedSymbol(type.aliasSymbol.parent) === enumType) {
        return { enums: [type.aliasSymbol.name], types: [] };
    }
    var currentTypes = type.types;
    var possibleEnums = new Map();
    var enums = new Array();
    var types = new Array();
    try {
        for (var currentTypes_1 = __values(currentTypes), currentTypes_1_1 = currentTypes_1.next(); !currentTypes_1_1.done; currentTypes_1_1 = currentTypes_1.next()) {
            var type_1 = currentTypes_1_1.value;
            // We do not need to generate symbol types as they don't exist in Lua.
            if (type_1.flags & typescript_1.default.TypeFlags.ESSymbolLike) {
                continue;
            }
            if (!type_1.symbol || !type_1.symbol.parent) {
                types.push(type_1);
                continue;
            }
            var enumKind = type_1.symbol.parent;
            if (!enumKind || !enumKind.parent || type_1.checker.getMergedSymbol(enumKind.parent) !== enumType) {
                types.push(type_1);
                continue;
            }
            if (type_1.symbol === ((_c = enumKind.exports) === null || _c === void 0 ? void 0 : _c.get(type_1.symbol.escapedName))) {
                var enumValues = possibleEnums.get(enumKind);
                if (!enumValues)
                    possibleEnums.set(enumKind, (enumValues = new Set()));
                enumValues.add(type_1);
            }
        }
    }
    catch (e_4_1) { e_4 = { error: e_4_1 }; }
    finally {
        try {
            if (currentTypes_1_1 && !currentTypes_1_1.done && (_a = currentTypes_1.return)) _a.call(currentTypes_1);
        }
        finally { if (e_4) throw e_4.error; }
    }
    try {
        for (var possibleEnums_1 = __values(possibleEnums), possibleEnums_1_1 = possibleEnums_1.next(); !possibleEnums_1_1.done; possibleEnums_1_1 = possibleEnums_1.next()) {
            var _e = __read(possibleEnums_1_1.value, 2), symbol = _e[0], set = _e[1];
            // Add 1 to account for GetEnumItems()
            if (set.size + 1 === ((_d = symbol.exports) === null || _d === void 0 ? void 0 : _d.size)) {
                enums.push(symbol.name);
            }
            else {
                types.push.apply(types, __spreadArray([], __read(set), false));
            }
        }
    }
    catch (e_5_1) { e_5 = { error: e_5_1 }; }
    finally {
        try {
            if (possibleEnums_1_1 && !possibleEnums_1_1.done && (_b = possibleEnums_1.return)) _b.call(possibleEnums_1);
        }
        finally { if (e_5) throw e_5.error; }
    }
    return { enums: enums, types: types };
}
function extractTypes(typeChecker, types) {
    var undefinedtype = typeChecker.getUndefinedType();
    var voidType = typeChecker.getVoidType();
    return [
        types.some(function (type) { return type === undefinedtype || type === voidType; }),
        types.filter(function (type) { return type !== undefinedtype && type !== voidType; }),
    ];
}
function isObjectType(type) {
    return (type.flags & typescript_1.default.TypeFlags.Object) !== 0;
}
function isInstanceType(type) {
    return type.getProperty("_nominal_Instance") !== undefined;
}
function isConditionalType(type) {
    return (type.flags & typescript_1.default.TypeFlags.Conditional) !== 0;
}
//# sourceMappingURL=buildGuardFromType.js.map