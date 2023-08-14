import ts from "typescript";
import { TransformerConfig } from "./classes/transformState";
export default function (program: ts.Program, config?: TransformerConfig): (context: ts.TransformationContext) => (file: ts.SourceFile) => ts.Node;
