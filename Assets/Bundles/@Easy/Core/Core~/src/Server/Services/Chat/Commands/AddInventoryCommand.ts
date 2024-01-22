import { ChatCommand } from "Shared/Commands/ChatCommand";
import { ItemStack } from "Shared/Inventory/ItemStack";
import { ItemUtil } from "Shared/Item/ItemUtil";
import { Player } from "Shared/Player/Player";

export class AddInventoryCommand extends ChatCommand {
	constructor() {
		super("i", [], "<ItemType> [amount]");
	}

	public Execute(player: Player, args: string[]): void {
		if (args.size() < 1) {
			player.SendMessage("Invalid arguments. Usage: /i <[@Org/Package:]item_type> [amount]");
			return;
		}

		let itemTypeExpression = args[0];

		const itemType = ItemUtil.FindItemTypeFromExpression(itemTypeExpression);
		if (!itemType) {
			player.SendMessage("Invalid item type: " + itemTypeExpression.lower());
			return;
		}

		let amount = 1;
		if (args.size() >= 2) {
			const num = tonumber(args[1]);
			if (num !== undefined && num > 0) {
				amount = num;
			}
		}
		const itemStack = new ItemStack(itemType, amount);

		if (!player.character) return;

		// player.character.GetInventory().AddItem(itemStack);
		player.SendMessage(`Given ${amount} ${itemStack.GetItemDef().displayName} (${itemType.lower()})`);
	}
}
