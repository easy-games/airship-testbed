import ts from "typescript";
import { TransformState } from "./transformState";
export declare class SymbolProvider {
    state: TransformState;
    fileSymbols: Map<string, FileSymbol>;
    moddingFile: FileSymbol;
    flameworkFile: FileSymbol;
    componentsFile?: FileSymbol;
    networkingFile?: FileSymbol;
    flamework: NamespaceSymbol;
    components?: ClassSymbol;
    networking?: NamespaceSymbol;
    constructor(state: TransformState);
    private resolveModuleDir;
    findFile(name: string): FileSymbol | undefined;
    getFile(name: string): FileSymbol;
    registerInterestingFiles(): void;
    private getName;
    private registeredFiles;
    private registerFileSymbol;
    private flameworkDir;
    private componentsDir;
    private networkingDir;
    private isFileInteresting;
    private finalize;
}
declare class ClassSymbol {
    fileSymbol: FileSymbol;
    parentSymbol: FileSymbol | NamespaceSymbol;
    node: ts.ClassDeclaration;
    classSymbol: ts.Symbol;
    constructor(fileSymbol: FileSymbol, parentSymbol: FileSymbol | NamespaceSymbol, node: ts.ClassDeclaration);
    get(name: string): ts.Symbol;
    getStatic(name: string): ts.Symbol;
}
declare class TypeSymbol {
    fileSymbol: FileSymbol;
    parentSymbol: FileSymbol | NamespaceSymbol;
    node: ts.TypeAliasDeclaration | ts.InterfaceDeclaration;
    typeSymbol: ts.Symbol;
    constructor(fileSymbol: FileSymbol, parentSymbol: FileSymbol | NamespaceSymbol, node: ts.TypeAliasDeclaration | ts.InterfaceDeclaration);
    get(name: string): ts.Symbol;
}
declare class NamespaceSymbol {
    fileSymbol: FileSymbol;
    parentSymbol: NamespaceSymbol | FileSymbol;
    node: ts.NamespaceDeclaration;
    classes: Map<string, ClassSymbol>;
    namespaces: Map<string, NamespaceSymbol>;
    types: Map<string, TypeSymbol>;
    namespaceSymbol: ts.Symbol;
    constructor(fileSymbol: FileSymbol, parentSymbol: NamespaceSymbol | FileSymbol, node: ts.NamespaceDeclaration);
    get(name: string): ts.Symbol;
    getNamespace(name: string): NamespaceSymbol;
    getClass(name: string): ClassSymbol;
    getType(name: string): TypeSymbol;
    private registerNamespace;
    private registerClass;
    private registerType;
    private register;
}
declare class FileSymbol {
    state: TransformState;
    file: ts.SourceFile;
    name: string;
    namespaces: Map<string, NamespaceSymbol>;
    classes: Map<string, ClassSymbol>;
    types: Map<string, TypeSymbol>;
    fileSymbol: ts.Symbol;
    constructor(state: TransformState, file: ts.SourceFile, name: string);
    get(name: string): ts.Symbol;
    getNamespace(name: string): NamespaceSymbol;
    getClass(name: string): ClassSymbol;
    getType(name: string): TypeSymbol;
    private registerNamespace;
    private registerClass;
    private registerType;
    private register;
}
export {};
