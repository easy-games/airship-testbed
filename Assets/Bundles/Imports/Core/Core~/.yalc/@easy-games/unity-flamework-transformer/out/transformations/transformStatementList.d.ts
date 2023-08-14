import ts from "typescript";
import { TransformState } from "../classes/transformState";
export declare function transformStatementList(state: TransformState, statements: ReadonlyArray<ts.Statement>): ts.Statement[];
