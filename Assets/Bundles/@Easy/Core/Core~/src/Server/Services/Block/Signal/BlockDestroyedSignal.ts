import { CharacterEntity } from "Shared/Entity/Character/CharacterEntity";
import { Entity } from "Shared/Entity/Entity";
import { ItemStack } from "Shared/Inventory/ItemStack";
import { Cancellable } from "Shared/Util/Cancellable";

export class BlockDropItemSignal extends Cancellable {
	public GiveToCharacterWhoBroke = true;

	constructor(public entity: Entity | undefined, public readonly position: Vector3, public itemStack: ItemStack) {
		super();
	}

	public IsGivingToCharacter(): this is BlockDropItemSignal & { entity: CharacterEntity } {
		return this.entity instanceof CharacterEntity && this.GiveToCharacterWhoBroke;
	}
}
