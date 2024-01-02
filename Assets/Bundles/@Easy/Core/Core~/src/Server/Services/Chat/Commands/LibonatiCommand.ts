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
			ItemType.WOOD_SWORD,
			ItemType.EMERALD_SWORD,
			ItemType.WOOD_BOW,
			ItemType.WOOD_CROSSBOW,
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
			ItemType.STONE_SWORD,
			ItemType.IRON_SWORD,
			ItemType.DIAMOND_SWORD,
		];
		items.forEach((value) => {
			this.AddItem(player, value, 999);
		});
	}

	private AddItem(player: Player, itemType: ItemType, amount: number) {
		const itemStack = new ItemStack(itemType, amount);

		if (!player.Character) return;

		player.Character.GetInventory().AddItem(itemStack);
		player.SendMessage(`Given ${amount} ${itemStack.GetItemDef().displayName}`);
	}
}
