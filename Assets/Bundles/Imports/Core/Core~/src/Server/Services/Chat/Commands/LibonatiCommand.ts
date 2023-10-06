import { ChatCommand } from "Shared/Commands/ChatCommand";
import { ItemStack } from "Shared/Inventory/ItemStack";
import { ItemType } from "Shared/Item/ItemType";
import { ItemUtil } from "Shared/Item/ItemUtil";
import { Player } from "Shared/Player/Player";

export class LibonatiCommand extends ChatCommand {
	constructor() {
		super("libonati", ["lib"]);
	}

	public Execute(player: Player, args: string[]): void {
		this.AddItem(player, ItemType.WOOD_BOW, 1);
		this.AddItem(player, ItemType.WOOD_ARROW, 100);
		this.AddItem(player, ItemType.TELEPEARL, 100);
		this.AddItem(player, ItemType.FIREBALL, 100);
		this.AddItem(player, ItemType.IRON_BLOCK, 100);
		this.AddItem(player, ItemType.CERAMIC, 100);
		this.AddItem(player, ItemType.STONE_BRICK, 100);
		this.AddItem(player, ItemType.DIRT, 100);
		this.AddItem(player, ItemType.IRON, 500);
		this.AddItem(player, ItemType.EMERALD, 500);
		this.AddItem(player, ItemType.DIAMOND, 500);
	}

	private AddItem(player: Player, itemType: ItemType, amount: number) {
		const itemStack = new ItemStack(itemType, amount);

		if (!player.Character) return;

		player.Character.GetInventory().AddItem(itemStack);
		player.SendMessage(`Given ${amount} ${itemStack.GetItemMeta().displayName}`);
	}
}
