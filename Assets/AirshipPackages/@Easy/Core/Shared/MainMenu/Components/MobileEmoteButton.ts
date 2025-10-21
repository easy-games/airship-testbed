import { Dependency } from "../../Flamework";
import { Bin } from "../../Util/Bin";
import { CanvasAPI } from "../../Util/CanvasAPI";
import { ClientChatSingleton } from "../Singletons/Chat/ClientChatSingleton";
import MobileChatToggleButton from "./MobileChatToggleButton";

export default class MobileEmoteButton extends AirshipBehaviour {
	private bin = new Bin();
	public chatToggleButton: MobileChatToggleButton;

	override Start(): void {
		this.SetupClickListener();
	}

	override OnEnable(): void {
		this.SetupClickListener();
	}

	override OnDisable(): void {
		this.bin.Clean();
		contextbridge.invoke("Emotes:HideEmoteWheel", LuauContext.Game);
	}

	private SetupClickListener(): void {
		this.bin.Clean();
		this.bin.AddEngineEventConnection(
			CanvasAPI.OnClickEvent(this.gameObject, () => {
				this.chatToggleButton.HideMobileChat();
				contextbridge.invoke("Emotes:ToggleEmoteWheel", LuauContext.Game);
			}),
		);
	}
}
