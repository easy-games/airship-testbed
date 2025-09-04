import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { Theme } from "@Easy/Core/Shared/Util/Theme";

export default class SettingsButton extends AirshipBehaviour {
	public text: TMP_Text;
	public bgImage: Image;
	public button: Button;
	private bin = new Bin();

	override Start(): void {}

	public Init(text: string, onSelected: () => void): void {
		this.text.text = text;
		this.bin.Add(
			this.button.onClick.Connect(() => {
				onSelected();
			}),
		);
	}

	public SetSelected(val: boolean): void {
		this.bgImage.color = val ? Theme.primary : new Color(1, 1, 1, 0.1215686);
	}

	override OnDestroy(): void {
		this.bin.Clean();
	}
}
