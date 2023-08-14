import ts from "typescript";
import { TransformState } from "../../classes/transformState";
/**
 * Convert a type into a list of typeguards.
 * @param state The TransformState
 * @param file The file that this type belongs to
 * @param type The type to convert
 * @param isInterfaceType Determines whether unknown should be omitted.
 * @returns An array of property assignments.
 */
export declare function buildGuardsFromType(state: TransformState, file: ts.SourceFile, type: ts.Type, isInterfaceType?: boolean): ts.PropertyAssignment[];
/**
 * Convert a type into a type guard.
 * @param state The TransformState
 * @param file The file that this type belongs to
 * @param type The type to convert
 * @returns An array of property assignments.
 */
export declare function buildGuardFromType(state: TransformState, file: ts.SourceFile, type: ts.Type): ts.Expression;
