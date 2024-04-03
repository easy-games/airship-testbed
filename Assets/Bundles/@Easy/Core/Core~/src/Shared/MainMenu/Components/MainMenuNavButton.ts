import { CanvasAPI, HoverState } from "../../Util/CanvasAPI";
import { ColorUtil } from "../../Util/ColorUtil";

export default class MainMenuNavButton extends AirshipBehaviour {
	public selected = false;

	@NonSerialized()
	public image!: Image;
	// public trueShadow!: TrueShadow;
	public selectedColor!: Color;
	public unselectedColor!: Color;
	public text!: TMP_Text;
	public iconImage!: Image;

	private textColorActive = new Color(1, 1, 1, 1);
	private textColorNormal = ColorUtil.HexToColor("D8D8D8");

	public Awake(): void {
		this.image = this.gameObject.GetComponent<Image>();
		this.selected = false;
	}

	override Start(): void {
		CanvasAPI.OnHoverEvent(this.gameObject, (state) => {
			if (this.selected) return;
			if (state === HoverState.ENTER) {
				this.text.color = this.textColorActive;
				this.iconImage.color = this.textColorActive;
			} else {
				this.text.color = this.textColorNormal;
				this.iconImage.color = this.textColorNormal;
			}
		});
		// const rect = this.gameObject.GetComponent<RectTransform>();
		// let startPos: Vector3 | undefined;
		// CanvasAPI.OnPointerEvent(this.gameObject, (dir, button) => {
		// 	if (dir === PointerDirection.DOWN) {
		// 		if (this.selected) return;
		// 		startPos = rect.localPosition;
		// 		rect.TweenLocalPosition(startPos.sub(new Vector3(0, 2, 0)), 0.05);
		// 	} else if (startPos) {
		// 		rect.localPosition = startPos;
		// 		startPos = undefined;
		// 	}
		// });
	}

	override OnDestroy(): void {}

	public SetSelected(val: boolean): void {
		this.selected = val;

		this.image.color = this.image.color = val ? this.selectedColor : this.unselectedColor;
		this.text.color = val ? this.textColorActive : this.textColorNormal;
		this.iconImage.color = val ? this.textColorActive : this.textColorNormal;
		// this.image.color = val ? this.selectedColor : this.unselectedColor;
		// this.image.TweenGraphicColor(val ? new Color(1, 1, 1, 0.05) : ColorUtil.HexToColor("18191A"), 0.12);
		// this.trueShadow.enabled = !val;
	}
}
