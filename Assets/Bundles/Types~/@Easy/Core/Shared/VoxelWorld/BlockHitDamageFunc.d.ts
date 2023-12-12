/// <reference types="@easy-games/types" />
/// <reference types="@easy-games/types" />
import { Entity } from "../Entity/Entity";
import { BreakBlockDef } from "../Item/ItemDefinitionTypes";
import { Block } from "./Block";
export type BlockHitDamageFunc = (entity: Entity | undefined, block: Block, blockPos: Vector3, breakBlockDef: BreakBlockDef) => number;
