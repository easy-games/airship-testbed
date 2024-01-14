export class CoreRefs {
	/**
	 * The root transform that acts as a folder for all core package instantiated gameobjects.
	 *
	 * This is used to avoid clutter in the game scene.
	 */
	public static rootTransform: Transform;

	public static Init(): void {
		let coreGo = GameObject.Find("AirshipCore");
		if (coreGo) {
			this.rootTransform = coreGo.transform;
			const coreScene = SceneManager.GetSceneByName("CoreScene") as Scene | undefined;
			if (coreScene) {
				SceneManager.MoveGameObjectToScene(this.rootTransform.gameObject, coreScene);
			}
		} else {
			const rootGo = GameObject.Create("AirshipCore");
			const coreScene = SceneManager.GetSceneByName("CoreScene");
			SceneManager.MoveGameObjectToScene(rootGo, coreScene);
			this.rootTransform = rootGo.transform;
		}
	}
}
