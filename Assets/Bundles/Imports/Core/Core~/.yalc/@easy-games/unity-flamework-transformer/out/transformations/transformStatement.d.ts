import ts from "typescript";
import { TransformState } from "../classes/transformState";
export declare function transformStatement(state: TransformState, statement: ts.Statement): ts.Statement | ts.Statement[];
