import { CanvasAPI, HoverState } from "Shared/Util/CanvasAPI";

export default class MainMenuNavButton extends AirshipBehaviour {
	public selected = false;
	public image!: Image;
	public trueShadow!: TrueShadow;
	// public selectedColor!: Color;
	// public unselectedColor!: Color;

	public Awake(): void {
		this.image = this.gameObject.GetComponent<Image>();
		this.selected = false;
	}

	override Start(): void {
		CanvasAPI.OnHoverEvent(this.gameObject, (state) => {
			// if (this.selected) return;
			if (state === HoverState.ENTER) {
				this.image.TweenGraphicAlpha(0.6, 0.12);
			} else {
				this.image.TweenGraphicAlpha(this.selected ? 0.7 : 0.9, 0.12);
			}
		});
	}

	override OnDestroy(): void {}

	public SetSelected(val: boolean): void {
		this.selected = val;

		this.image.color = val ? new Color(1, 1, 1, 0.1) : new Color(0.09, 0.08, 0.08, 0.94);
		// this.image.color = val ? this.selectedColor : this.unselectedColor;
		// this.image.TweenGraphicColor(val ? new Color(1, 1, 1, 0.05) : ColorUtil.HexToColor("18191A"), 0.12);
		this.trueShadow.enabled = !val;
	}
}
