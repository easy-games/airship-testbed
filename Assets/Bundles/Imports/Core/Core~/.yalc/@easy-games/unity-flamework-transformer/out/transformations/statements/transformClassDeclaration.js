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
exports.transformClassDeclaration = void 0;
var assert_1 = __importDefault(require("assert"));
var typescript_1 = __importDefault(require("typescript"));
var diagnostics_1 = require("../../classes/diagnostics");
var logger_1 = require("../../classes/logger");
var nodeMetadata_1 = require("../../classes/nodeMetadata");
var factory_1 = require("../../util/factory");
var buildGuardFromType_1 = require("../../util/functions/buildGuardFromType");
var getSuperClasses_1 = require("../../util/functions/getSuperClasses");
var uid_1 = require("../../util/uid");
function transformClassDeclaration(state, node) {
    var e_1, _a, e_2, _b, e_3, _c;
    var symbol = state.getSymbol(node);
    if (!symbol || !node.name)
        return state.transform(node);
    var classInfo = state.classes.get(symbol);
    if (!classInfo)
        return state.transform(node);
    var fields = [];
    var metadata = new nodeMetadata_1.NodeMetadata(state, node);
    var identifier = (0, uid_1.getNodeUid)(state, node);
    // Logger.writeLine("srcDir=" + state.srcDir + " identifier=" + identifier);
    // if (state.srcDir.includes(path.join("Assets", "Bundles", "Imports"))) {
    // 	const split = state.srcDir.split(path.sep);
    // 	const packageName = split[split.length - 2];
    // 	identifier = packageName + ":" + identifier;
    // }
    fields.push(["identifier", identifier]);
    var constructor = node.members.find(function (x) { return factory_1.f.is.constructor(x); });
    if (constructor) {
        fields.push.apply(fields, __spreadArray([], __read(generateMethodMetadata(state, metadata, constructor)), false));
    }
    if (node.heritageClauses) {
        var implementClauses = new Array();
        try {
            for (var _d = __values(node.heritageClauses), _e = _d.next(); !_e.done; _e = _d.next()) {
                var clause = _e.value;
                if (clause.token !== typescript_1.default.SyntaxKind.ImplementsKeyword)
                    continue;
                try {
                    for (var _f = (e_2 = void 0, __values(clause.types)), _g = _f.next(); !_g.done; _g = _f.next()) {
                        var type = _g.value;
                        var id = (0, uid_1.getNodeUid)(state, type);
                        logger_1.Logger.writeLine("id: " + id);
                        if (id.includes("flamework.d.ts@OnStart")) {
                            id = "$:flamework@OnStart";
                        }
                        implementClauses.push(factory_1.f.string(id));
                    }
                }
                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                finally {
                    try {
                        if (_g && !_g.done && (_b = _f.return)) _b.call(_f);
                    }
                    finally { if (e_2) throw e_2.error; }
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
        if (implementClauses.length > 0 && metadata.isRequested("flamework:implements")) {
            fields.push(["flamework:implements", factory_1.f.array(implementClauses, false)]);
        }
    }
    var importIdentifier = state.addFileImport(state.getSourceFile(node), "@easy-games/flamework-core", "Reflect");
    var realFields = fields.map(function (_a) {
        var _b = __read(_a, 2), name = _b[0], value = _b[1];
        return factory_1.f.statement(factory_1.f.call(factory_1.f.field(importIdentifier, "defineMetadata"), [node.name, name, value]));
    });
    realFields.push.apply(realFields, __spreadArray([], __read(getDecoratorFields(state, node, node, metadata)), false));
    try {
        for (var _h = __values(node.members), _j = _h.next(); !_j.done; _j = _h.next()) {
            var member = _j.value;
            if (!factory_1.f.is.methodDeclaration(member) || member.body) {
                realFields.push.apply(realFields, __spreadArray([], __read(getDecoratorFields(state, node, member)), false));
            }
        }
    }
    catch (e_3_1) { e_3 = { error: e_3_1 }; }
    finally {
        try {
            if (_j && !_j.done && (_c = _h.return)) _c.call(_h);
        }
        finally { if (e_3) throw e_3.error; }
    }
    typescript_1.default.addSyntheticLeadingComment(realFields[0], typescript_1.default.SyntaxKind.SingleLineCommentTrivia, "(Flamework) ".concat(node.name.text, " metadata"));
    return __spreadArray([updateClass(state, node)], __read(realFields), false);
}
exports.transformClassDeclaration = transformClassDeclaration;
function generateFieldMetadata(state, metadata, field) {
    var _a;
    var fields = new Array();
    var type = state.typeChecker.getTypeAtLocation(field);
    if (metadata.isRequested("flamework:type")) {
        if (!field.type) {
            var id = (0, uid_1.getTypeUid)(state, type, (_a = field.name) !== null && _a !== void 0 ? _a : field);
            fields.push(["flamework:type", id]);
        }
        else {
            var id = (0, uid_1.getNodeUid)(state, field.type);
            fields.push(["flamework:type", id]);
        }
    }
    if (metadata.isRequested("flamework:guard")) {
        var guard = (0, buildGuardFromType_1.buildGuardFromType)(state, state.getSourceFile(field), type);
        fields.push(["flamework:guard", guard]);
    }
    return fields;
}
function generateMethodMetadata(state, metadata, method) {
    var e_4, _a;
    var _b;
    var fields = new Array();
    var baseSignature = state.typeChecker.getSignatureFromDeclaration(method);
    if (!baseSignature)
        return [];
    if (metadata.isRequested("flamework:return_type")) {
        if (!method.type) {
            var id = (0, uid_1.getTypeUid)(state, baseSignature.getReturnType(), (_b = method.name) !== null && _b !== void 0 ? _b : method);
            fields.push(["flamework:return_type", id]);
        }
        else {
            var id = (0, uid_1.getNodeUid)(state, method.type);
            fields.push(["flamework:return_type", id]);
        }
    }
    if (metadata.isRequested("flamework:return_guard")) {
        var guard = (0, buildGuardFromType_1.buildGuardFromType)(state, state.getSourceFile(method), baseSignature.getReturnType());
        fields.push(["flamework:return_guard", guard]);
    }
    var parameters = new Array();
    var parameterNames = new Array();
    var parameterGuards = new Array();
    try {
        for (var _c = __values(method.parameters), _d = _c.next(); !_d.done; _d = _c.next()) {
            var parameter = _d.value;
            if (metadata.isRequested("flamework:parameters")) {
                if (parameter.type) {
                    var id = (0, uid_1.getNodeUid)(state, parameter.type);
                    parameters.push(id);
                }
                else {
                    var type = state.typeChecker.getTypeAtLocation(parameter);
                    var id = (0, uid_1.getTypeUid)(state, type, parameter);
                    parameters.push(id);
                }
            }
            if (metadata.isRequested("flamework:parameter_names")) {
                if (factory_1.f.is.identifier(parameter.name)) {
                    parameterNames.push(parameter.name.text);
                }
                else {
                    parameterNames.push("_binding_");
                }
            }
            if (metadata.isRequested("flamework:parameter_guards")) {
                var type = state.typeChecker.getTypeAtLocation(parameter);
                var guard = (0, buildGuardFromType_1.buildGuardFromType)(state, state.getSourceFile(method), type);
                parameterGuards.push(guard);
            }
        }
    }
    catch (e_4_1) { e_4 = { error: e_4_1 }; }
    finally {
        try {
            if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
        }
        finally { if (e_4) throw e_4.error; }
    }
    if (parameters.length > 0) {
        fields.push(["flamework:parameters", parameters]);
    }
    if (parameterNames.length > 0) {
        fields.push(["flamework:parameter_names", parameterNames]);
    }
    if (parameterGuards.length > 0) {
        fields.push(["flamework:parameter_guards", parameterGuards]);
    }
    return fields;
}
function transformDecoratorConfig(state, declaration, symbol, expr) {
    var _a;
    if (!factory_1.f.is.call(expr))
        return [];
    if (symbol === ((_a = state.symbolProvider.componentsFile) === null || _a === void 0 ? void 0 : _a.get("Component"))) {
        (0, assert_1.default)(!expr.arguments[0] || factory_1.f.is.object(expr.arguments[0]));
        var baseConfig = expr.arguments[0] ? expr.arguments[0] : factory_1.f.object([]);
        return [factory_1.f.update.object(baseConfig, updateComponentConfig(state, declaration, __spreadArray([], __read(baseConfig.properties), false)))];
    }
    return expr.arguments;
}
function getDecoratorFields(state, declaration, node, metadata) {
    var e_5, _a, e_6, _b;
    var _c;
    if (metadata === void 0) { metadata = new nodeMetadata_1.NodeMetadata(state, node); }
    if (!node.name)
        return [];
    var symbol = state.getSymbol(node.name);
    var propertyName = typescript_1.default.getNameFromPropertyName(node.name);
    (0, assert_1.default)(propertyName);
    (0, assert_1.default)(symbol);
    var importIdentifier = state.addFileImport(state.getSourceFile(node), "@easy-games/flamework-core", "Reflect");
    var decoratorStatements = new Array();
    var generatedMetadata;
    if (factory_1.f.is.methodDeclaration(node)) {
        generatedMetadata = generateMethodMetadata(state, metadata, node);
    }
    else if (factory_1.f.is.propertyDeclaration(node)) {
        generatedMetadata = generateFieldMetadata(state, metadata, node);
    }
    if (generatedMetadata) {
        decoratorStatements.push.apply(decoratorStatements, __spreadArray([], __read(generatedMetadata.map(function (_a) {
            var _b = __read(_a, 2), name = _b[0], value = _b[1];
            return factory_1.f.statement(factory_1.f.call(factory_1.f.field(importIdentifier, "defineMetadata"), [declaration.name, name, value, propertyName]));
        })), false));
    }
    var decorators = typescript_1.default.canHaveDecorators(node) ? typescript_1.default.getDecorators(node) : undefined;
    if (decorators) {
        try {
            for (var decorators_1 = __values(decorators), decorators_1_1 = decorators_1.next(); !decorators_1_1.done; decorators_1_1 = decorators_1.next()) {
                var decorator = decorators_1_1.value;
                var expr = decorator.expression;
                var type = state.typeChecker.getTypeAtLocation(expr);
                if (type.getProperty("_flamework_Decorator")) {
                    var identifier = factory_1.f.is.call(expr) ? expr.expression : expr;
                    var symbol_1 = state.getSymbol(identifier);
                    (0, assert_1.default)(symbol_1);
                    (0, assert_1.default)(symbol_1.valueDeclaration);
                    var args = transformDecoratorConfig(state, declaration, symbol_1, expr);
                    var propertyArgs = !factory_1.f.is.classDeclaration(node)
                        ? [propertyName, (node.modifierFlagsCache & typescript_1.default.ModifierFlags.Static) !== 0]
                        : [];
                    var symbolId = (0, uid_1.getSymbolUid)(state, symbol_1, identifier);
                    if (symbolId.includes("flamework.d.ts@Service")) {
                        symbolId = "$:flamework@Service";
                    }
                    else if (symbolId.includes("flamework.d.ts@Controller")) {
                        symbolId = "$:flamework@Controller";
                    }
                    decoratorStatements.push(factory_1.f.statement(factory_1.f.call(factory_1.f.field(importIdentifier, "decorate"), __spreadArray([
                        declaration.name,
                        symbolId,
                        identifier,
                        __spreadArray([], __read(args), false)
                    ], __read(propertyArgs), false))));
                }
            }
        }
        catch (e_5_1) { e_5 = { error: e_5_1 }; }
        finally {
            try {
                if (decorators_1_1 && !decorators_1_1.done && (_a = decorators_1.return)) _a.call(decorators_1);
            }
            finally { if (e_5) throw e_5.error; }
        }
    }
    if (decoratorStatements[0] && !factory_1.f.is.classDeclaration(node)) {
        typescript_1.default.addSyntheticLeadingComment(decoratorStatements[0], typescript_1.default.SyntaxKind.SingleLineCommentTrivia, "(Flamework) ".concat(declaration.name.text, ".").concat(propertyName, " metadata"));
    }
    var constraintTypes = metadata.getType("constraint");
    var nodeType = state.typeChecker.getTypeOfSymbolAtLocation(symbol, node);
    try {
        for (var _d = __values(constraintTypes !== null && constraintTypes !== void 0 ? constraintTypes : []), _e = _d.next(); !_e.done; _e = _d.next()) {
            var constraintType = _e.value;
            if (!state.typeChecker.isTypeAssignableTo(nodeType, constraintType)) {
                diagnostics_1.Diagnostics.addDiagnostic(getAssignabilityDiagnostics((_c = node.name) !== null && _c !== void 0 ? _c : node, nodeType, constraintType, metadata.getTrace(constraintType)));
            }
        }
    }
    catch (e_6_1) { e_6 = { error: e_6_1 }; }
    finally {
        try {
            if (_e && !_e.done && (_b = _d.return)) _b.call(_d);
        }
        finally { if (e_6) throw e_6.error; }
    }
    return decoratorStatements;
}
function formatType(type) {
    var typeNode = type.checker.typeToTypeNode(type, undefined, typescript_1.default.NodeBuilderFlags.InTypeAlias | typescript_1.default.NodeBuilderFlags.IgnoreErrors);
    var printer = typescript_1.default.createPrinter();
    return printer.printNode(typescript_1.default.EmitHint.Unspecified, typeNode, undefined);
}
function getAssignabilityDiagnostics(node, sourceType, constraintType, trace) {
    var diagnostic = diagnostics_1.Diagnostics.createDiagnostic(node, typescript_1.default.DiagnosticCategory.Error, "Type '".concat(formatType(sourceType), "' does not satify constraint '").concat(formatType(constraintType), "'"));
    if (trace) {
        typescript_1.default.addRelatedInfo(diagnostic, diagnostics_1.Diagnostics.createDiagnostic(trace, typescript_1.default.DiagnosticCategory.Message, "The constraint is defined here."));
    }
    return diagnostic;
}
function updateClass(state, node) {
    var modifiers = typescript_1.default.canHaveModifiers(node) ? typescript_1.default.getModifiers(node) : undefined;
    return factory_1.f.update.classDeclaration(node, node.name ? state.transformNode(node.name) : undefined, node.members
        .map(function (node) { return state.transformNode(node); })
        .map(function (member) {
        // Strip Flamework decorators from members
        var memberDecorators = typescript_1.default.canHaveDecorators(member) ? typescript_1.default.getDecorators(member) : undefined;
        if (memberDecorators) {
            var filteredDecorators = transformModifiers(state, memberDecorators);
            if (factory_1.f.is.propertyDeclaration(member)) {
                return factory_1.f.update.propertyDeclaration(member, undefined, undefined, filteredDecorators);
            }
            else if (factory_1.f.is.methodDeclaration(member)) {
                return factory_1.f.update.methodDeclaration(member, undefined, undefined, undefined, undefined, filteredDecorators);
            }
        }
        return member;
    }), node.heritageClauses, node.typeParameters, modifiers && transformModifiers(state, modifiers));
}
function transformModifiers(state, modifiers) {
    return modifiers
        .filter(function (modifier) {
        if (!typescript_1.default.isDecorator(modifier))
            return true;
        var type = state.typeChecker.getTypeAtLocation(modifier.expression);
        return type.getProperty("_flamework_Decorator") === undefined;
    })
        .map(function (decorator) { return state.transform(decorator); });
}
function calculateOmittedGuards(state, classDeclaration, customAttributes) {
    var e_7, _a, e_8, _b;
    var omittedNames = new Set();
    if (factory_1.f.is.propertyAssignmentDeclaration(customAttributes) && factory_1.f.is.object(customAttributes.initializer)) {
        try {
            for (var _c = __values(customAttributes.initializer.properties), _d = _c.next(); !_d.done; _d = _c.next()) {
                var prop = _d.value;
                if (factory_1.f.is.string(prop.name) || factory_1.f.is.identifier(prop.name)) {
                    omittedNames.add(prop.name.text);
                }
            }
        }
        catch (e_7_1) { e_7 = { error: e_7_1 }; }
        finally {
            try {
                if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
            }
            finally { if (e_7) throw e_7.error; }
        }
    }
    var type = state.typeChecker.getTypeAtLocation(classDeclaration);
    var property = type.getProperty("attributes");
    if (!property)
        return omittedNames;
    var superClass = (0, getSuperClasses_1.getSuperClasses)(state.typeChecker, classDeclaration)[0];
    if (!superClass)
        return omittedNames;
    var superType = state.typeChecker.getTypeAtLocation(superClass);
    var superProperty = superType.getProperty("attributes");
    if (!superProperty)
        return omittedNames;
    var attributes = state.typeChecker.getTypeOfSymbolAtLocation(property, classDeclaration);
    var superAttributes = state.typeChecker.getTypeOfSymbolAtLocation(superProperty, superClass);
    try {
        for (var _e = __values(superAttributes.getProperties()), _f = _e.next(); !_f.done; _f = _e.next()) {
            var name_1 = _f.value.name;
            var prop = state.typeChecker.getTypeOfPropertyOfType(attributes, name_1);
            var superProp = state.typeChecker.getTypeOfPropertyOfType(superAttributes, name_1);
            if (prop && superProp && superProp === prop) {
                omittedNames.add(name_1);
            }
        }
    }
    catch (e_8_1) { e_8 = { error: e_8_1 }; }
    finally {
        try {
            if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
        }
        finally { if (e_8) throw e_8.error; }
    }
    return omittedNames;
}
function updateAttributeGuards(state, node, properties) {
    var type = state.typeChecker.getTypeAtLocation(node);
    var baseComponent = state.symbolProvider.componentsFile.get("BaseComponent");
    var property = type.getProperty("attributes");
    if (!property || property.parent !== baseComponent)
        return;
    var attributesType = state.typeChecker.getTypeOfSymbolAtLocation(property, node);
    if (!attributesType)
        return;
    var attributes = properties.find(function (x) { return x.name && "text" in x.name && x.name.text === "attributes"; });
    var attributeGuards = (0, buildGuardFromType_1.buildGuardsFromType)(state, state.getSourceFile(node), attributesType);
    var omittedGuards = calculateOmittedGuards(state, node, attributes);
    var filteredGuards = attributeGuards.filter(function (x) { return !omittedGuards.has(x.name.text); });
    properties = properties.filter(function (x) { return x !== attributes; });
    if (factory_1.f.is.propertyAssignmentDeclaration(attributes) && factory_1.f.is.object(attributes.initializer)) {
        properties.push(factory_1.f.update.propertyAssignmentDeclaration(attributes, factory_1.f.update.object(attributes.initializer, __spreadArray(__spreadArray([], __read(attributes.initializer.properties), false), __read(filteredGuards), false)), attributes.name));
    }
    else {
        properties.push(factory_1.f.propertyAssignmentDeclaration("attributes", factory_1.f.object(filteredGuards)));
    }
    return properties;
}
function updateInstanceGuard(state, node, properties) {
    var type = state.typeChecker.getTypeAtLocation(node);
    var baseComponent = state.symbolProvider.componentsFile.get("BaseComponent");
    var property = type.getProperty("instance");
    if (!property || property.parent !== baseComponent)
        return;
    var superClass = (0, getSuperClasses_1.getSuperClasses)(state.typeChecker, node)[0];
    if (!superClass)
        return;
    var customGuard = properties.find(function (x) { return x.name && "text" in x.name && x.name.text === "instanceGuard"; });
    if (customGuard)
        return;
    var instanceType = state.typeChecker.getTypeOfSymbolAtLocation(property, node);
    if (!instanceType)
        return;
    var superType = state.typeChecker.getTypeAtLocation(superClass);
    var superProperty = superType.getProperty("instance");
    if (!superProperty)
        return;
    var superInstanceType = state.typeChecker.getTypeOfSymbolAtLocation(superProperty, superClass);
    if (!superInstanceType)
        return;
    if (!type.checker.isTypeAssignableTo(superInstanceType, instanceType)) {
        var guard = (0, buildGuardFromType_1.buildGuardFromType)(state, state.getSourceFile(node), instanceType);
        properties.push(factory_1.f.propertyAssignmentDeclaration("instanceGuard", guard));
    }
    return properties;
}
function updateComponentConfig(state, node, properties) {
    var _a, _b;
    properties = (_a = updateAttributeGuards(state, node, properties)) !== null && _a !== void 0 ? _a : properties;
    properties = (_b = updateInstanceGuard(state, node, properties)) !== null && _b !== void 0 ? _b : properties;
    return properties;
}
//# sourceMappingURL=transformClassDeclaration.js.map