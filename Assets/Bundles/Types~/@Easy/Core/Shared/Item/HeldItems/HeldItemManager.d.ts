import Character from "../../Character/Character";
import { ItemDef } from "../ItemDefinitionTypes";
import { HeldItem } from "./HeldItem";
export type HeldItemCondition = (itemDef: ItemDef) => boolean;
export type HeldItemFactory = (character: Character, itemDef: ItemDef) => HeldItem;
export type HeldItemEntry = {
    condition: HeldItemCondition;
    factory: HeldItemFactory;
};
export interface HeldItemActionState {
    characterId: number;
    stateIndex: number;
    isActive: boolean;
    lookVector: Vector3;
}
/**
 * This class is attached to an {@link Character}.
 *
 * One item manager per character, calls functionality on currently equipped item for that entity
 */
export declare class HeldItemManager {
    character: Character;
    private heldItemMap;
    private emptyHeldItem;
    private currentHeldItem;
    private currentItemState;
    private bin;
    private newStateQueued;
    private static heldItemClasses;
    static RegisterHeldItem(condition: HeldItemCondition, factory: HeldItemFactory): void;
    GetLabel(): number;
    GetCurrentHeldItem(): HeldItem;
    private Log;
    private GetOrCreateHeldItem;
    constructor(character: Character);
    Destroy(): void;
    TriggerNewState(stateIndex: number, isActive: boolean): void;
    OnNewState(stateIndex: number, isActive: boolean, lookVector: Vector3): void;
}
