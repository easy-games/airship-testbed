import ts from "typescript";
import { TransformState } from "../classes/transformState";
export declare function transformUserMacro<T extends ts.NewExpression | ts.CallExpression>(state: TransformState, node: T, signature: ts.Signature): T | undefined;
