import { CoreContext } from "./CoreClientContext";
import { CoreNetwork } from "./CoreNetwork";
import { Player } from "./Player/Player";
import { RunUtil } from "./Util/RunUtil";

export class Game {
	public static LocalPlayer: Player = new Player(
		undefined as unknown as NetworkObject,
		-1,
		"1",
		"LocalPlayer",
		"null",
	);

	public static BroadcastMessage(message: string): void {
		if (RunUtil.IsServer()) {
			CoreNetwork.ServerToClient.ChatMessage.Server.FireAllClients(message);
		} else {
			Game.LocalPlayer.SendMessage(message);
		}
	}

	public static Context: CoreContext;

	public static ServerId: string;
	public static GameId: string;

	public static StartingScene = SceneManager.GetActiveScene().name;
}
