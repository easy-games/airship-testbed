import { Game } from "./Game";

export class CoreRefs {
	/**
	 * The root transform that acts as a folder for all core package instantiated gameobjects.
	 *
	 * This is used to avoid clutter in the game scene.
	 */
	public static rootTransform: Transform;

	/**
	 * @internal
	 */
	public static protectedTransform: Transform;

	public static Init(): void {
		let coreGo = GameObject.Find("AirshipCore");
		if (coreGo) {
			this.rootTransform = coreGo.transform;
		} else {
			const rootGo = GameObject.Create("AirshipCore");
			this.rootTransform = rootGo.transform;
		}

		if (contextbridge.current() === LuauContext.Protected) {
			let protectedSceneName = Game.IsInGame() ? "CoreScene" : "MainMenu";
			print("protectedSceneName: " + protectedSceneName);
			let protectedGo = GameObject.Find("AirshipProtected");
			if (protectedGo && protectedGo.scene.name === protectedSceneName) {
				this.protectedTransform = protectedGo.transform;
			} else {
				const protectedGo = GameObject.Create("AirshipProtected");
				SceneManager.MoveGameObjectToScene(protectedGo, Bridge.GetScene(protectedSceneName));
				this.protectedTransform = protectedGo.transform;
			}
		}
	}
}
