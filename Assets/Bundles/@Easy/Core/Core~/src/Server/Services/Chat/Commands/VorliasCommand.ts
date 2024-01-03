import { ChatCommand } from "Shared/Commands/ChatCommand";
import { ItemStack } from "Shared/Inventory/ItemStack";
import { ItemType } from "Shared/Item/ItemType";
import { Player } from "Shared/Player/Player";

export class VorliasCommand extends ChatCommand {
	constructor() {
		super("vorlias", ["vor"]);
	}

	public Execute(player: Player, args: string[]): void {
		this.AddItem(player, ItemType.PLOW, 1);
		this.AddItem(player, ItemType.WHEAT_SEEDS, 100);
	}

	private AddItem(player: Player, itemType: ItemType, amount: number) {
		const itemStack = new ItemStack(itemType, amount);

		if (!player.character) return;

		player.character.GetInventory().AddItem(itemStack);
		player.SendMessage(`Given ${amount} ${itemStack.GetItemDef().displayName}`);
	}
}
