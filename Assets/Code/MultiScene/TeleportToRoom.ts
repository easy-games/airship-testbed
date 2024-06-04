import { Airship } from "@Easy/Core/Shared/Airship";
import { Game } from "@Easy/Core/Shared/Game";

export default class TeleportToRoom extends AirshipBehaviour {
	public targetScene!: string;

	override Start(): void {}

	public OnTriggerEnter(collider: Collider): void {
		if (!Game.IsServer()) return;
		if (collider.isTrigger) return;
		const character = Airship.characters.FindByCollider(collider);
		if (character?.player && !character.IsDespawned()) {
			print("teleporting!");
			character.Despawn();
			task.wait(0);
			const existingScene = Airship.sceneManager.GetActiveScene().name;
			Airship.sceneManager.LoadSceneForPlayer(character.player, this.targetScene, true);
			Airship.sceneManager.UnloadSceneForPlayer(character.player, existingScene, this.targetScene);
		}
	}

	// public OnTriggerExit(collider: Collider): void {
	// 	if (collider.isTrigger) return;
	// 	const character = Airship.characters.FindByCollider(collider);
	// 	if (character?.player) {
	// 		Airship.sceneManager.UnloadSceneForPlayer(character.player, "MultiScene_Room", "MultiScene_Base");
	// 	}
	// }

	override OnDestroy(): void {}
}
