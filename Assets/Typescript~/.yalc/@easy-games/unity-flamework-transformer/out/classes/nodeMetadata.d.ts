import ts from "typescript";
import { TransformState } from "./transformState";
export declare class NodeMetadata {
    private set;
    private symbols;
    private types;
    private trace;
    private parseText;
    private parseMetadata;
    private parse;
    constructor(state: TransformState, node: ts.Node);
    isRequested(metadata: string): boolean;
    getSymbol(key: string): ts.Symbol[] | undefined;
    getType(key: string): ts.Type[] | undefined;
    getTrace(name: string | ts.Symbol | ts.Type): ts.Node | undefined;
}
