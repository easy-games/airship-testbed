import { Controller, OnStart } from "@easy-games/flamework-core";
import { Keyboard } from "Shared/UserInput";

@Controller()
export class AbilitiesController implements OnStart {
	public OnStart(): void {
		const keyboard = new Keyboard();

		const slots = [
			// KeyCode.Q,
			// KeyCode.E,
			// KeyCode.R,
			// KeyCode.T,
			// KeyCode.F,
			KeyCode.Z,
			KeyCode.X,
			KeyCode.C,
			KeyCode.V,
		];

		for (const slot of slots) {
			keyboard.OnKeyDown(slot, (event) => {});
		}

		Input;
	}
}
