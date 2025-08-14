import { TabListController } from "@Easy/Core/Client/Controllers/TabList/TabListController";
import { Airship } from "@Easy/Core/Shared/Airship";
import { Dependency, OnStart, Singleton } from "@Easy/Core/Shared/Flamework";
import { Game } from "../Game";
import { Signal } from "../Util/Signal";

@Singleton({})
export class AirshipMenuSingleton implements OnStart {
	/**
	 * Fired when the local player opens and closes the Main Menu (escape key).
	 *
	 * You can also use {@link IsMenuOpen()} to check if opened.
	 */
	public readonly onMenuToggled = new Signal<[opened: boolean]>();

	private leaveMatchBtnCallback: (() => void) | undefined;

	constructor() {
		Airship.Menu = this;

		contextbridge.subscribe("Menu:LeaveMatchBtnPressed", (from: LuauContext) => {
			if (this.leaveMatchBtnCallback !== undefined) {
				this.leaveMatchBtnCallback();
			}
		});
	}

	public OnStart(): void {}

	/**
	 * Used to check if the Airship Escape Menu is opened.
	 *
	 * @returns True if the Airship Escape Menu is open.
	 */
	public static IsMenuOpen(): boolean {
		if (Game.IsGameLuauContext()) {
			return contextbridge.invoke("Game:IsMenuOpen", LuauContext.Protected);
		}
		return false;
	}

	/**
	 * Adds a special "Leave Match" button.
	 * This will replace the regular "Disconnect" button with a "Quit to Main Menu" button.
	 *
	 * This is useful for when the player is in a match and can leave to return to a lobby.
	 *
	 * @param text Text shown on the button. Example: "Leave Match"
	 * @param callback Code that is ran when the button is pressed.
	 */
	public AddLeaveMatchButton(text: string, callback: () => void): void {
		contextbridge.invoke("Menu:AddLeaveMatchButton", LuauContext.Protected, text);
		this.leaveMatchBtnCallback = callback;
	}

	public SetTabListEnabled(enabled: boolean): void {
		if (!Game.IsClient()) return;
		Dependency<TabListController>().tablistEnabled = enabled;
		if (!enabled) {
			Dependency<TabListController>().Hide(true, true);
		}
	}

	/**
	 * Opens the Airship escape menu.
	 */
	public OpenMenu(): void {
		contextbridge.invoke("MainMenu:OpenFromGame", LuauContext.Protected);
	}
}
