import { NametagController } from "@Easy/Core/Client/Controllers/Entity/Nametag/NametagController";
import { Airship } from "@Easy/Core/Shared/Airship";
import { Dependency } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";

export default class NPCSpawner extends AirshipBehaviour {
	public spawnpoint: Transform;

	override Start(): void {
		Dependency<NametagController>().SetNametagsEnabled(true);

		if (!Game.IsServer()) return;

		this.SpawnWhenReady();
	}

	private SpawnWhenReady(): void {
		const character = Airship.Characters.SpawnNonPlayerCharacter(this.spawnpoint.position);
		const inv = character.inventory;

		character.SetDisplayName("Test Tag!");

		if (!inv) return;
		// inv.SetItem(1, new ItemStack("WoodSword"));
		inv.SetHeldSlot(1);

		task.spawn(() => {
			let i = inv.heldSlot;
			while (task.wait(1)) {
				if (i === 0) {
					i = 1;
				} else {
					i = 0;
				}
				inv.SetHeldSlot(i);
			}
		});
	}

	override OnDestroy(): void {}
}
