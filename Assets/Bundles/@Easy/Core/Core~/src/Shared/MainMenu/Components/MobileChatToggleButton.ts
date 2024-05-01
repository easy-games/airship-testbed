import { Dependency } from "../../Flamework";
import { Bin } from "../../Util/Bin";
import { CanvasAPI } from "../../Util/CanvasAPI";
import { ClientChatSingleton } from "../Singletons/Chat/ClientChatSingleton";

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
		const clientChat = Dependency<ClientChatSingleton>();
		this.SetActiveVisuals(clientChat.IsOpenMobile());

		this.bin.AddEngineEventConnection(
			CanvasAPI.OnClickEvent(this.button.gameObject, () => {
				let newVal = !this.active;
				this.SetActiveVisuals(newVal);
				newVal ? clientChat.OpenMobile() : clientChat.HideMobile();
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
