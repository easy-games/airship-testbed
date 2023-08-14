import ts from "typescript";
type ValueOrDiagnostic<T> = {
    success: true;
    diagnostic?: ts.DiagnosticWithLocation;
    value: T;
} | {
    success: false;
    diagnostic: ts.DiagnosticWithLocation;
    value?: T;
};
export declare function captureDiagnostic<T, A extends unknown[]>(cb: (...args: A) => T, ...args: A): ValueOrDiagnostic<T>;
export declare function relocateDiagnostic<T, A extends unknown[]>(node: ts.Node, cb: (...args: A) => T, ...params: A): T;
export declare function catchDiagnostic<T>(fallback: T, cb: () => T): T;
export {};
