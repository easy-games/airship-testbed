import { CoreContext } from "../../CoreClientContext";
import { Game } from "../../Game";

export default class MyCreditsButton extends AirshipBehaviour {
	override Start(): void {
		if (Game.coreContext === CoreContext.GAME) {
			this.gameObject.SetActive(false);
		}
	}

	override OnDestroy(): void {}
}
