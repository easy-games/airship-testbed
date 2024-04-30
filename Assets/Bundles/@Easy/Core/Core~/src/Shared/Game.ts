import { GameDto } from "../Client/Components/HomePage/API/GamesAPI";
import { CoreContext } from "./CoreClientContext";
import { CoreNetwork } from "./CoreNetwork";
import { Player } from "./Player/Player";
import { RunUtil } from "./Util/RunUtil";
import { Signal } from "./Util/Signal";

const platform = Application.platform;
// const simulateMobile = EditorSessionState.GetBoolean("AirshipSimulateMobile");

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
	public static onDeviceOrientationChanged = new Signal<"landscape" | "portrait">();

	public static readonly deviceType = DeviceBridge.GetDeviceType();

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

	/**
	 * Returns true if device is a phone or tablet.
	 *
	 * Returns false if on desktop or console.
	 */
	public static IsMobile(): boolean {
		if (Game.IsEditor()) {
			if (this.deviceType === AirshipDeviceType.Phone || this.deviceType === AirshipDeviceType.Tablet) {
				return true;
			}
		}
		return this.platform === AirshipPlatform.iOS || this.platform === AirshipPlatform.Android;
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

	public static IsLandscape(): boolean {
		return Screen.width >= Screen.height;
	}

	public static IsPortrait(): boolean {
		return !this.IsLandscape();
	}

	public static GetNotchHeight(): number {
		if (Game.IsMobile()) {
			return 35;
		}
		return 0;
	}

	/**
	 * @internal
	 */
	public static GetScaleFactor(): number {
		let dpi = Screen.dpi;

		if (Game.IsMobile()) {
			return dpi / 180;
		} else if (dpi >= 255) {
			return 1.75;
		} else {
			return 1;
		}
	}

	/**
	 * @internal
	 * @returns
	 */
	public static IsInGame(): boolean {
		return this.coreContext === CoreContext.GAME;
	}

	/**
	 * @internal
	 * @returns
	 */
	public static IsProtectedContext(): boolean {
		return contextbridge.current() === LuauContext.Protected;
	}

	/**
	 * @internal
	 * @returns
	 */
	public static IsGameContext(): boolean {
		return contextbridge.current() === LuauContext.Game;
	}
}
