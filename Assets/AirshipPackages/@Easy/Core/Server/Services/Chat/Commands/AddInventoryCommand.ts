import { Airship } from "@Easy/Core/Shared/Airship";
import { ChatCommand } from "@Easy/Core/Shared/Commands/ChatCommand";
import { ItemStack } from "@Easy/Core/Shared/Inventory/ItemStack";
import { Player } from "@Easy/Core/Shared/Player/Player";

export class AddInventoryCommand extends ChatCommand {
	constructor() {
		super("i", [], "<ItemType> [amount]", "Adds items to your inventory", true);
	}

	public Execute(player: Player, args: string[]): void {
		if (args.size() < 1) {
			player.SendMessage("Invalid arguments. Usage: /i <[@Org/Package:]item_type> [amount]");
			return;
		}

		let itemTypeExpression = args[0];

		const itemType = Airship.Inventory.FindItemTypeFromExpression(itemTypeExpression);
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
		const maxSize = Airship.Inventory.GetItemDef(itemType).maxStackSize;

		if (maxSize && maxSize > amount) {
			player.SendMessage(`Max stack size for ${itemType} is ${maxSize}`);
		}
		const amountToAdd = math.min(amount, maxSize ?? math.huge);
		if (!player.character) return;
		player.character.inventory?.AddItem(new ItemStack(itemType, amountToAdd));
		player.SendMessage(`Given ${amountToAdd} ${itemType.lower()}`);
	}
}
