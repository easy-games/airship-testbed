import ts from "typescript";
import { TransformState } from "../../classes/transformState";
export declare function transformBinaryExpression(state: TransformState, node: ts.BinaryExpression): ts.CallExpression | ts.BinaryExpression;
