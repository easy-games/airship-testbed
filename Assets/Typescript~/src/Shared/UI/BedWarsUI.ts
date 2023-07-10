import { CanvasAPI, HoverState } from "Shared/Util/CanvasAPI";
import { AudioManager } from "Shared/Audio/AudioManager";

export class BedWarsUI {
	/**
	 * Adds UI sounds.
	 * @param gameObject
	 */
	public static SetupButton(gameObject: GameObject): void {
		CanvasAPI.OnClickEvent(gameObject, () => {
			AudioManager.PlayGlobal("UI_Click.wav");
		});
		CanvasAPI.OnHoverEvent(gameObject, (hoverState) => {
			if (hoverState === HoverState.ENTER) {
				AudioManager.PlayGlobal("UI_Hover_01.wav");
			}
		});
	}
}
