import { Dependency } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { AirshipUrl } from "@Easy/Core/Shared/Util/AirshipUrl";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { MainMenuSingleton } from "../../../Singletons/MainMenuSingleton";
import MainMenuPageComponent from "../../MainMenuPageComponent";

export default class GameGeneralPage extends MainMenuPageComponent {
	public gameTitle!: TMP_Text;
	public gameDeveloper!: TMP_Text;
	public gameDescription!: TMP_Text;
	public gameImage!: Image;

	public general: RectTransform;
	public playerList: RectTransform;
	public gameDesc: RectTransform;
	public gameHeader: RectTransform;

	private bin = new Bin();

	public OnEnable(): void {
		this.bin.Add(
			Dependency<MainMenuSingleton>().ObserveScreenSize((st, size) => {
				if (st === "sm") {
					this.general.offsetMax = new Vector2(-10, 0);

					this.playerList.anchorMin = new Vector2(0, 0);
					this.playerList.anchorMax = new Vector2(0.5, 1);
					this.playerList.offsetMin = new Vector2(0, 20);

					this.gameHeader.gameObject.SetActive(false);
					this.gameDesc.gameObject.SetActive(false);
				}
			}),
		);
	}

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
			this.bin.Add(
				cloudImage.OnFinishedLoading.Connect((success) => {
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
