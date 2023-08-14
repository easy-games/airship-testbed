import ts from "typescript";
export declare class Diagnostics {
    static diagnostics: ts.DiagnosticWithLocation[];
    static addDiagnostic(diag: ts.DiagnosticWithLocation): void;
    static createDiagnostic(node: ts.Node, category: ts.DiagnosticCategory, ...messages: string[]): ts.DiagnosticWithLocation;
    static relocate(diagnostic: ts.DiagnosticWithLocation, node: ts.Node): never;
    static error(node: ts.Node, ...messages: string[]): never;
    static warning(node: ts.Node, ...messages: string[]): void;
    static flush(): ts.DiagnosticWithLocation[];
}
