import { CoreItemType } from "@Easy/Core/Shared/Item/CoreItemType";
import { Airship } from "Shared/Airship";
import { ChatCommand } from "Shared/Commands/ChatCommand";
import { ItemStack } from "Shared/Inventory/ItemStack";
import { ArmorType } from "Shared/Item/ArmorType";
import { Player } from "Shared/Player/Player";

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
