import { Bin } from "@Easy/Core/Shared/Util/Bin";
import AvatarCustomizationOption_Color from "./AvatarCustomizationOption_Color";

export default class AvatarCustomizationPanel extends AirshipBehaviour {
	@Header("Templates")
	public colorOptionTemplate: GameObject;

	@Header("References")
	public builder: AccessoryBuilder;
	public colorOptions: AvatarCustomizationOption_Color;

	private accId: number = 0;
	private openBin = new Bin();

	protected OnEnable(): void {
		this.Open(0);
	}

	public Open(accId: number) {
		this.openBin.Clean();
		this.accId = accId;
		this.InitColorOptions(this.colorOptions);
	}

	protected OnDisable(): void {
		this.openBin.Clean();
	}

	private InitColorOptions(options: AvatarCustomizationOption_Color) {
		options.Init("000000", 1);
		this.openBin.Add(
			options.onSelectColor.Connect((colorStr) => {
				//make accessory the color
				print("Heard new color: " + colorStr);
			}),
		);
	}

	public Close() {
		this.openBin.Clean();
	}
}
