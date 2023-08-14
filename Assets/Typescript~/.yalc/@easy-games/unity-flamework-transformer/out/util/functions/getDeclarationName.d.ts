import ts from "typescript";
/**
 * Calculates a name, including all named ancestors, such as Enum.Material.Air
 * @param node The node to retrieve the name of
 */
export declare function getDeclarationName(node: ts.NamedDeclaration): string;
