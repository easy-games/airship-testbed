import { CoreItemType } from "@Easy/Core/Shared/Item/CoreItemType";
import { Airship } from "@Easy/Core/Shared/Airship";
import { ChatCommand } from "@Easy/Core/Shared/Commands/ChatCommand";
import { ItemStack } from "@Easy/Core/Shared/Inventory/ItemStack";
import { ArmorType } from "@Easy/Core/Shared/Item/ArmorType";
import { Player } from "@Easy/Core/Shared/Player/Player";

export class EntityCommand extends ChatCommand {
	constructor() {
		super("entity", ["e"], "[health]");
	}

	public Execute(player: Player, args: string[]): void {
		if (!player.character) return;
		const pos = player.character.gameObject.transform.position;
		const character = Airship.characters.SpawnNonPlayerCharacter(pos);
		// character.AddHealthbar();
		character.inventory.SetItem(
			character.inventory.armorSlots[ArmorType.HELMET],
			new ItemStack(CoreItemType.LEATHER_HELMET),
		);
		if (args.size() >= 1) {
			const health = tonumber(args[0]);
			if (health !== undefined) {
				character.SetMaxHealth(health);
				character.SetHealth(health);
			}
		}
	}
}
