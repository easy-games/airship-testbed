import { Airship } from "@Easy/Core/Shared/Airship";
import { Keyboard } from "@Easy/Core/Shared/UserInput";

export default class PartyMenuOpener extends AirshipBehaviour {
	override Start(): void {
		Keyboard.OnKeyDown(Key.P, () => {
			Airship.Menu.OpenPartyMenu();
		});
	}

	override OnDestroy(): void {}
}
