import { Game } from "@Easy/Core/Shared/Game";

export default class SteamRichPresence {
	private static status = "";

	public static GetStatus() {
		return SteamRichPresence.status;
	}

	public static SetStatus(status: string) {
		SteamRichPresence.status = status;

		const gameName = Game.gameData?.name;
		if (!gameName) return;

		SteamLuauAPI.SetGameRichPresence(gameName, status);
	}
}
