import { Airship } from "@Easy/Core/Shared/Airship";
import { Singleton } from "@Easy/Core/Shared/Flamework";
import { Signal } from "@Easy/Core/Shared/Util/Signal";
import { AirshipMatchmakingGroup } from "../Airship/Types/Matchmaking";

@Singleton({})
export class AirshipSettingsSingleton {
	public readonly onGroupChange: Signal<AirshipMatchmakingGroup> = new Signal();

	private leaveMatchBtnCallback: (() => void) | undefined;

	constructor() {
		Airship.Settings = this;

		contextbridge.subscribe("Menu:LeaveMatchBtnPressed", (from: LuauContext) => {
			if (this.leaveMatchBtnCallback !== undefined) {
				this.leaveMatchBtnCallback();
			}
		});
	}

	protected OnStart(): void {}

	/**
	 * Adds a slider to the game's settings.
	 * @param name The name of this slider
	 * @param startingValue The starting value of this slider
	 * @param min The minimum value this slider can be set to
	 * @param max The maximum value this slider can be set to
	 * @param [increment=0.01] The increment for this slider - defaults to `0.01`
	 */
	public AddSlider(name: string, startingValue: number, min: number, max: number, increment: number = 0.01): void {
		contextbridge.invoke("Settings:AddSlider", LuauContext.Protected, name, startingValue, min, max, increment);
	}

	/**
	 * Listen to the value of the named slider
	 * @param name The name of the toggle
	 * @param callback The callback that is fired with the initial value, as well as every time the value is changed
	 * @returns
	 */
	public ObserveSlider(name: string, callback: (val: number) => void): () => void {
		const startingVal = contextbridge.invoke("Settings:Slider:GetValue", LuauContext.Protected, name);
		task.spawn(() => {
			callback(startingVal);
		});
		return contextbridge.subscribe("Settings:Slider:OnChanged", (from: LuauContext, name2: string, val: number) => {
			if (name2 === name) {
				callback(val);
			}
		});
	}

	/**
	 * Gets the value of the named slider
	 * @param name The name of the slider
	 */
	public GetSlider(name: string): number {
		return contextbridge.invoke("Settings:Slider:GetValue", LuauContext.Protected, name);
	}

	/**
	 * Adds a toggle to the game's settings
	 * @param name The name of the setting
	 * @param startingValue The starting value of this toggle
	 */
	public AddToggle(name: string, startingValue: boolean): void {
		contextbridge.invoke("Settings:AddToggle", LuauContext.Protected, name, startingValue);
	}

	/**
	 * Listen to the value of the named toggle
	 * @param name The name of the toggle
	 * @param callback The callback that is fired with the initial value, as well as every time the value is changed
	 * @returns
	 */
	public ObserveToggle(name: string, callback: (val: boolean) => void): () => void {
		const startingVal = contextbridge.invoke("Settings:Toggle:GetValue", LuauContext.Protected, name);
		task.spawn(() => {
			callback(startingVal);
		});
		return contextbridge.subscribe(
			"Settings:Toggle:OnChanged",
			(from: LuauContext, name2: string, val: boolean) => {
				if (name2 === name) {
					callback(val);
				}
			},
		);
	}

	/**
	 * Gets the value of the named toggle
	 * @param name The name of the toggle
	 */
	public GetToggle(name: string): boolean {
		return contextbridge.invoke("Settings:Toggle:GetValue", LuauContext.Protected, name);
	}

	/** Adds a spacer to the settings menu. Purely visual for those who want to stay organized :) */
	public AddSpacer(): void {
		contextbridge.invoke("Settings:AddSpacer", LuauContext.Protected);
	}
}
