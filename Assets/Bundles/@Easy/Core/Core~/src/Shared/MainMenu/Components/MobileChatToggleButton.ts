import { ChatController } from "@Easy/Core/Client/Controllers/Chat/ChatController";
import { Dependency } from "../../Flamework";
import { Bin } from "../../Util/Bin";
import { CanvasAPI } from "../../Util/CanvasAPI";

export default class MobileChatToggleButton extends AirshipBehaviour {
	@Header("Variables")
	public activeColor!: Color;
	public disabledColor!: Color;

	@Header("References")
	public bgImage!: Image;
	public button!: Button;

	private active = false;
	private bin = new Bin();

	public OnEnable(): void {
		this.SetActiveVisuals(Dependency<ChatController>().IsOpenMobile());

		this.bin.AddEngineEventConnection(
			CanvasAPI.OnClickEvent(this.button.gameObject, () => {
				let newVal = !this.active;
				this.SetActiveVisuals(newVal);
				if (newVal) {
					Dependency<ChatController>().OpenMobile();
				} else {
					Dependency<ChatController>().HideMobile();
				}
			}),
		);
	}

	public OnDisable(): void {
		this.bin.Clean();
	}

	private SetActiveVisuals(val: boolean): void {
		this.active = val;
		if (val) {
			this.bgImage.color = this.activeColor;
		} else {
			this.bgImage.color = this.disabledColor;
		}
	}
}
