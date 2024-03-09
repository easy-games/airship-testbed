import { GameDto } from "../Client/Components/HomePage/API/GamesAPI";
import { CoreContext } from "./CoreClientContext";
import { CoreNetwork } from "./CoreNetwork";
import { Player } from "./Player/Player";
import { RunUtil } from "./Util/RunUtil";
import { Signal } from "./Util/Signal";

const platform = Application.platform;
const simulateMobile = EditorSessionState.GetBoolean("AirshipSimulateMobile");

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

	public static coreContext: CoreContext;

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

	/**
	 * The platform of this device.
	 *
	 * To get a certain player's platform, use {@link Player.platform}
	 */
	public static platform = AirshipPlatformUtil.GetLocalPlatform();

	public static IsMobile(): boolean {
		return (
			this.platform === AirshipPlatform.iOS ||
			this.platform === AirshipPlatform.Android ||
			this.IsSimulateMobile()
		);
	}

	public static IsClient(): boolean {
		return RunUtil.IsClient();
	}

	public static IsServer(): boolean {
		return RunUtil.IsServer();
	}

	public static IsEditor(): boolean {
		return RunUtil.IsEditor();
	}

	/**
	 * @internal
	 */
	public static IsInternal(): boolean {
		return RunUtil.IsInternal();
	}

	/**
	 * Shortcut for checking if both IsClient() and IsServer() is true.
	 */
	public static IsHosting(): boolean {
		return RunUtil.IsClient() && RunUtil.IsServer();
	}

	public static IsClone(): boolean {
		return RunUtil.IsClone();
	}

	public static IsWindows(): boolean {
		return platform === RuntimePlatform.WindowsPlayer || platform === RuntimePlatform.WindowsEditor;
	}

	public static IsMac(): boolean {
		return platform === RuntimePlatform.OSXPlayer || platform === RuntimePlatform.OSXEditor;
	}

	public static IsSimulateMobile(): boolean {
		return simulateMobile;
	}
}
