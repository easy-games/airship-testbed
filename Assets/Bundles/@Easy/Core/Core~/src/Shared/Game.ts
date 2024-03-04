import { GameDto } from "../Client/Components/HomePage/API/GamesAPI";
import { CoreContext } from "./CoreClientContext";
import { CoreNetwork } from "./CoreNetwork";
import { Player } from "./Player/Player";
import { RunUtil } from "./Util/RunUtil";
import { Signal } from "./Util/Signal";

export class Game {
	/**
	 * The local client's player.
	 *
	 * On the server this is undefined.
	 *
	 * There is a brief moment on client startup when localPlayer is undefined.
	 * You can listen for when the local player is loaded with {@link WaitForLocalPlayerLoaded}
	 */
	public static localPlayer: Player = undefined as unknown as Player;
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

	/**
	 * Empty string when in editor.
	 */
	public static serverId: string;

	/**
	 * While in editor, this will reflect whatever is defined in `Assets/GameConfig.asset`
	 */
	public static gameId: string;

	/**
	 * Empty string when in editor.
	 */
	public static organizationId: string;

	public static startingScene = SceneManager.GetActiveScene().name;

	public static gameData: GameDto | undefined;
	public static onGameDataLoaded = new Signal<GameDto>();
	public static WaitForGameData(): GameDto {
		if (this.gameData) return this.gameData;
		return this.onGameDataLoaded.Wait();
	}

	public static localPlatform = AirshipPlatformUtil.GetLocalPlatform();
}
