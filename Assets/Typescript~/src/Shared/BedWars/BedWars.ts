const scene: string = SceneManager.GetActiveScene().name;

export class BedWars {
	public static IsLobbyServer(): boolean {
		return scene.lower().find("bwlobbyscene")[0] !== undefined;
	}

	public static IsMatchServer(): boolean {
		return scene.lower().find("bwmatchscene")[0] !== undefined;
	}
}
