import { Airship } from "@Easy/Core/Shared/Airship";

export default class PlayerRole extends AirshipBehaviour {
	override Start(): void {
		Airship.Players.onPlayerJoined.Connect((player) => {
			if (player.orgRoleName) {
				print(`Player ${player.username} has org role ${player.orgRoleName}`);
			} else {
				print(`Player ${player.username} has no org role.`);
			}
		});

		// Airship.Inventory.RegisterItem("WoodSword", {
		// 	displayName: "Wood Sword",
		// 	maxStackSize: 1,
		// 	accessoryPaths: ["Assets/Resources/Prefabs/WoodSword.prefab"],
		// 	// image: "Assets/Resources/ItemRenders/wood_sword.png",
		// });
		// if (Game.IsServer()) {
		// 	Airship.Characters.ObserveCharacters((c) => {
		// 		const inv = c.inventory;
		// 		inv.AddItem(new ItemStack("WoodSword"));
		// 		inv.AddItem(new ItemStack("WoodSword"));
		// 		inv.AddItem(new ItemStack("WoodSword"));
		// 		inv.AddItem(new ItemStack("WoodSword"));
		// 	});
		// }
	}

	override OnDestroy(): void {}
}
