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

	protected OnStart(): void { }

	/**
	 * Creates a slider setting for numeric values between a min and a max
	 * 
	 * @param name Name of the slider setting
	 * @param startingValue Starting setting value
	 * @param min Minimum value of the slider
	 * @param max Maximum value of the slider
	 * @param increment What is the smallest increment between two values in the slider
	 */
	public AddSlider(name: string, startingValue: number, min: number, max: number, increment?: number): void {
		if (increment === undefined) {
			// Default behaviour grabs closest nearby power of 10 to one hundredth of the range
			// Ex: range of 75 would have an increment of 1
			const smallestNearbyPowerOf10 = math.round(math.log10((max - min) / 100));
			increment = math.pow(10, smallestNearbyPowerOf10);
		}

		contextbridge.invoke("Settings:AddSlider", LuauContext.Protected, name, startingValue, min, max, increment);
	}

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

	public GetSlider(name: string): number {
		return contextbridge.invoke("Settings:Slider:GetValue", LuauContext.Protected, name);
	}

	public AddToggle(name: string, startingValue: boolean): void {
		contextbridge.invoke("Settings:AddToggle", LuauContext.Protected, name, startingValue);
	}

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

	public GetToggle(name: string): boolean {
		return contextbridge.invoke("Settings:Toggle:GetValue", LuauContext.Protected, name);
	}

	/** Adds a spacer to the settings menu. Purely visual for those who want to stay organized :) */
	public AddSpacer(): void {
		contextbridge.invoke("Settings:AddSpacer", LuauContext.Protected);
	}
}
