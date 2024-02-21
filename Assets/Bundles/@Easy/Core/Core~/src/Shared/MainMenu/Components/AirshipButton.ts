import { Bin } from "../../Util/Bin";
import { CanvasAPI, PointerButton, PointerDirection } from "../../Util/CanvasAPI";

export default class AirshipButton extends AirshipBehaviour {
	public clickType = 0;

	private bin = new Bin();

	override Start(): void {
		const rect = this.gameObject.GetComponent<RectTransform>();
		const startPos = rect.anchoredPosition;

		this.bin.AddEngineEventConnection(
			CanvasAPI.OnPointerEvent(this.gameObject, (dir, button) => {
				if (button !== PointerButton.LEFT) return;

				if (this.clickType === 0) {
					this.gameObject
						.GetComponent<RectTransform>()
						.TweenLocalScale(
							dir === PointerDirection.DOWN ? new Vector3(0.8, 0.8, 0.8) : new Vector3(1, 1, 1),
							0.1,
						);
				} else if (this.clickType === 1) {
					this.gameObject
						.GetComponent<RectTransform>()
						.TweenAnchoredPosition(
							dir === PointerDirection.DOWN ? startPos.add(new Vector2(0, -2)) : startPos,
							0.05,
						);
				}
			}),
		);
	}

	public PlayClickEffect(): void {
		if (this.clickType === 0) {
			this.gameObject
				.GetComponent<RectTransform>()
				.TweenLocalScale(new Vector3(0.8, 0.8, 0.8), 0.1)
				.SetPingPong();
		}
	}

	override OnDestroy(): void {
		this.bin.Clean();
	}
}
