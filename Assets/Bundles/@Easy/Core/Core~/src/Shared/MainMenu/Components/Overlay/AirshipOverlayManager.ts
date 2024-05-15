import { ControlScheme, Preferred } from "@Easy/Core/Shared/UserInput";
import { Bin } from "../../../Util/Bin";

export default class AirshipOverlayManager extends AirshipBehaviour {
	@Header("References")
	public escapeButton!: RectTransform;
	public chatButton!: RectTransform;

	private bin = new Bin();

	override Start(): void {
		const controls = new Preferred();
		this.bin.Add(
			controls.ObserveControlScheme((scheme) => {
				if (scheme === ControlScheme.Touch) {
					this.escapeButton.gameObject.SetActive(true);
					this.chatButton.gameObject.SetActive(true);
				} else {
					this.escapeButton.gameObject.SetActive(false);
					this.chatButton.gameObject.SetActive(false);
				}
			}),
		);
	}

	override OnDestroy(): void {
		this.bin.Clean();
	}
}
