/// <reference types="@easy-games/types" />
/// <reference types="@easy-games/types" />
import Character from "../Character/Character";
import { BreakBlockDef } from "../Item/ItemDefinitionTypes";
import { Block } from "./Block";
export type BlockHitDamageFunc = (character: Character | undefined, block: Block, blockPos: Vector3, breakBlockDef: BreakBlockDef) => number;
