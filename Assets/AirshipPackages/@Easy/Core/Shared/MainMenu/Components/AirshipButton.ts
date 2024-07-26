import { Bin } from "../../Util/Bin";
import { CanvasAPI, PointerButton, PointerDirection } from "../../Util/CanvasAPI";
import { ColorUtil } from "../../Util/ColorUtil";
import { AirshipButtonClickEffect } from "./AirshipButtonClickEffect";

export default class AirshipButton extends AirshipBehaviour {
	private bin = new Bin();

	private disabled = false;
	private image: Image | undefined;
	private button!: Button;
	private startingColor: Color | undefined;
	private loading = false;

	private startingScale!: Vector3;
	private startPos!: Vector2;

	@Header("Variables")
	public clickEffect = AirshipButtonClickEffect.Squish;
	@Tooltip("Sets child text to underline on mouse hover.")
	public underlineOnHover = false;

	@Header("Optional Variables")
	public disabledColorHex = "#2E3035";
	public loadingIndicator?: GameObject;

	public Awake(): void {
		this.image = this.gameObject.GetComponent<Image>();
		this.startingColor = this.image?.color;
		this.button = this.gameObject.GetComponent<Button>()!;
	}

	override Start(): void {
		const rect = this.gameObject.GetComponent<RectTransform>()!;
		this.startPos = rect.anchoredPosition;
		this.startingScale = rect.localScale;
		this.bin.AddEngineEventConnection(
			CanvasAPI.OnPointerEvent(this.gameObject, (dir, button) => {
				if (button !== PointerButton.LEFT) return;
				if (this.disabled) return;

				dir === PointerDirection.DOWN ? this.PlayMouseDownEffect() : this.PlayMouseUpEffect();
			}),
		);

		// if (this.underlineOnHover) {
		// 	const text = this.gameObject.GetComponentInChildren<TMP_Text>();
		// 	if (text) {
		// 		this.bin.AddEngineEventConnection(
		// 			CanvasAPI.OnHoverEvent(this.gameObject, (hov) => {
		// 				text.fontStyle = hov === HoverState.ENTER ? FontStyles.Underline : FontStyles.Normal;
		// 			}),
		// 		);
		// 	}
		// }
	}

	public SetLoading(loading: boolean) {
		this.loading = loading;
		if (this.loadingIndicator) {
			this.loadingIndicator.SetActive(loading);
		}
	}

	public SetDisabled(disabled: boolean) {
		this.disabled = disabled;
		if (this.image && this.startingColor) {
			if (disabled) {
				this.image.color = ColorUtil.HexToColor(this.disabledColorHex);
			} else {
				this.image.color = this.startingColor;
			}
		}
		this.button.enabled = !disabled;
	}

	public PlayMouseUpEffect(): void {
		const rect = this.gameObject.GetComponent<RectTransform>()!;
		if (this.clickEffect === AirshipButtonClickEffect.Squish) {
			NativeTween.LocalScale(rect, this.startingScale, 0.1).SetUseUnscaledTime(true);
		} else if (this.clickEffect === AirshipButtonClickEffect.ShiftDown) {
			NativeTween.AnchoredPosition(rect, this.startPos, 0.05).SetUseUnscaledTime(true);
		}
	}

	public PlayMouseDownEffect(): void {
		if (this.clickEffect === AirshipButtonClickEffect.Squish) {
			NativeTween.LocalScale(
				this.gameObject.GetComponent<RectTransform>()!,
				this.startingScale.mul(0.9),
				0.1,
			).SetUseUnscaledTime(true);
		} else if (this.clickEffect === AirshipButtonClickEffect.ShiftDown) {
			NativeTween.AnchoredPosition(
				this.gameObject.GetComponent<RectTransform>()!,
				this.startPos.add(new Vector2(0, -2)),
				0.05,
			).SetUseUnscaledTime(true);
		}
	}

	public PlayClickEffect(): void {
		if (this.clickEffect === AirshipButtonClickEffect.Squish) {
			NativeTween.LocalScale(
				this.gameObject.GetComponent<RectTransform>()!,
				this.gameObject.GetComponent<RectTransform>()!.localScale.mul(0.9),
				0.1,
			)
				.SetPingPong()
				.SetUseUnscaledTime(true);
		}
	}

	override OnDestroy(): void {
		this.bin.Clean();
	}
}
