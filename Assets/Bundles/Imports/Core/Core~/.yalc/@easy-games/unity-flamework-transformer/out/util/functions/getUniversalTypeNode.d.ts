import ts from "typescript";
/**
 * Returns a TypeNode generator that will attempt to create a TypeNode accessible from location.
 * Otherwise, returns undefined.
 */
export declare function getUniversalTypeNodeGenerator(location: ts.Node): {
    generate: (type: ts.Type) => ts.TypeNode | undefined;
    prereqs: ts.TypeAliasDeclaration[];
};
