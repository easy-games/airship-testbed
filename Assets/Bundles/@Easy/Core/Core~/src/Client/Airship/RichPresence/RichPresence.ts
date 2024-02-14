import { Game } from "@Easy/Core/Shared/Game";

export default class RichPresence {
	public static SetStatus(status: string) {
		SteamLuauAPI.SetRichPresence(Game.gameId, status);
	}
}
