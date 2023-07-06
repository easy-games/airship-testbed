import { ItemStack } from "Shared/Inventory/ItemStack";
import { IsItemType } from "Shared/Item/ItemDefinitions";
import { ItemType } from "Shared/Item/ItemType";
import { Player } from "Shared/Player/Player";
import { ChatCommand } from "./ChatCommand";

export class AddInventoryCommand extends ChatCommand {
	constructor() {
		super("addInventory", ["add", "i"]);
	}

	public Execute(player: Player, args: string[]): void {
		if (args.size() < 1) {
			player.SendMessage("Invalid arguments. Usage: /i <item_type> [amount]");
			return;
		}

		if (!IsItemType(args[0].upper())) {
			player.SendMessage("Invalid item type: " + args[0]);
			return;
		}

		let itemType = args[0].upper() as ItemType;
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
		player.SendMessage(`Given ${amount} ${itemStack.GetItemMeta().displayName}`);
	}
}
