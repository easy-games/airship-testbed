import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { CanvasAPI } from "@Easy/Core/Shared/Util/CanvasAPI";
import { ColorUtil } from "@Easy/Core/Shared/Util/ColorUtil";

export default class MicDevice extends AirshipBehaviour {
	public bgImage!: Image;
	public text!: TMP_Text;

	private micIndex = -1;
	private bin = new Bin();
	private selectCallback?: () => void;

	public Init(micIndex: number, deviceName: string, selectCallback: () => void): void {
		this.micIndex = micIndex;
		this.text.text = deviceName;
		this.selectCallback = selectCallback;
	}

	public SetSelected(selected: boolean): void {
		this.bgImage.color = selected ? ColorUtil.HexToColor("#2577D1") : new Color(1, 1, 1, 0.02);
	}

	override OnEnable(): void {
		this.bin.AddEngineEventConnection(
			CanvasAPI.OnClickEvent(this.gameObject, () => {
				task.spawn(() => {
					if (this.selectCallback !== undefined) {
						this.selectCallback();
					}
				});
			}),
		);
	}

	override OnDisable(): void {
		this.bin.Clean();
	}
}
