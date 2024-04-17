import { MainMenuBlockSingleton } from "@Easy/Core/Client/MainMenuControllers/Settings/MainMenuBlockSingleton";
import { Dependency } from "@Easy/Core/Shared/Flamework";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { CanvasAPI } from "@Easy/Core/Shared/Util/CanvasAPI";

export default class BlockedUser extends AirshipBehaviour {
	public username!: TMP_Text;
	public unblockButton!: Button;

	private uid = "";

	private bin = new Bin();

	public Init(uid: string, username: string): void {
		this.uid = uid;
		this.username.text = username;
	}

	override OnEnable(): void {
		this.bin.AddEngineEventConnection(
			CanvasAPI.OnClickEvent(this.unblockButton.gameObject, () => {
				task.spawn(() => {
					Dependency<MainMenuBlockSingleton>().UnblockUserAsync(this.uid);
					this.gameObject.SetActive(false);
				});
			}),
		);
	}

	override OnDisable(): void {
		this.bin.Clean();
	}
}
