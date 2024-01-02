import { Dependency } from "@easy-games/flamework-core";
import { ChatCommand } from "Shared/Commands/ChatCommand";
import { EntityPrefabType } from "Shared/Entity/EntityPrefabType";
import { ItemStack } from "Shared/Inventory/ItemStack";
import { ArmorType } from "Shared/Item/ArmorType";
import { ItemType } from "Shared/Item/ItemType";
import { Player } from "Shared/Player/Player";
import { EntityService } from "../../Entity/EntityService";

export class EntityCommand extends ChatCommand {
	constructor() {
		super("entity", ["e"], "[health]");
	}

	public Execute(player: Player, args: string[]): void {
		const entityService = Dependency<EntityService>();

		if (!player.Character) return;

		const pos = player.Character.GameObject.transform.position;
		const entity = entityService.SpawnEntity(EntityPrefabType.HUMAN, pos);
		entity.AddHealthbar();

		entity
			.GetInventory()
			.SetItem(entity.GetInventory().ArmorSlots[ArmorType.HELMET], new ItemStack(ItemType.LEATHER_HELMET));

		if (args.size() >= 1) {
			const health = tonumber(args[0]);
			if (health !== undefined) {
				entity.SetMaxHealth(health);
				entity.SetHealth(health);
			}
		}
	}
}
