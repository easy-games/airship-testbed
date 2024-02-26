import { ColorUtil } from "@Easy/Core/Shared/Util/ColorUtil";
import { Theme } from "@Easy/Core/Shared/Util/Theme";

export default class AvatarMenuBtn extends AirshipBehaviour {
	private readonly highlightColor = Theme.primary;
	private readonly normalColor = Theme.uiDark;

	public iconImage!: Image;
	public button!: Button;
	public labelText!: TextMeshProUGUI;

	override Start(): void {}

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
		this.iconImage.color = newColor;
	}

	public SetHighlight(highlightOn: boolean) {
		this.SetButtonColor(highlightOn ? this.highlightColor : this.normalColor);
	}

	public SetEnabled(enabled: boolean) {
		this.button.interactable = enabled;
	}
}
