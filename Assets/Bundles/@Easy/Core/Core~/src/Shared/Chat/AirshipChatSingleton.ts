import { ChatController } from "@Easy/Core/Client/Controllers/Chat/ChatController";
import { Dependency, OnStart, Singleton } from "Shared/Flamework";
import { Airship } from "../Airship";

@Singleton({})
export class AirshipChatSingleton implements OnStart {
	constructor() {
		Airship.chat = this;
	}

	OnStart(): void {}

	public SetUIEnabled(val: boolean): void {
		Dependency<ChatController>().canvas.gameObject.SetActive(val);
	}
}
