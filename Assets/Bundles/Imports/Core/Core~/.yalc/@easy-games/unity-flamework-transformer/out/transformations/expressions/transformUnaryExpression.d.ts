import ts from "typescript";
import { TransformState } from "../../classes/transformState";
export declare function transformUnaryExpression(state: TransformState, node: ts.PrefixUnaryExpression | ts.PostfixUnaryExpression): ts.CallExpression | ts.PrefixUnaryExpression | ts.PostfixUnaryExpression;
