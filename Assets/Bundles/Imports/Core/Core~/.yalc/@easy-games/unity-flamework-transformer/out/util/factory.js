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
exports.f = void 0;
var typescript_1 = __importDefault(require("typescript"));
/**
 * Shorthand factory methods.
 *
 * Naming scheme:
 *
 * f.expressionType
 * f.declarationTypeDeclaration
 * f.statementTypeStatement
 * f.typeNodeType
 *
 * f.is.*
 * f.update.*
 *
 * Examples:
 *
 * f.string()
 * f.classDeclaration()
 * f.ifStatement()
 */
var f;
(function (f) {
    var factory = typescript_1.default.factory;
    function toExpression(expression, stringFn) {
        if (stringFn === void 0) { stringFn = string; }
        if (typeof expression === "string") {
            return stringFn(expression);
        }
        else if (typeof expression === "number") {
            return number(expression);
        }
        else if (typeof expression === "boolean") {
            return bool(expression);
        }
        else if (Array.isArray(expression)) {
            return array(expression.map(function (x) { return toExpression(x); }));
        }
        else {
            return expression;
        }
    }
    f.toExpression = toExpression;
    /// Expressions
    function string(str) {
        return factory.createStringLiteral(str);
    }
    f.string = string;
    function bool(value) {
        return value ? factory.createTrue() : factory.createFalse();
    }
    f.bool = bool;
    function array(values, multiLine) {
        if (multiLine === void 0) { multiLine = true; }
        return factory.createArrayLiteralExpression(values, multiLine);
    }
    f.array = array;
    function number(value, flags) {
        return factory.createNumericLiteral(value, flags);
    }
    f.number = number;
    function identifier(name, unique) {
        if (unique === void 0) { unique = false; }
        return unique ? factory.createUniqueName(name) : factory.createIdentifier(name);
    }
    f.identifier = identifier;
    function nil() {
        return identifier("undefined");
    }
    f.nil = nil;
    function field(name, property) {
        if (typeof property === "string") {
            return factory.createElementAccessExpression(toExpression(name, identifier), string(property));
        }
        if (typescript_1.default.isComputedPropertyName(property)) {
            return field(name, property.expression);
        }
        if (typescript_1.default.isMemberName(property)) {
            return factory.createPropertyAccessExpression(toExpression(name, identifier), property);
        }
        else {
            return factory.createElementAccessExpression(toExpression(name, identifier), toExpression(property));
        }
    }
    f.field = field;
    function statement(expression) {
        if (expression !== undefined) {
            return factory.createExpressionStatement(toExpression(expression));
        }
        else {
            return factory.createExpressionStatement(identifier("undefined"));
        }
    }
    f.statement = statement;
    function call(expression, args, typeArguments) {
        return factory.createCallExpression(toExpression(expression, identifier), typeArguments, args === null || args === void 0 ? void 0 : args.map(function (x) { return toExpression(x); }));
    }
    f.call = call;
    function object(properties, multiLine) {
        var e_1, _a;
        if (multiLine === void 0) { multiLine = true; }
        if (Array.isArray(properties)) {
            return factory.createObjectLiteralExpression(properties, multiLine);
        }
        else {
            var realProperties = [];
            try {
                for (var _b = __values(Object.keys(properties)), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var key = _c.value;
                    realProperties.push(propertyAssignmentDeclaration(key, properties[key]));
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
            return factory.createObjectLiteralExpression(realProperties, multiLine);
        }
    }
    f.object = object;
    function as(expression, node, explicit) {
        if (explicit === void 0) { explicit = false; }
        return explicit
            ? factory.createAsExpression(factory.createAsExpression(expression, keywordType(typescript_1.default.SyntaxKind.UnknownKeyword)), node)
            : factory.createAsExpression(expression, node);
    }
    f.as = as;
    function binary(left, op, right) {
        return factory.createBinaryExpression(toExpression(left), op, toExpression(right));
    }
    f.binary = binary;
    function elementAccessExpression(expression, index) {
        return factory.createElementAccessExpression(toExpression(expression), toExpression(index));
    }
    f.elementAccessExpression = elementAccessExpression;
    function propertyAccessExpression(expression, name) {
        return factory.createPropertyAccessExpression(toExpression(expression), name);
    }
    f.propertyAccessExpression = propertyAccessExpression;
    function arrowFunction(body, parameters, typeParameters, type) {
        return factory.createArrowFunction(undefined, typeParameters, parameters !== null && parameters !== void 0 ? parameters : [], type, factory.createToken(typescript_1.default.SyntaxKind.EqualsGreaterThanToken), body);
    }
    f.arrowFunction = arrowFunction;
    function bang(expression) {
        return factory.createNonNullExpression(toExpression(expression, identifier));
    }
    f.bang = bang;
    function self() {
        return typescript_1.default.factory.createThis();
    }
    f.self = self;
    function superExpression() {
        return typescript_1.default.factory.createSuper();
    }
    f.superExpression = superExpression;
    /// Statements
    function block(statements, multiLine) {
        if (multiLine === void 0) { multiLine = true; }
        return factory.createBlock(statements, multiLine);
    }
    f.block = block;
    function returnStatement(expression) {
        return factory.createReturnStatement(expression ? toExpression(expression) : undefined);
    }
    f.returnStatement = returnStatement;
    function variableStatement(name, initializer, type, isMutable) {
        if (isMutable === void 0) { isMutable = false; }
        return factory.createVariableStatement(undefined, factory.createVariableDeclarationList([factory.createVariableDeclaration(name, undefined, type, initializer)], isMutable ? typescript_1.default.NodeFlags.Let : typescript_1.default.NodeFlags.Const));
    }
    f.variableStatement = variableStatement;
    /// Declarations
    function methodDeclaration(name, body, parameters, type, isOptional, typeParameters) {
        if (isOptional === void 0) { isOptional = false; }
        return factory.createMethodDeclaration(undefined, undefined, name, isOptional ? token(typescript_1.default.SyntaxKind.QuestionToken) : undefined, typeParameters, parameters !== null && parameters !== void 0 ? parameters : [], type, body);
    }
    f.methodDeclaration = methodDeclaration;
    function arrayBindingDeclaration(elements) {
        return factory.createArrayBindingPattern(elements.map(function (x) { return factory.createBindingElement(undefined, undefined, x, undefined); }));
    }
    f.arrayBindingDeclaration = arrayBindingDeclaration;
    function parameterDeclaration(name, type, value, isOptional, isSpread) {
        return factory.createParameterDeclaration(undefined, isSpread ? factory.createToken(typescript_1.default.SyntaxKind.DotDotDotToken) : undefined, name, isOptional ? factory.createToken(typescript_1.default.SyntaxKind.QuestionToken) : undefined, type, value);
    }
    f.parameterDeclaration = parameterDeclaration;
    function typeParameterDeclaration(name, constraint, defaultType) {
        return factory.createTypeParameterDeclaration(undefined, name, constraint, defaultType);
    }
    f.typeParameterDeclaration = typeParameterDeclaration;
    function propertyAssignmentDeclaration(name, value) {
        return factory.createPropertyAssignment(typeof name === "string" ? string(name) : name, toExpression(value));
    }
    f.propertyAssignmentDeclaration = propertyAssignmentDeclaration;
    function propertyDeclaration(name, initializer, type, tokenType) {
        return factory.createPropertyDeclaration(undefined, name, tokenType, type, initializer);
    }
    f.propertyDeclaration = propertyDeclaration;
    function importDeclaration(path, imports, defaultImport, typeOnly) {
        if (typeOnly === void 0) { typeOnly = false; }
        return factory.createImportDeclaration(undefined, factory.createImportClause(typeOnly, defaultImport, imports
            ? factory.createNamedImports(imports.map(function (x) {
                if (Array.isArray(x)) {
                    return factory.createImportSpecifier(false, typeof x[0] === "string" ? f.identifier(x[0]) : x[0], x[1]);
                }
                else {
                    return factory.createImportSpecifier(false, undefined, x);
                }
            }))
            : undefined), toExpression(path));
    }
    f.importDeclaration = importDeclaration;
    function functionDeclaration(name, body, parameters, type, typeParams) {
        if (parameters === void 0) { parameters = []; }
        return factory.createFunctionDeclaration(undefined, undefined, name, typeParams, parameters, type, body);
    }
    f.functionDeclaration = functionDeclaration;
    function typeAliasDeclaration(name, type, typeParameters) {
        return factory.createTypeAliasDeclaration(undefined, name, typeParameters, type);
    }
    f.typeAliasDeclaration = typeAliasDeclaration;
    /// Type Nodes
    function functionType(parameters, returnType, typeParameters) {
        return factory.createFunctionTypeNode(typeParameters !== null && typeParameters !== void 0 ? typeParameters : [], parameters, returnType);
    }
    f.functionType = functionType;
    function unionType(types) {
        return factory.createUnionTypeNode(types);
    }
    f.unionType = unionType;
    function intersectionType(types) {
        return factory.createIntersectionTypeNode(types);
    }
    f.intersectionType = intersectionType;
    function importType(argument, qualifier, isTypeOf, typeArguments) {
        return factory.createImportTypeNode(typeof argument === "string" ? literalType(string(argument)) : argument, undefined, qualifier, typeArguments, isTypeOf);
    }
    f.importType = importType;
    function referenceType(typeName, typeArguments) {
        return factory.createTypeReferenceNode(typeName, typeArguments);
    }
    f.referenceType = referenceType;
    function keywordType(kind) {
        return factory.createKeywordTypeNode(kind);
    }
    f.keywordType = keywordType;
    function qualifiedNameType(left, right) {
        return factory.createQualifiedName(left, right);
    }
    f.qualifiedNameType = qualifiedNameType;
    function typeLiteralType(members) {
        return factory.createTypeLiteralNode(members);
    }
    f.typeLiteralType = typeLiteralType;
    function indexSignatureType(indexType, valueType) {
        return factory.createIndexSignature(undefined, [parameterDeclaration("key", indexType)], valueType);
    }
    f.indexSignatureType = indexSignatureType;
    function callSignatureType(parameters, returnType, typeParameters) {
        return factory.createCallSignature(typeParameters, parameters, returnType);
    }
    f.callSignatureType = callSignatureType;
    function tupleType(elements) {
        return factory.createTupleTypeNode(elements);
    }
    f.tupleType = tupleType;
    function literalType(expr) {
        return factory.createLiteralTypeNode(expr);
    }
    f.literalType = literalType;
    function propertySignatureType(name, type, isOptional) {
        return factory.createPropertySignature(undefined, name, isOptional ? token(typescript_1.default.SyntaxKind.QuestionToken) : undefined, type);
    }
    f.propertySignatureType = propertySignatureType;
    function indexedAccessType(left, right) {
        return factory.createIndexedAccessTypeNode(left, right);
    }
    f.indexedAccessType = indexedAccessType;
    function queryType(expression) {
        return factory.createTypeQueryNode(expression);
    }
    f.queryType = queryType;
    function selfType() {
        return factory.createThisTypeNode();
    }
    f.selfType = selfType;
    // Other
    function token(kind) {
        return factory.createToken(kind);
    }
    f.token = token;
    function modifier(kind) {
        return factory.createModifier(kind);
    }
    f.modifier = modifier;
    var is;
    (function (is) {
        /// Expressions
        function statement(node) {
            return node !== undefined && typescript_1.default.isExpressionStatement(node);
        }
        is.statement = statement;
        function string(node) {
            return node !== undefined && typescript_1.default.isStringLiteral(node);
        }
        is.string = string;
        function bool(node) {
            return node !== undefined && (node === f.bool(true) || node === f.bool(false));
        }
        is.bool = bool;
        function array(node) {
            return node !== undefined && typescript_1.default.isArrayLiteralExpression(node);
        }
        is.array = array;
        function number(node) {
            return node !== undefined && typescript_1.default.isNumericLiteral(node);
        }
        is.number = number;
        function identifier(node) {
            return node !== undefined && typescript_1.default.isIdentifier(node);
        }
        is.identifier = identifier;
        function nil(node) {
            return node !== undefined && identifier(node) && node.text === "undefined";
        }
        is.nil = nil;
        function call(node) {
            return node !== undefined && typescript_1.default.isCallExpression(node);
        }
        is.call = call;
        function object(node) {
            return node !== undefined && typescript_1.default.isObjectLiteralExpression(node);
        }
        is.object = object;
        function functionExpression(node) {
            return node !== undefined && (typescript_1.default.isArrowFunction(node) || typescript_1.default.isFunctionExpression(node));
        }
        is.functionExpression = functionExpression;
        function omitted(node) {
            return node !== undefined && typescript_1.default.isOmittedExpression(node);
        }
        is.omitted = omitted;
        function accessExpression(node) {
            return node !== undefined && typescript_1.default.isAccessExpression(node);
        }
        is.accessExpression = accessExpression;
        function propertyAccessExpression(node) {
            return node !== undefined && typescript_1.default.isPropertyAccessExpression(node);
        }
        is.propertyAccessExpression = propertyAccessExpression;
        function elementAccessExpression(node) {
            return node !== undefined && typescript_1.default.isElementAccessExpression(node);
        }
        is.elementAccessExpression = elementAccessExpression;
        function postfixUnary(node) {
            return node !== undefined && typescript_1.default.isPostfixUnaryExpression(node);
        }
        is.postfixUnary = postfixUnary;
        function superExpression(node) {
            return node !== undefined && typescript_1.default.isSuperKeyword(node);
        }
        is.superExpression = superExpression;
        /// Statements
        /// Declarations
        function constructor(node) {
            return node !== undefined && typescript_1.default.isConstructorDeclaration(node);
        }
        is.constructor = constructor;
        function propertyDeclaration(node) {
            return node !== undefined && typescript_1.default.isPropertyDeclaration(node);
        }
        is.propertyDeclaration = propertyDeclaration;
        function propertyAssignmentDeclaration(node) {
            return node !== undefined && typescript_1.default.isPropertyAssignment(node);
        }
        is.propertyAssignmentDeclaration = propertyAssignmentDeclaration;
        function importDeclaration(node) {
            return node !== undefined && typescript_1.default.isImportDeclaration(node);
        }
        is.importDeclaration = importDeclaration;
        function classDeclaration(node) {
            return node !== undefined && typescript_1.default.isClassDeclaration(node);
        }
        is.classDeclaration = classDeclaration;
        function methodDeclaration(node) {
            return node !== undefined && typescript_1.default.isMethodDeclaration(node);
        }
        is.methodDeclaration = methodDeclaration;
        function namespaceDeclaration(node) {
            return ((node !== undefined &&
                typescript_1.default.isModuleDeclaration(node) &&
                identifier(node.name) &&
                node.body &&
                typescript_1.default.isNamespaceBody(node.body)) ||
                false);
        }
        is.namespaceDeclaration = namespaceDeclaration;
        function moduleBlockDeclaration(node) {
            return node !== undefined && typescript_1.default.isModuleBlock(node);
        }
        is.moduleBlockDeclaration = moduleBlockDeclaration;
        function importClauseDeclaration(node) {
            return node !== undefined && typescript_1.default.isImportClause(node);
        }
        is.importClauseDeclaration = importClauseDeclaration;
        function namedDeclaration(node) {
            return node !== undefined && typescript_1.default.isNamedDeclaration(node);
        }
        is.namedDeclaration = namedDeclaration;
        function interfaceDeclaration(node) {
            return node !== undefined && typescript_1.default.isInterfaceDeclaration(node);
        }
        is.interfaceDeclaration = interfaceDeclaration;
        function typeAliasDeclaration(node) {
            return node !== undefined && typescript_1.default.isTypeAliasDeclaration(node);
        }
        is.typeAliasDeclaration = typeAliasDeclaration;
        /// Type Nodes
        function referenceType(node) {
            return node !== undefined && typescript_1.default.isTypeReferenceNode(node);
        }
        is.referenceType = referenceType;
        function queryType(node) {
            return node !== undefined && typescript_1.default.isTypeQueryNode(node);
        }
        is.queryType = queryType;
        function importType(node) {
            return node !== undefined && typescript_1.default.isImportTypeNode(node);
        }
        is.importType = importType;
        /// OTHERS
        function namedImports(node) {
            return node !== undefined && typescript_1.default.isNamedImports(node);
        }
        is.namedImports = namedImports;
        function file(node) {
            return node !== undefined && typescript_1.default.isSourceFile(node);
        }
        is.file = file;
    })(is = f.is || (f.is = {}));
    var update;
    (function (update) {
        /// Expressions
        function call(node, expression, args, typeArguments) {
            var _a;
            if (expression === void 0) { expression = node.expression; }
            return factory.updateCallExpression(node, expression, typeArguments !== null && typeArguments !== void 0 ? typeArguments : node.typeArguments, (_a = args === null || args === void 0 ? void 0 : args.map(function (x) { return toExpression(x); })) !== null && _a !== void 0 ? _a : node.arguments);
        }
        update.call = call;
        function object(node, properties) {
            return factory.updateObjectLiteralExpression(node, properties !== null && properties !== void 0 ? properties : node.properties);
        }
        update.object = object;
        function propertyAccessExpression(node, expression, name) {
            return factory.updatePropertyAccessExpression(node, toExpression(expression), typeof name === "string" ? f.identifier(name) : name);
        }
        update.propertyAccessExpression = propertyAccessExpression;
        function elementAccessExpression(node, expression, name) {
            return factory.updateElementAccessExpression(node, toExpression(expression), toExpression(name));
        }
        update.elementAccessExpression = elementAccessExpression;
        /// Statements
        /// Declarations
        function classDeclaration(node, name, members, heritageClauses, typeParameters, modifiers) {
            if (name === void 0) { name = node.name; }
            if (members === void 0) { members = node.members; }
            if (heritageClauses === void 0) { heritageClauses = node.heritageClauses; }
            if (typeParameters === void 0) { typeParameters = node.typeParameters; }
            if (modifiers === void 0) { modifiers = typescript_1.default.getModifiers(node); }
            return factory.updateClassDeclaration(node, modifiers, name, typeParameters, heritageClauses, members);
        }
        update.classDeclaration = classDeclaration;
        function constructor(node, parameters, body) {
            return factory.updateConstructorDeclaration(node, undefined, parameters, body);
        }
        update.constructor = constructor;
        function parameterDeclaration(node, name, type, initializer, modifiers, isRest, isOptional) {
            if (name === void 0) { name = node.name; }
            if (type === void 0) { type = node.type; }
            if (initializer === void 0) { initializer = node.initializer; }
            if (modifiers === void 0) { modifiers = typescript_1.default.getModifiers(node); }
            if (isRest === void 0) { isRest = node.dotDotDotToken !== undefined; }
            if (isOptional === void 0) { isOptional = node.questionToken !== undefined; }
            return factory.updateParameterDeclaration(node, (modifiers === null || modifiers === void 0 ? void 0 : modifiers.length) ? modifiers : undefined, isRest ? token(typescript_1.default.SyntaxKind.DotDotDotToken) : undefined, name, isOptional ? token(typescript_1.default.SyntaxKind.QuestionToken) : undefined, type, initializer);
        }
        update.parameterDeclaration = parameterDeclaration;
        function methodDeclaration(node, name, body, parameters, typeParameters, modifiers, isOptional, type) {
            if (name === void 0) { name = node.name; }
            if (body === void 0) { body = node.body; }
            if (parameters === void 0) { parameters = node.parameters; }
            if (typeParameters === void 0) { typeParameters = node.typeParameters; }
            if (modifiers === void 0) { modifiers = typescript_1.default.getModifiers(node); }
            if (isOptional === void 0) { isOptional = node.asteriskToken !== undefined; }
            if (type === void 0) { type = node.type; }
            return factory.updateMethodDeclaration(node, (modifiers === null || modifiers === void 0 ? void 0 : modifiers.length) === 0 ? undefined : modifiers, undefined, typeof name === "string" ? identifier(name) : name, isOptional ? factory.createToken(typescript_1.default.SyntaxKind.QuestionToken) : undefined, (typeParameters === null || typeParameters === void 0 ? void 0 : typeParameters.length) === 0 ? undefined : typeParameters, parameters, type, Array.isArray(body) ? f.block(body) : body);
        }
        update.methodDeclaration = methodDeclaration;
        function propertyDeclaration(node, initializer, name, modifiers, tokenType, type) {
            if (initializer === void 0) { initializer = node.initializer; }
            if (name === void 0) { name = node.name; }
            if (modifiers === void 0) { modifiers = typescript_1.default.getModifiers(node); }
            if (tokenType === void 0) { tokenType = node.questionToken ? "?" : node.exclamationToken ? "!" : undefined; }
            if (type === void 0) { type = node.type; }
            var syntaxToken = tokenType === "!"
                ? token(typescript_1.default.SyntaxKind.ExclamationToken)
                : tokenType === "?"
                    ? token(typescript_1.default.SyntaxKind.QuestionToken)
                    : undefined;
            return factory.updatePropertyDeclaration(node, (modifiers === null || modifiers === void 0 ? void 0 : modifiers.length) === 0 ? undefined : modifiers, name, syntaxToken, type, !initializer ? undefined : toExpression(initializer));
        }
        update.propertyDeclaration = propertyDeclaration;
        function propertyAssignmentDeclaration(node, initializer, name) {
            if (initializer === void 0) { initializer = node.initializer; }
            if (name === void 0) { name = node.name; }
            return factory.updatePropertyAssignment(node, typeof name === "string" ? f.identifier(name) : name, toExpression(initializer));
        }
        update.propertyAssignmentDeclaration = propertyAssignmentDeclaration;
        /// Type Nodes
        /// Other
        function sourceFile(sourceFile, statements, isDeclarationFile, referencedFiles, typeReferences, hasNoDefaultLib, libReferences) {
            if (statements === void 0) { statements = sourceFile.statements; }
            if (isDeclarationFile === void 0) { isDeclarationFile = sourceFile.isDeclarationFile; }
            if (referencedFiles === void 0) { referencedFiles = sourceFile.referencedFiles; }
            if (typeReferences === void 0) { typeReferences = sourceFile.typeReferenceDirectives; }
            if (hasNoDefaultLib === void 0) { hasNoDefaultLib = sourceFile.hasNoDefaultLib; }
            if (libReferences === void 0) { libReferences = sourceFile.libReferenceDirectives; }
            return factory.updateSourceFile(sourceFile, statements, isDeclarationFile, referencedFiles, typeReferences, hasNoDefaultLib, libReferences);
        }
        update.sourceFile = sourceFile;
    })(update = f.update || (f.update = {}));
    function setFactory(newFactory) {
        factory = newFactory;
    }
    f.setFactory = setFactory;
})(f || (exports.f = f = {}));
//# sourceMappingURL=factory.js.map