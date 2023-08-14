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
exports.getUniversalTypeNodeGenerator = void 0;
var typescript_1 = __importDefault(require("typescript"));
var factory_1 = require("../factory");
var FORMAT_FLAGS = (typescript_1.default.TypeFormatFlags.UseFullyQualifiedType | typescript_1.default.TypeFormatFlags.WriteClassExpressionAsTypeLiteral) &
    typescript_1.default.TypeFormatFlags.NodeBuilderFlagsMask;
/**
 * Returns a TypeNode generator that will attempt to create a TypeNode accessible from location.
 * Otherwise, returns undefined.
 */
function getUniversalTypeNodeGenerator(location) {
    var visitingTypes = new Set();
    var prereqs = new Array();
    var prereq = new Map();
    return { generate: generate, prereqs: prereqs };
    function generate(type) {
        var prereqId = prereq.get(type);
        if (prereqId) {
            return factory_1.f.referenceType(prereqId);
        }
        if (visitingTypes.has(type)) {
            // recursive type
            return factory_1.f.referenceType(getPrereq(type));
        }
        visitingTypes.add(type);
        var generatedType = generateInner(type);
        visitingTypes.delete(type);
        if (generatedType) {
            var prereqId_1 = prereq.get(type);
            if (prereqId_1) {
                prereqs.push(factory_1.f.typeAliasDeclaration(prereqId_1, generatedType));
                return factory_1.f.referenceType(prereqId_1);
            }
            return generatedType;
        }
    }
    function generateInner(type) {
        var e_1, _a, e_2, _b;
        var _c;
        if (type.isUnionOrIntersection()) {
            var types = new Array();
            try {
                for (var _d = __values(type.types), _e = _d.next(); !_e.done; _e = _d.next()) {
                    var subtype = _e.value;
                    var typeNode = generate(subtype);
                    if (!typeNode)
                        return;
                    types.push(typeNode);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_e && !_e.done && (_a = _d.return)) _a.call(_d);
                }
                finally { if (e_1) throw e_1.error; }
            }
            return type.isIntersection() ? factory_1.f.intersectionType(types) : factory_1.f.unionType(types);
        }
        var callSignatures = type.getCallSignatures();
        if (callSignatures.length && !type.getProperties().length) {
            var declarations = getCallSignatures(type);
            if (!declarations)
                return;
            return factory_1.f.typeLiteralType(declarations);
        }
        if (type.isLiteral() || type.flags & typescript_1.default.TypeFlags.TemplateLiteral || type.flags & typescript_1.default.TypeFlags.Intrinsic) {
            return type.checker.typeToTypeNode(type, location, undefined);
        }
        if (type.symbol) {
            var accessibility = type.checker.isSymbolAccessible(type.symbol, location, typescript_1.default.SymbolFlags.Type, false);
            if (accessibility.accessibility === typescript_1.default.SymbolAccessibility.Accessible) {
                if (isReferenceType(type)) {
                    var typeArguments = new Array();
                    try {
                        for (var _f = __values((_c = type.resolvedTypeArguments) !== null && _c !== void 0 ? _c : []), _g = _f.next(); !_g.done; _g = _f.next()) {
                            var typeArgument = _g.value;
                            var generatedType = generate(typeArgument);
                            if (!generatedType)
                                return;
                            typeArguments.push(generatedType);
                        }
                    }
                    catch (e_2_1) { e_2 = { error: e_2_1 }; }
                    finally {
                        try {
                            if (_g && !_g.done && (_b = _f.return)) _b.call(_f);
                        }
                        finally { if (e_2) throw e_2.error; }
                    }
                    return getTypeReference(type, typeArguments);
                }
                return getTypeReference(type);
            }
            if (type.isClassOrInterface()) {
                return getUniversalObjectTypeNode(type);
            }
        }
        if (isObjectLiteralType(type)) {
            return getUniversalObjectTypeNode(type);
        }
    }
    function getPrereq(type) {
        var prereqId = prereq.get(type);
        if (!prereqId)
            prereq.set(type, (prereqId = factory_1.f.identifier("typeAlias", true)));
        return prereqId;
    }
    function getUniversalObjectTypeNode(type) {
        var e_3, _a;
        var _b;
        var members = new Array();
        members.push.apply(members, __spreadArray([], __read(((_b = getCallSignatures(type)) !== null && _b !== void 0 ? _b : [])), false));
        try {
            for (var _c = __values(type.getApparentProperties()), _d = _c.next(); !_d.done; _d = _c.next()) {
                var prop = _d.value;
                var propType = type.checker.getTypeOfPropertyOfType(type, prop.name);
                if (!propType)
                    return undefined;
                var universalTypeNode = generate(propType);
                if (!universalTypeNode)
                    return undefined;
                members.push(factory_1.f.propertySignatureType(factory_1.f.string(prop.name), universalTypeNode, propType.checker.isNullableType(propType)));
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
            }
            finally { if (e_3) throw e_3.error; }
        }
        var numberIndexType = type.getNumberIndexType();
        if (numberIndexType) {
            var accessibleType = generate(numberIndexType);
            if (accessibleType) {
                members.push(factory_1.f.indexSignatureType(factory_1.f.keywordType(typescript_1.default.SyntaxKind.NumberKeyword), accessibleType));
            }
        }
        var stringIndexType = type.getStringIndexType();
        if (stringIndexType) {
            var accessibleType = generate(stringIndexType);
            if (accessibleType) {
                members.push(factory_1.f.indexSignatureType(factory_1.f.keywordType(typescript_1.default.SyntaxKind.StringKeyword), accessibleType));
            }
        }
        return factory_1.f.typeLiteralType(members);
    }
    function getCallSignatures(type) {
        var e_4, _a, e_5, _b;
        var signatures = new Array();
        try {
            for (var _c = __values(type.getCallSignatures()), _d = _c.next(); !_d.done; _d = _c.next()) {
                var signature = _d.value;
                var returnTypeNode = generate(signature.getReturnType());
                if (!returnTypeNode)
                    return;
                var parameterDeclarations = new Array();
                if (isMethod(signature, type.checker)) {
                    parameterDeclarations.push(factory_1.f.parameterDeclaration("this", factory_1.f.keywordType(typescript_1.default.SyntaxKind.AnyKeyword)));
                }
                try {
                    for (var _e = (e_5 = void 0, __values(signature.getParameters())), _f = _e.next(); !_f.done; _f = _e.next()) {
                        var parameter = _f.value;
                        var parameterType = type.checker.getTypeOfSymbolAtLocation(parameter, location);
                        var parameterTypeNode = generate(parameterType);
                        if (!parameterTypeNode)
                            return;
                        parameterDeclarations.push(factory_1.f.parameterDeclaration(parameter.name, parameterTypeNode));
                    }
                }
                catch (e_5_1) { e_5 = { error: e_5_1 }; }
                finally {
                    try {
                        if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
                    }
                    finally { if (e_5) throw e_5.error; }
                }
                signatures.push(factory_1.f.callSignatureType(parameterDeclarations, returnTypeNode));
            }
        }
        catch (e_4_1) { e_4 = { error: e_4_1 }; }
        finally {
            try {
                if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
            }
            finally { if (e_4) throw e_4.error; }
        }
        return signatures;
    }
    /**
     * Crawls parent symbols as getAccessibleSymbolChain does not
     */
    function getAccessibleEntityName(symbol, typeChecker) {
        var symbolChain = typeChecker.getAccessibleSymbolChain(symbol, location, typescript_1.default.SymbolFlags.All, false);
        if (symbolChain) {
            return getQualifiedName(symbolChain.map(function (v) { return v.name; }));
        }
        if (symbol.parent) {
            var parentChain = getAccessibleEntityName(symbol.parent, typeChecker);
            if (parentChain) {
                return factory_1.f.qualifiedNameType(parentChain, symbol.name);
            }
        }
    }
    function getTypeReference(type, typeArguments) {
        var accessibleEntityName = getAccessibleEntityName(type.symbol, type.checker);
        var typeNode = type.checker.typeToTypeNode(type, location, FORMAT_FLAGS);
        var isTypeOf = factory_1.f.is.queryType(typeNode) || (factory_1.f.is.importType(typeNode) && typeNode.isTypeOf);
        if (accessibleEntityName) {
            return isTypeOf ? factory_1.f.queryType(accessibleEntityName) : factory_1.f.referenceType(accessibleEntityName, typeArguments);
        }
        else {
            var _a = __read(type.checker.getFullyQualifiedName(type.symbol).split(".")), filePath = _a[0], segments = _a.slice(1);
            var accessibleTypeNode = getQualifiedName(segments);
            return factory_1.f.importType(filePath.substr(1, filePath.length - 2), accessibleTypeNode, isTypeOf, typeArguments);
        }
    }
    function getQualifiedName(segments) {
        if (segments.length === 0)
            return;
        var qualifiedName = factory_1.f.identifier(segments[0]);
        for (var i = segments.length - 1; i > 0; i--) {
            var segment = segments[i];
            qualifiedName = factory_1.f.qualifiedNameType(qualifiedName, segment);
        }
        return qualifiedName;
    }
}
exports.getUniversalTypeNodeGenerator = getUniversalTypeNodeGenerator;
function isMethodDeclaration(node, typeChecker) {
    if (typescript_1.default.isFunctionLike(node)) {
        var thisParam = node.parameters[0];
        if (thisParam && factory_1.f.is.identifier(thisParam.name) && typescript_1.default.isThisIdentifier(thisParam.name)) {
            return !(typeChecker.getTypeAtLocation(thisParam.name).flags & typescript_1.default.TypeFlags.Void);
        }
        else {
            if (typescript_1.default.isMethodDeclaration(node) || typescript_1.default.isMethodSignature(node)) {
                return true;
            }
            return false;
        }
    }
    return false;
}
function isMethod(signature, typeChecker) {
    var _a;
    var thisParameter = (_a = signature.thisParameter) === null || _a === void 0 ? void 0 : _a.valueDeclaration;
    if (thisParameter) {
        if (!(typeChecker.getTypeAtLocation(thisParameter).flags & typescript_1.default.TypeFlags.Void)) {
            return true;
        }
    }
    else if (signature.declaration) {
        if (isMethodDeclaration(signature.declaration, typeChecker)) {
            return true;
        }
    }
    return false;
}
function isObjectLiteralType(type) {
    return !type.isClassOrInterface() && (type.flags & typescript_1.default.TypeFlags.Object) !== 0;
}
function isReferenceType(type) {
    return (typescript_1.default.getObjectFlags(type) & typescript_1.default.ObjectFlags.Reference) !== 0;
}
//# sourceMappingURL=getUniversalTypeNode.js.map