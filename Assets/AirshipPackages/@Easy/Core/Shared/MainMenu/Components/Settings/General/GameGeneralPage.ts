import { Game } from "@Easy/Core/Shared/Game";
import { AirshipUrl } from "@Easy/Core/Shared/Util/AirshipUrl";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import MainMenuPageComponent from "../../MainMenuPageComponent";

export default class GameGeneralPage extends MainMenuPageComponent {
	public gameTitle!: TMP_Text;
	public gameDeveloper!: TMP_Text;
	public gameDescription!: TMP_Text;
	public gameImage!: Image;
	private bin = new Bin();

	public OnEnable(): void {}

	override GetTargetAnchoredPositionY(): number {
		if (Game.deviceType === AirshipDeviceType.Phone) {
			return -10;
		} else {
			return -95;
		}
	}

	override Start(): void {
		task.spawn(() => {
			Game.WaitForGameData();
			const gameData = Game.gameData;
			if (!gameData) return;

			this.gameTitle.text = gameData.name;
			this.gameDeveloper.text = gameData.organization.name;
			this.gameDescription.text = gameData.description;
			Bridge.UpdateLayout(this.gameDescription.transform.parent!, false);

			let gameImageUrl = AirshipUrl.CDN + "/images/" + gameData.iconImageId;
			const cloudImage = this.gameImage.GetComponent<CloudImage>()!;
			cloudImage.url = gameImageUrl;
			this.bin.AddEngineEventConnection(
				cloudImage.OnFinishedLoading((success) => {
					if (success) {
						this.gameImage.color = new Color(1, 1, 1, 1);
					}
				}),
			);
			cloudImage.hideErrors = true;
			cloudImage.StartDownload();
		});
	}

	override OnDestroy(): void {
		this.bin.Clean();
	}
}
