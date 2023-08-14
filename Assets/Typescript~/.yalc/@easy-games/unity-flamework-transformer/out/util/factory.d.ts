import ts from "typescript";
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
export declare namespace f {
    type NodeArray<T extends ts.Node> = ReadonlyArray<T> | ts.NodeArray<T>;
    type ONodeArray<T extends ts.Node> = NodeArray<T> | undefined;
    export type ConvertableExpression = string | number | ts.Expression | Array<ConvertableExpression> | boolean;
    export function toExpression(expression: ConvertableExpression, stringFn?: (param: string) => ts.Expression): ts.Expression;
    export function string(str: string): ts.StringLiteral;
    export function bool(value: boolean): ts.TrueLiteral | ts.FalseLiteral;
    export function array(values: ts.Expression[], multiLine?: boolean): ts.ArrayLiteralExpression;
    export function number(value: number | string, flags?: ts.TokenFlags): ts.NumericLiteral;
    export function identifier(name: string, unique?: boolean): ts.Identifier;
    export function nil(): ts.Identifier;
    export function field(name: ts.Expression | string, property: ts.Expression | ts.PropertyName | ts.MemberName | string): ts.ElementAccessExpression | ts.PropertyAccessExpression;
    export function statement(expression?: ConvertableExpression): ts.ExpressionStatement;
    export function call(expression: ts.Expression | string, args?: ConvertableExpression[], typeArguments?: ts.TypeNode[]): ts.CallExpression;
    export function object(properties: ts.ObjectLiteralElementLike[] | {
        [key: string]: ConvertableExpression | Array<ConvertableExpression>;
    }, multiLine?: boolean): ts.ObjectLiteralExpression;
    export function as(expression: ts.Expression, node: ts.TypeNode, explicit?: boolean): ts.AsExpression;
    export function binary(left: ConvertableExpression, op: ts.BinaryOperator | ts.BinaryOperatorToken, right: ConvertableExpression): ts.BinaryExpression;
    export function elementAccessExpression(expression: ConvertableExpression, index: ConvertableExpression): ts.ElementAccessExpression;
    export function propertyAccessExpression(expression: ConvertableExpression, name: ts.MemberName): ts.PropertyAccessExpression;
    export function arrowFunction(body: ts.ConciseBody, parameters?: ts.ParameterDeclaration[], typeParameters?: ts.TypeParameterDeclaration[], type?: ts.TypeNode): ts.ArrowFunction;
    export function bang(expression: ConvertableExpression): ts.NonNullExpression;
    export function self(): ts.ThisExpression;
    export function superExpression(): ts.SuperExpression;
    export function block(statements: ts.Statement[], multiLine?: boolean): ts.Block;
    export function returnStatement(expression?: ConvertableExpression): ts.ReturnStatement;
    export function variableStatement(name: string | ts.BindingName, initializer?: ts.Expression, type?: ts.TypeNode, isMutable?: boolean): ts.VariableStatement;
    export function methodDeclaration(name: string | ts.PropertyName, body?: ts.Block, parameters?: ts.ParameterDeclaration[], type?: ts.TypeNode, isOptional?: boolean, typeParameters?: ts.TypeParameterDeclaration[]): ts.MethodDeclaration;
    export function arrayBindingDeclaration(elements: Array<ts.Identifier | string>): ts.ArrayBindingPattern;
    export function parameterDeclaration(name: string | ts.BindingName, type?: ts.TypeNode, value?: ts.Expression, isOptional?: boolean, isSpread?: boolean): ts.ParameterDeclaration;
    export function typeParameterDeclaration(name: string | ts.Identifier, constraint?: ts.TypeNode, defaultType?: ts.TypeNode): ts.TypeParameterDeclaration;
    export function propertyAssignmentDeclaration(name: ts.PropertyName | string, value: ConvertableExpression): ts.PropertyAssignment;
    export function propertyDeclaration(name: ts.PropertyName | string, initializer?: ts.Expression, type?: ts.TypeNode, tokenType?: ts.QuestionToken | ts.ExclamationToken): ts.PropertyDeclaration;
    export function importDeclaration(path: string | ts.StringLiteral, imports?: (ts.Identifier | [string | ts.Identifier, ts.Identifier])[], defaultImport?: ts.Identifier, typeOnly?: boolean): ts.ImportDeclaration;
    export function functionDeclaration(name: string | ts.Identifier, body?: ts.Block, parameters?: ts.ParameterDeclaration[], type?: ts.TypeNode, typeParams?: ts.TypeParameterDeclaration[]): ts.FunctionDeclaration;
    export function typeAliasDeclaration(name: string | ts.Identifier, type: ts.TypeNode, typeParameters?: ts.TypeParameterDeclaration[]): ts.TypeAliasDeclaration;
    export function functionType(parameters: ts.ParameterDeclaration[], returnType: ts.TypeNode, typeParameters?: ts.TypeParameterDeclaration[]): ts.FunctionTypeNode;
    export function unionType(types: ts.TypeNode[]): ts.UnionTypeNode;
    export function intersectionType(types: ts.TypeNode[]): ts.IntersectionTypeNode;
    export function importType(argument: ts.TypeNode | string, qualifier?: ts.EntityName, isTypeOf?: boolean, typeArguments?: ts.TypeNode[]): ts.ImportTypeNode;
    export function referenceType(typeName: string | ts.EntityName, typeArguments?: ts.TypeNode[]): ts.TypeReferenceNode;
    export function keywordType(kind: ts.KeywordTypeSyntaxKind): ts.KeywordTypeNode<ts.KeywordTypeSyntaxKind>;
    export function qualifiedNameType(left: ts.EntityName, right: string | ts.Identifier): ts.QualifiedName;
    export function typeLiteralType(members: ts.TypeElement[]): ts.TypeLiteralNode;
    export function indexSignatureType(indexType: ts.TypeNode, valueType: ts.TypeNode): ts.IndexSignatureDeclaration;
    export function callSignatureType(parameters: ts.ParameterDeclaration[], returnType: ts.TypeNode, typeParameters?: ts.TypeParameterDeclaration[]): ts.CallSignatureDeclaration;
    export function tupleType(elements: Array<ts.TypeNode | ts.NamedTupleMember>): ts.TupleTypeNode;
    export function literalType(expr: ts.LiteralTypeNode["literal"]): ts.LiteralTypeNode;
    export function propertySignatureType(name: string | ts.PropertyName, type: ts.TypeNode, isOptional?: boolean): ts.PropertySignature;
    export function indexedAccessType(left: ts.TypeNode, right: ts.TypeNode): ts.IndexedAccessTypeNode;
    export function queryType(expression: ts.EntityName): ts.TypeQueryNode;
    export function selfType(): ts.ThisTypeNode;
    export function token<T extends ts.SyntaxKind>(kind: T): ts.Token<T>;
    export function modifier<T extends ts.ModifierSyntaxKind>(kind: T): ts.ModifierToken<T>;
    export namespace is {
        function statement(node?: ts.Node): node is ts.ExpressionStatement;
        function string(node?: ts.Node): node is ts.StringLiteral;
        function bool(node?: ts.Node): node is ts.BooleanLiteral;
        function array(node?: ts.Node): node is ts.ArrayLiteralExpression;
        function number(node?: ts.Node): node is ts.NumericLiteral;
        function identifier(node?: ts.Node): node is ts.Identifier;
        function nil(node?: ts.Node): node is ts.Identifier & {
            text: "undefined ";
        };
        function call(node?: ts.Node): node is ts.CallExpression;
        function object(node?: ts.Node): node is ts.ObjectLiteralExpression;
        function functionExpression(node?: ts.Node): node is ts.ArrowFunction | ts.FunctionExpression;
        function omitted(node?: ts.Node): node is ts.OmittedExpression;
        function accessExpression(node?: ts.Node): node is ts.AccessExpression;
        function propertyAccessExpression(node?: ts.Node): node is ts.PropertyAccessExpression;
        function elementAccessExpression(node?: ts.Node): node is ts.ElementAccessExpression;
        function postfixUnary(node?: ts.Node): node is ts.PostfixUnaryExpression;
        function superExpression(node?: ts.Node): node is ts.SuperExpression;
        function constructor(node?: ts.Node): node is ts.ConstructorDeclaration;
        function propertyDeclaration(node?: ts.Node): node is ts.PropertyDeclaration;
        function propertyAssignmentDeclaration(node?: ts.Node): node is ts.PropertyAssignment;
        function importDeclaration(node?: ts.Node): node is ts.ImportDeclaration;
        function classDeclaration(node?: ts.Node): node is ts.ClassDeclaration;
        function methodDeclaration(node?: ts.Node): node is ts.MethodDeclaration;
        function namespaceDeclaration(node?: ts.Node): node is ts.NamespaceDeclaration;
        function moduleBlockDeclaration(node?: ts.Node): node is ts.ModuleBlock;
        function importClauseDeclaration(node?: ts.Node): node is ts.ImportClause;
        function namedDeclaration(node?: ts.Node): node is ts.NamedDeclaration & {
            name: ts.DeclarationName;
        };
        function interfaceDeclaration(node?: ts.Node): node is ts.InterfaceDeclaration;
        function typeAliasDeclaration(node?: ts.Node): node is ts.TypeAliasDeclaration;
        function referenceType(node?: ts.Node): node is ts.TypeReferenceNode;
        function queryType(node?: ts.Node): node is ts.TypeQueryNode;
        function importType(node?: ts.Node): node is ts.ImportTypeNode;
        function namedImports(node?: ts.Node): node is ts.NamedImports;
        function file(node?: ts.Node): node is ts.SourceFile;
    }
    export namespace update {
        function call(node: ts.CallExpression, expression?: ts.LeftHandSideExpression, args?: ConvertableExpression[], typeArguments?: ts.TypeNode[]): ts.CallExpression;
        function object(node: ts.ObjectLiteralExpression, properties?: ts.ObjectLiteralElementLike[]): ts.ObjectLiteralExpression;
        function propertyAccessExpression(node: ts.PropertyAccessExpression, expression: ConvertableExpression, name: ts.MemberName | string): ts.PropertyAccessExpression;
        function elementAccessExpression(node: ts.ElementAccessExpression, expression: ConvertableExpression, name: ConvertableExpression): ts.ElementAccessExpression;
        function classDeclaration(node: ts.ClassDeclaration, name?: ts.Identifier | undefined, members?: NodeArray<ts.ClassElement>, heritageClauses?: ts.NodeArray<ts.HeritageClause> | undefined, typeParameters?: ts.NodeArray<ts.TypeParameterDeclaration> | undefined, modifiers?: ONodeArray<ts.ModifierLike>): ts.ClassDeclaration;
        function constructor(node: ts.ConstructorDeclaration, parameters: NodeArray<ts.ParameterDeclaration>, body: ts.Block): ts.ConstructorDeclaration;
        function parameterDeclaration(node: ts.ParameterDeclaration, name?: ts.BindingName, type?: ts.TypeNode | undefined, initializer?: ts.Expression | undefined, modifiers?: ONodeArray<ts.ModifierLike>, isRest?: boolean, isOptional?: boolean): ts.ParameterDeclaration;
        function methodDeclaration(node: ts.MethodDeclaration, name?: string | ts.PropertyName, body?: ts.Block | undefined, parameters?: ONodeArray<ts.ParameterDeclaration>, typeParameters?: ONodeArray<ts.TypeParameterDeclaration>, modifiers?: ONodeArray<ts.ModifierLike>, isOptional?: boolean, type?: ts.TypeNode | undefined): ts.MethodDeclaration;
        function propertyDeclaration(node: ts.PropertyDeclaration, initializer?: ConvertableExpression | null | undefined, name?: ts.PropertyName, modifiers?: ONodeArray<ts.ModifierLike>, tokenType?: "?" | "!" | undefined, type?: ts.TypeNode | undefined): ts.PropertyDeclaration;
        function propertyAssignmentDeclaration(node: ts.PropertyAssignment, initializer?: ConvertableExpression, name?: ts.PropertyName | string): ts.PropertyAssignment;
        function sourceFile(sourceFile: ts.SourceFile, statements?: ts.NodeArray<ts.Statement> | ts.Statement[], isDeclarationFile?: boolean, referencedFiles?: readonly ts.FileReference[], typeReferences?: readonly ts.FileReference[], hasNoDefaultLib?: boolean, libReferences?: readonly ts.FileReference[]): ts.SourceFile;
    }
    export function setFactory(newFactory: ts.NodeFactory): void;
    export {};
}
