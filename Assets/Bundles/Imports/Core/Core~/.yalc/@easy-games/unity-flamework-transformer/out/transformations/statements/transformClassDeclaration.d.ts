import ts from "typescript";
import { TransformState } from "../../classes/transformState";
export declare function transformClassDeclaration(state: TransformState, node: ts.ClassDeclaration): ts.Statement[] | ts.ClassDeclaration;
