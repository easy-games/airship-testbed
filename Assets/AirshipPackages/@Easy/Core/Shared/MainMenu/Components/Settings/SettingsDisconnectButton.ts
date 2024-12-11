import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { CanvasAPI, HoverState } from "@Easy/Core/Shared/Util/CanvasAPI";
import { ColorUtil } from "@Easy/Core/Shared/Util/ColorUtil";

export default class SettingsDisconnectButton extends AirshipBehaviour {
	public bgImage!: Image;
	public text!: TMP_Text;
	public icon!: Image;

	private bin = new Bin();

	public OnEnable(): void {
		const primaryColor = this.bgImage.color;
		this.bin.AddEngineEventConnection(
			CanvasAPI.OnHoverEvent(this.gameObject, (hoverState) => {
				if (hoverState === HoverState.ENTER) {
					this.bgImage.color = ColorUtil.HexToColor("#D46161");
					// this.text.color = primaryColor;
					// this.icon.color = primaryColor;
				} else {
					this.bgImage.color = primaryColor;
					// this.text.color = new Color(1, 1, 1, 1);
					// this.icon.color = new Color(1, 1, 1, 1);
				}
			}),
		);
		const btn = this.gameObject.GetComponent<Button>()!;
		this.bin.Add(
			btn.onClick.Connect(async () => {
				task.spawn(() => {
					TransferManager.Instance.Disconnect();
				});
			}),
		);
	}

	public OnDisable(): void {
		this.bin.Clean();
	}
}
