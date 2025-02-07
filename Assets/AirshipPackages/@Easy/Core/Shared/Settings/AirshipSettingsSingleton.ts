import { Airship } from "@Easy/Core/Shared/Airship";
import { Group } from "@Easy/Core/Shared/Airship/Types/Outputs/AirshipMatchmaking";
import { Singleton } from "@Easy/Core/Shared/Flamework";
import { Signal } from "@Easy/Core/Shared/Util/Signal";

@Singleton({})
export class AirshipSettingsSingleton {
	public readonly onGroupChange: Signal<Group> = new Signal();

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

	public AddSlider(name: string, min: number, max: number): void {
		contextbridge.invoke("Settings:AddSlider", LuauContext.Protected, name, min, max);
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
}
