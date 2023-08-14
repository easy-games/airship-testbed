import ts from "typescript";
import { TransformState } from "../../classes/transformState";
export type GenericIdOptions = {
    index: number;
    optional?: boolean;
};
export declare function getGenericIdMap(state: TransformState): Map<ts.Symbol, GenericIdOptions>;
