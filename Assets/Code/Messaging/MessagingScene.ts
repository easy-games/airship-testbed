import { Airship, Platform } from "@Easy/Core/Shared/Airship";
import ProximityPrompt from "@Easy/Core/Shared/Input/ProximityPrompts/ProximityPrompt";
import { NetworkFunction } from "@Easy/Core/Shared/Network/NetworkFunction";
import { Signal } from "@Easy/Core/Shared/Util/Signal";
import { SetInterval } from "@Easy/Core/Shared/Util/Timer";

export default class MessagingScene extends AirshipBehaviour {
	override Start(): void {
		print("Hello, World! from AirshipComponent!");
		if (RunCore.IsServer()) {
			let unsubscribe: (() => void) | undefined = undefined;

			SetInterval(5, () => {
				if (!unsubscribe) {
					print("Subscribing to test topic");
					unsubscribe = Platform.Server.Messaging.Subscribe("test", (data) => {
						print("Received message: " + data);
					}).unsubscribe;
				} else if (unsubscribe) {
					print("Unsubscribing from test topic");
					unsubscribe();
					unsubscribe = undefined;
				}
			});

			SetInterval(2, () => {
				Platform.Server.Messaging.Publish("test", "Hello from server!").then((result) => {
					if (result.success) {
						print("Message published successfully");
					} else {
						print("Failed to publish message");
					}
				}).catch((err) => {
					print("Error publishing message:", err);
				});
			});
		}
	}
}
