import { Bin } from "@Easy/Core/Shared/Util/Bin";

export default class ChatMessage extends AirshipBehaviour {
	private bin = new Bin();
	public button: Button;
	public image: Image;

	override Start(): void { }

	public SetUrl(url: string): void {
		this.button.enabled = true;
		this.image.raycastTarget = true;
		this.bin.Add(
			this.button.onClick.Connect(() => {
				Application.OpenURL(url);
			}),
		);
	}

	public RemoveUrl(): void {
		this.button.enabled = false;
		this.image.raycastTarget = false;
		this.bin.Clean();
	}

	override OnDestroy(): void {
		this.bin.Clean();
	}
}
