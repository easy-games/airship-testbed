const scene: string = SceneManager.GetActiveScene().name;

export class BedWars {
	public static IsLobbyServer(): boolean {
		return scene === "BWLobbyScene";
	}

	public static IsMatchServer(): boolean {
		return scene === "BWMatchScene";
	}
}
