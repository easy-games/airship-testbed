import { AudioManager } from "Shared/Audio/AudioManager";
import { CanvasAPI, HoverState } from "Shared/Util/CanvasAPI";

export class CoreUI {
	/**
	 * Adds UI sounds.
	 * @param gameObject
	 */
	public static SetupButton(
		gameObject: GameObject,
		config?: {
			noHoverSound?: boolean;
		},
	): void {
		CanvasAPI.OnClickEvent(gameObject, () => {
			AudioManager.PlayGlobal("Imports/Core/Shared/Resources/Sound/UI_Select.wav");
		});
		if (!config?.noHoverSound) {
			CanvasAPI.OnHoverEvent(gameObject, (hoverState) => {
				if (hoverState === HoverState.ENTER) {
					AudioManager.PlayGlobal("Imports/Core/Shared/Resources/Sound/UI_Hover_01.wav");
				}
			});
		}
	}
}
