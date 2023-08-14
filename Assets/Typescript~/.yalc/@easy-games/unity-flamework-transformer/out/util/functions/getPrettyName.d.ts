import ts from "typescript";
import { TransformState } from "../../classes/transformState";
export declare function getPrettyName(state: TransformState, node: ts.Node | undefined, fallback: string, prefix?: string): string;
