import { CanvasAPI, HoverState } from "Shared/Util/CanvasAPI";
import { SoundUtil } from "Shared/Util/SoundUtil";

export class BedWarsUI {
	/**
	 * Adds UI sounds.
	 * @param gameObject
	 */
	public static SetupButton(gameObject: GameObject): void {
		CanvasAPI.OnClickEvent(gameObject, () => {
			SoundUtil.PlayGlobal("UI_Click.wav");
		});
		CanvasAPI.OnHoverEvent(gameObject, (hoverState) => {
			if (hoverState === HoverState.ENTER) {
				SoundUtil.PlayGlobal("UI_Hover_01.wav");
			}
		});
	}
}
