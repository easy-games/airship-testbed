import { Dependency } from "../../Flamework";
import { Game } from "../../Game";
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
	public notifWrapper: GameObject;
	public notifText: TMP_Text;

	private active = false;
	private bin = new Bin();
	private notifCount = 0;

	public OnEnable(): void {
		const clientChat = Dependency<ClientChatSingleton>();
		this.SetActiveVisuals(clientChat.IsOpenMobile());

		this.notifWrapper.SetActive(false);

		this.bin.AddEngineEventConnection(
			CanvasAPI.OnClickEvent(this.button.gameObject, () => {
				let newVal = !this.active;
				this.SetActiveVisuals(newVal);
				newVal ? clientChat.OpenMobile() : clientChat.HideMobile();
			}),
		);

		if (Game.IsMobile()) {
			this.bin.Add(
				contextbridge.subscribe("Chat:ProcessLocalMessage", (context, msg) => {
					if (this.active) return;

					this.notifCount++;
					this.notifWrapper.SetActive(true);
					this.notifText.text = this.notifCount + "";
				}),
			);
		}
	}

	public OnDisable(): void {
		this.bin.Clean();
	}

	private SetActiveVisuals(val: boolean): void {
		this.active = val;
		if (val) {
			this.bgImage.color = this.activeColor;
			this.notifWrapper.SetActive(false);
			this.notifCount = 0;
		} else {
			this.bgImage.color = this.disabledColor;
		}
	}
}
