import { Airship } from "@Easy/Core/Shared/Airship";

export default class ChatSpam extends AirshipBehaviour {
	override Start(): void {
		// if (Game.IsServer()) {
		// 	let counter = 1;
		// 	while (task.wait(1)) {
		// 		Game.BroadcastMessage("Hello, world! " + counter);
		// 		counter++;
		// 	}
		// }

		Airship.Settings.AddSlider("test", 50, 1, 100);
		Airship.Settings.AddToggle("example", false);
	}

	// protected Update(dt: number): void {
	// 	if (Game.IsMobile()) {
	// 		const touch = Touchscreen.current.primaryTouch;
	// 		if (touch.press.isPressed) {
	// 			print("pressed!");
	// 		}
	// 	}
	// }

	override OnDestroy(): void {}
}
