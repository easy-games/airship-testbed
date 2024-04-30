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
		this.SetActiveVisuals(
			contextbridge.invoke<() => boolean>("ClientChatSingleton:IsOpenMobile", LuauContext.Protected),
		);

		this.bin.AddEngineEventConnection(
			CanvasAPI.OnClickEvent(this.button.gameObject, () => {
				let newVal = !this.active;
				this.SetActiveVisuals(newVal);
				contextbridge.invoke<(val: boolean) => void>(
					"ClientChatSingleton:SetOpenMobile",
					LuauContext.Protected,
					newVal,
				);
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
