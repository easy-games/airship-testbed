import ts from "typescript";
import { TransformState } from "../../classes/transformState";
/**
 * Checks if an expression is attempting to access component attributes.
 * E.g `this.attributes.myProp`
 */
export declare function isAttributesAccess(state: TransformState, expression: ts.Node): expression is ts.AccessExpression;
