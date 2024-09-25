import { Bin } from "@Easy/Core/Shared/Util/Bin";

export default class ChatWindow extends AirshipBehaviour {
	public canvasScaler: CanvasScaler;
	public scrollViewImg: Image;

	private bin = new Bin();

	override OnEnable(): void {}

	override OnDisable(): void {
		this.bin.Clean();
	}

	public FocusDesktop(): void {
		this.scrollViewImg.raycastTarget = true;
	}

	public UnfocusDesktop(): void {
		this.scrollViewImg.raycastTarget = false;
	}
}
