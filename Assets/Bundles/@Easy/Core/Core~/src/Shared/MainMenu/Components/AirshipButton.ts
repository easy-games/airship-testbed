import { Bin } from "../../Util/Bin";
import { CanvasAPI, PointerButton, PointerDirection } from "../../Util/CanvasAPI";
import { ColorUtil } from "../../Util/ColorUtil";
import { AirshipButtonClickEffect } from "./AirshipButtonClickEffect";

export default class AirshipButton extends AirshipBehaviour {
	private bin = new Bin();

	private disabled = false;
	private image!: Image;
	private button!: Button;
	private startingColor!: Color;
	private loading = false;

	@Header("Variables")
	public clickEffect = AirshipButtonClickEffect.Squish;

	@Header("Optional Variables")
	public disabledColorHex = "#2E3035";
	public loadingIndicator?: GameObject;

	public Awake(): void {
		this.image = this.gameObject.GetComponent<Image>()!;
		this.startingColor = this.image.color;
		this.button = this.gameObject.GetComponent<Button>()!;
	}

	override Start(): void {
		const rect = this.gameObject.GetComponent<RectTransform>()!;
		const startPos = rect.anchoredPosition;
		let startingScale = rect.localScale;
		this.bin.AddEngineEventConnection(
			CanvasAPI.OnPointerEvent(this.gameObject, (dir, button) => {
				if (button !== PointerButton.LEFT) return;
				if (this.disabled) return;

				if (this.clickEffect === AirshipButtonClickEffect.Squish) {
					this.gameObject
						.GetComponent<RectTransform>()!
						.TweenLocalScale(dir === PointerDirection.DOWN ? startingScale.mul(0.9) : startingScale, 0.1);
				} else if (this.clickEffect === AirshipButtonClickEffect.ShiftDown) {
					this.gameObject
						.GetComponent<RectTransform>()!
						.TweenAnchoredPosition(
							dir === PointerDirection.DOWN ? startPos.add(new Vector2(0, -2)) : startPos,
							0.05,
						);
				}
			}),
		);
	}

	public SetLoading(loading: boolean) {
		this.loading = loading;
		if (this.loadingIndicator) {
			this.loadingIndicator.SetActive(loading);
		}
	}

	public SetDisabled(disabled: boolean) {
		this.disabled = disabled;
		if (disabled) {
			this.image.color = ColorUtil.HexToColor(this.disabledColorHex);
		} else {
			this.image.color = this.startingColor;
		}
		this.button.enabled = !disabled;
	}

	public PlayClickEffect(): void {
		if (this.clickEffect === AirshipButtonClickEffect.Squish) {
			this.gameObject
				.GetComponent<RectTransform>()!
				.TweenLocalScale(this.gameObject.GetComponent<RectTransform>()!.localScale.mul(0.9), 0.1)
				.SetPingPong();
		}
	}

	override OnDestroy(): void {
		this.bin.Clean();
	}
}
