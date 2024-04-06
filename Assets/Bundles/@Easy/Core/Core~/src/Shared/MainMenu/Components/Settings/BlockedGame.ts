import { MainMenuBlockSingleton } from "@Easy/Core/Client/MainMenuControllers/Settings/MainMenuBlockSingleton";
import { Dependency } from "@Easy/Core/Shared/Flamework";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { CanvasAPI } from "@Easy/Core/Shared/Util/CanvasAPI";

export default class BlockedGame extends AirshipBehaviour {
	public gameName!: TMP_Text;
	public unblockButton!: Button;

	private gameId = "";

	private bin = new Bin();

	public Init(gameId: string, gameName: string): void {
		this.gameId = gameId;
		this.gameName.text = gameName;
	}

	override OnEnable(): void {
		this.bin.AddEngineEventConnection(
			CanvasAPI.OnClickEvent(this.unblockButton.gameObject, () => {
				task.spawn(() => {
					Dependency<MainMenuBlockSingleton>().UnblockGameAsync(this.gameId);
					this.gameObject.SetActive(false);
				});
			}),
		);
	}

	override OnDisable(): void {
		this.bin.Clean();
	}
}
