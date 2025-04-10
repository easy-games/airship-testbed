import { TabListController } from "@Easy/Core/Client/Controllers/TabList/TabListController";
import { Airship } from "@Easy/Core/Shared/Airship";
import { Group } from "@Easy/Core/Shared/Airship/Types/Outputs/AirshipMatchmaking";
import { Dependency, OnStart, Singleton } from "@Easy/Core/Shared/Flamework";
import { Signal } from "@Easy/Core/Shared/Util/Signal";
import { Game } from "../Game";

@Singleton({})
export class AirshipMenuSingleton implements OnStart {
	public readonly onGroupChange: Signal<Group> = new Signal();

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
}
