import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { CanvasAPI, HoverState } from "@Easy/Core/Shared/Util/CanvasAPI";
import { Theme } from "@Easy/Core/Shared/Util/Theme";

export default class AvatarMenuBtn extends AirshipBehaviour {
	private readonly highlightColor = Theme.primary;
	private readonly normalColor = Theme.uiDark;

	public iconImage?: Image;
	public button!: Button;
	public labelText!: TextMeshProUGUI;
	public bgImage?: Image;

	private bin = new Bin();
	private selected = false;

	override Start(): void {}

	public OnEnable(): void {
		this.bin.AddEngineEventConnection(CanvasAPI.OnClickEvent(this.gameObject, () => {}));

		if (this.bgImage) {
			this.bin.AddEngineEventConnection(
				CanvasAPI.OnHoverEvent(this.gameObject, (hoverState) => {
					if (this.selected || !this.bgImage) return;
					if (hoverState === HoverState.ENTER) {
						this.bgImage.color = new Color(1, 1, 1, 0.02);
					} else {
						this.bgImage.color = new Color(1, 1, 1, 0);
					}
				}),
			);
		}
	}

	public Init(label: string, color: Color) {
		this.SetText(label);
		this.SetButtonColor(color);
	}

	public SetText(label: string) {
		this.labelText.enabled = true;
		this.labelText.text = label;
	}

	public SetButtonColor(newColor: Color) {
		//print("setting " + this.gameObject.name + " to: " + newColor);
		this.button.image.color = newColor;

		// let colors = this.button.colors;
		// colors.normalColor = active ? this.highlightColor : this.normalColor;
		// this.button.colors = colors;
		// this.button.image.color = colors.normalColor;
	}

	public SetIconColor(newColor: Color) {
		if (!this.iconImage) return;
		this.iconImage.color = newColor;
	}

	public SetSelected(val: boolean) {
		this.selected = val;
		if (val) {
			if (this.bgImage) {
				this.bgImage.color = Theme.primary;
			}
			this.labelText.color = new Color(1, 1, 1, 1);
			if (this.iconImage) {
				this.iconImage.color = new Color(1, 1, 1, 1);
			}
		} else {
			if (this.bgImage) {
				this.bgImage.color = new Color(0, 0, 0, 0);
			}
			this.labelText.color = new Color(1, 1, 1, 0.8);
			if (this.iconImage) {
				this.iconImage.color = new Color(1, 1, 1, 0.8);
			}
		}
	}

	public SetEnabled(enabled: boolean) {
		this.button.interactable = enabled;
	}
}
