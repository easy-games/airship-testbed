import { Bin } from "@Easy/Core/Shared/Util/Bin";

export default class SettingsCategory extends AirshipBehaviour {
	public titleText: TMP_Text;

	private bin = new Bin();

	public Init(title: string): void {
		this.titleText.text = title;
	}

	override OnDestroy(): void {
		this.bin.Clean();
	}
}