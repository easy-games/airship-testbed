import { Airship, Platform } from "@Easy/Core/Shared/Airship";
import ProximityPrompt from "@Easy/Core/Shared/Input/ProximityPrompts/ProximityPrompt";
import { NetworkFunction } from "@Easy/Core/Shared/Network/NetworkFunction";
import { Signal } from "@Easy/Core/Shared/Util/Signal";
import { SetInterval } from "@Easy/Core/Shared/Util/Timer";

export default class MessagingScene extends AirshipBehaviour {
	override Start(): void {
		print("Hello, World! from AirshipComponent!");
		if (RunCore.IsServer()) {
			const result = Platform.Server.Messaging.Subscribe("test", (data) => {
				print("Received message: " + data);
			});
			if (!result.success) {
				print("MessagingScene failed to subscribe");
			}

			SetInterval(2, () => {
				Platform.Server.Messaging.Publish("test", "Hello from server!");
			});
		}
	}
}
