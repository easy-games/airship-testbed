import { OnStart, Singleton } from "Shared/Flamework";
import { Airship } from "../Airship";

@Singleton({})
export class AirshipChatSingleton implements OnStart {
	constructor() {
		Airship.chat = this;
	}

	OnStart(): void {}

	public SetUIEnabled(val: boolean): void {
		contextbridge.invoke<(val: boolean) => void>("ClientChatSingleton:SetUIEnabled", LuauContext.Protected, val);
	}
}
