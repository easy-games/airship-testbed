import ts from "typescript";
import { TransformState } from "../classes/transformState";
export declare function getInternalId(state: TransformState, node: ts.NamedDeclaration): {
    isPackage: boolean;
    internalId: string;
};
export declare function getDeclarationUid(state: TransformState, node: ts.NamedDeclaration): string;
export declare function getSymbolUid(state: TransformState, symbol: ts.Symbol, trace: ts.Node): string;
export declare function getSymbolUid(state: TransformState, symbol: ts.Symbol, trace?: ts.Node): string | undefined;
export declare function getTypeUid(state: TransformState, type: ts.Type, trace: ts.Node): string;
export declare function getTypeUid(state: TransformState, type: ts.Type, trace?: ts.Node): string | undefined;
export declare function getNodeUid(state: TransformState, node: ts.Node): string;
