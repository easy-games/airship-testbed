import ts from "typescript";
export declare function addLeadingComment<T extends ts.Node | undefined>(node: T, text: string, multiline?: boolean): T;
