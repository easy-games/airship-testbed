import { ChatCommand } from "Shared/Commands/ChatCommand";
import { ItemStack } from "Shared/Inventory/ItemStack";
import { ItemType } from "Shared/Item/ItemType";
import { Player } from "Shared/Player/Player";

export class LibonatiCommand extends ChatCommand {
	constructor() {
		super("libonati", ["lib"]);
	}

	public Execute(player: Player, args: string[]): void {
		const items = [
			ItemType.WOOD_BOW,
			ItemType.TELEPEARL,
			ItemType.FIREBALL,
			ItemType.DIRT,
			ItemType.STONE,
			ItemType.CERAMIC,
			ItemType.OBSIDIAN,
			ItemType.OAK_WOOD_PLANK,
			ItemType.RED_WOOL,
			ItemType.IRON,
			ItemType.EMERALD,
			ItemType.DIAMOND,
			ItemType.OBSIDIAN,
			ItemType.WOOD_ARROW,
		];
		items.forEach((value) => {
			this.AddItem(player, value, 999);
		});
	}

	private AddItem(player: Player, itemType: ItemType, amount: number) {
		const itemStack = new ItemStack(itemType, amount);

		if (!player.character) return;

		player.character.GetInventory().AddItem(itemStack);
		player.SendMessage(`Given ${amount} ${itemStack.GetItemMeta().displayName}`);
	}
}
