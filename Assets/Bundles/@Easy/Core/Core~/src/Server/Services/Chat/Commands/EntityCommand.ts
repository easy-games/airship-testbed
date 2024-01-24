import { ChatCommand } from "Shared/Commands/ChatCommand";
import { Player } from "Shared/Player/Player";

export class EntityCommand extends ChatCommand {
	constructor() {
		super("entity", ["e"], "[health]");
	}

	public Execute(player: Player, args: string[]): void {
		// if (!player.character) return;
		// const pos = player.character.gameObject.transform.position;
		// const entity = entityService.SpawnEntity(EntityPrefabType.HUMAN, pos);
		// entity.AddHealthbar();
		// entity
		// 	.GetInventory()
		// 	.SetItem(entity.GetInventory().armorSlots[ArmorType.HELMET], new ItemStack(ItemType.LEATHER_HELMET));
		// if (args.size() >= 1) {
		// 	const health = tonumber(args[0]);
		// 	if (health !== undefined) {
		// 		entity.SetMaxHealth(health);
		// 		entity.SetHealth(health);
		// 	}
		// }
	}
}
