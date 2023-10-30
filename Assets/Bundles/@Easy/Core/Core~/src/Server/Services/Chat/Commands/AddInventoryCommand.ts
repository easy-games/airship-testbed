import { ChatCommand } from "Shared/Commands/ChatCommand";
import { ItemStack } from "Shared/Inventory/ItemStack";
import { ItemType } from "Shared/Item/ItemType";
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

		let itemTypeString = args[0];
		if (!itemTypeString.match("^@([A-z]+)/(.*):")[0]) {
			print("use default easy games core stuff");
			itemTypeString = `@Easy/Core:`;
		}

		const itemType = ItemUtil.FindItemTypeFromString(itemTypeString);
		if (!itemType) {
			player.SendMessage("Invalid item type: " + args[0]);
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

		if (!player.Character) return;

		player.Character.GetInventory().AddItem(itemStack);
		player.SendMessage(`Given ${amount} ${itemStack.GetItemMeta().displayName} (${itemType})`);
	}
}
