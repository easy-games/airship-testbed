import { CoreContext } from "./CoreClientContext";
import { CoreNetwork } from "./CoreNetwork";
import { Player } from "./Player/Player";
import { RunUtil } from "./Util/RunUtil";
import { Signal } from "./Util/Signal";

export class Game {
	public static localPlayer: Player = new Player(
		undefined as unknown as NetworkObject,
		-1,
		"1",
		"LocalPlayer",
		"null",
	);
	public static localPlayerLoaded = false;
	public static onLocalPlayerLoaded = new Signal<void>();

	public static WaitForLocalPlayerLoaded(): void {
		if (this.localPlayerLoaded) return;
		this.onLocalPlayerLoaded.Wait();
	}

	public static BroadcastMessage(message: string): void {
		if (RunUtil.IsServer()) {
			CoreNetwork.ServerToClient.ChatMessage.server.FireAllClients(message);
		} else {
			Game.localPlayer.SendMessage(message);
		}
	}

	public static context: CoreContext;

	public static serverId: string;
	public static gameId: string;

	public static startingScene = SceneManager.GetActiveScene().name;
}
