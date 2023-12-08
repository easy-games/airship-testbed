/// <reference types="@easy-games/types" />
/// <reference types="@easy-games/types" />
import { Entity } from "../../Entity/Entity";
import { CharacterEntity } from "../../Entity/Character/CharacterEntity";
import { ItemMeta } from "../ItemMeta";
import { HeldItem } from "./HeldItem";
import { HeldItemState } from "./HeldItemState";
export type HeldItemCondition = (itemMeta: ItemMeta) => boolean;
export type HeldItemFactory = (entity: Entity, itemMeta: ItemMeta) => HeldItem;
export type HeldItemEntry = {
    condition: HeldItemCondition;
    factory: HeldItemFactory;
};
/**
 * This class is attached to an {@link Entity}.
 *
 * One item manager per entity, calls functionality on currently equipped item for that entity
 */
export declare class HeldItemManager {
    entity: CharacterEntity;
    private heldItemMap;
    private emptyHeldItem;
    private currentHeldItem;
    private currentItemState;
    private bin;
    private newStateQueued;
    private static heldItemClasses;
    static RegisterHeldItem(condition: HeldItemCondition, factory: HeldItemFactory): void;
    GetLabel(): number;
    private Log;
    private GetOrCreateHeldItem;
    constructor(entity: CharacterEntity);
    Destroy(): void;
    TriggerNewState(itemState: HeldItemState): void;
    OnNewState(itemState: HeldItemState, lookVector: Vector3): void;
}
