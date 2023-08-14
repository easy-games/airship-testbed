import ts from "typescript";
import { TransformState } from "../classes/transformState";
export declare function transformNode(state: TransformState, node: ts.Node): ts.Node | ts.Statement[];
