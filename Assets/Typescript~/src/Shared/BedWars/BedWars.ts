const scene: string = SceneManager.GetActiveScene().name;

export class BedWars {
	public static IsLobbyMode(): boolean {
		return scene.lower().find("bwlobbyscene")[0] !== undefined;
	}

	public static IsMatchMode(): boolean {
		return scene.lower().find("bwmatchscene")[0] !== undefined;
	}

	public static GameId = "6536ee084c9987573c3a3c03";
}
