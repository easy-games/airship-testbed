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

			// const ui = Object.Instantiate(AssetCache.LoadAsset("Assets/Resources/Prefabs/TeleportScreen.prefab"));
			// Object.DontDestroyOnLoad(ui);
			// const img = ui.transform.GetChild(0).GetComponent<Image>();
			// img.transform.localScale = Vector3.zero;
			// img.TweenLocalScale(Vector3.one.mul(1.3), 0.7).SetEase(EaseType.QuadInOut);
			// task.delay(1.5, () => {
			// 	img.TweenLocalScale(Vector3.zero, 0.7).SetEase(EaseType.QuadOut);
			// 	task.wait(1);
			// 	Object.Destroy(ui);
			// });

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
