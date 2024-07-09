import { CanvasAPI, PointerButton, PointerDirection } from "../../Util/CanvasAPI";

export default class NavbarControlButton extends AirshipBehaviour {
	override Start(): void {
		CanvasAPI.OnPointerEvent(this.gameObject, (dir, button) => {
			if (button !== PointerButton.LEFT) return;

			
			NativeTween.LocalScale(
				this.gameObject
				.GetComponent<RectTransform>()!,
					dir === PointerDirection.DOWN ? new Vector3(0.8, 0.8, 0.8) : new Vector3(1, 1, 1),
					0.1,
				);
		});
	}

	public PlayClickEffect(): void {
		
		NativeTween.LocalScale(
			this.gameObject.GetComponent<RectTransform>()!,
			new Vector3(0.8, 0.8, 0.8), 0.1)
			.SetPingPong();
	}

	override OnDestroy(): void {}
}
