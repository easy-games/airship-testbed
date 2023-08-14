import ts from "typescript";
/**
 * Gets the expression used to index the AccessExpression.
 * Converts properties to strings.
 */
export declare function getIndexExpression(expression: ts.AccessExpression): ts.Expression;
