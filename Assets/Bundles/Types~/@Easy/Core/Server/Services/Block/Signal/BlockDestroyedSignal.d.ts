/// <reference types="@easy-games/types" />
/// <reference types="@easy-games/types" />
import { CharacterEntity } from "../../../../Shared/Entity/Character/CharacterEntity";
import { Entity } from "../../../../Shared/Entity/Entity";
import { ItemStack } from "../../../../Shared/Inventory/ItemStack";
import { Cancellable } from "../../../../Shared/Util/Cancellable";
export declare class BlockDropItemSignal extends Cancellable {
    entity: Entity | undefined;
    readonly position: Vector3;
    itemStack: ItemStack;
    GiveToCharacterWhoBroke: boolean;
    constructor(entity: Entity | undefined, position: Vector3, itemStack: ItemStack);
    IsGivingToCharacter(): this is BlockDropItemSignal & {
        entity: CharacterEntity;
    };
}
