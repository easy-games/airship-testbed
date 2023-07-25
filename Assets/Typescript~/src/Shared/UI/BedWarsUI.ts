import { AudioManager } from "Shared/Audio/AudioManager";
import { CanvasAPI, HoverState } from "Shared/Util/CanvasAPI";

export class BedWarsUI {
	/**
	 * Adds UI sounds.
	 * @param gameObject
	 */
	public static SetupButton(gameObject: GameObject): void {
		CanvasAPI.OnClickEvent(gameObject, () => {
			AudioManager.PlayGlobal("UI_Select.wav");
		});
		CanvasAPI.OnHoverEvent(gameObject, (hoverState) => {
			if (hoverState === HoverState.ENTER) {
				AudioManager.PlayGlobal("UI_Hover_01.wav");
			}
		});
	}
}
