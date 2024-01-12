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
		} else {
			this.rootTransform = GameObject.Create("AirshipCore").transform;
		}
	}
}
