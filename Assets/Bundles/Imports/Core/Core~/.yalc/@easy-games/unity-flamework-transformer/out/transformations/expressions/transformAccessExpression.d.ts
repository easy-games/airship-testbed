import ts from "typescript";
import { TransformState } from "../../classes/transformState";
export declare function transformAccessExpression(state: TransformState, node: ts.PropertyAccessExpression | ts.ElementAccessExpression): ts.ElementAccessExpression | ts.PropertyAccessExpression;
