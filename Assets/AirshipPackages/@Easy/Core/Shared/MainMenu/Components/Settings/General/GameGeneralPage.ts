import { Dependency } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { Keyboard } from "@Easy/Core/Shared/UserInput";
import { AirshipUrl } from "@Easy/Core/Shared/Util/AirshipUrl";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { SettingsPageSingleton } from "../../../Singletons/SettingsPageSingleton";
import MainMenuPageComponent from "../../MainMenuPageComponent";
import { SettingsTab } from "../SettingsPageName";

export default class GameGeneralPage extends MainMenuPageComponent {
	public settingsBtn: Button;
	public keybindsBtn: Button;
	public buttonsContainer: RectTransform;
	public playerListBtn: Button;
	public playerListBackBtn: Button;
	public disconnectBtn: Button;

	public generalPage: GameObject;
	public playerListPage: GameObject;

	@Header("Game")
	public gameTitle: TMP_Text;
	public gameDesc: TMP_Text;
	public gameImg: RawImage;

	private bin = new Bin();
	private subPageBin = new Bin();

	public OnEnable(): void {
		this.bin.Add(
			this.settingsBtn.onClick.Connect(() => {
				Dependency<SettingsPageSingleton>().Open(SettingsTab.Input);
			}),
		);
		this.bin.Add(
			this.keybindsBtn.onClick.Connect(() => {
				Dependency<SettingsPageSingleton>().Open(SettingsTab.Keybinds);
			}),
		);
		this.bin.Add(
			this.playerListBtn.onClick.Connect(() => {
				this.OpenPlayerListSubPage();
			}),
		);
		this.bin.Add(
			this.playerListBackBtn.onClick.Connect(() => {
				this.CloseSubPage();
			}),
		);
		this.bin.Add(
			this.disconnectBtn.onClick.Connect(() => {
				task.spawn(() => {
					TransferManager.Instance.Disconnect();
				});
			}),
		);
		this.generalPage.SetActive(true);
		this.playerListPage.SetActive(false);
	}

	public OpenPlayerListSubPage(): void {
		this.generalPage.SetActive(false);
		this.playerListPage.SetActive(true);
		this.playerListPage.transform.localScale = Vector3.one.mul(1.1);
		NativeTween.LocalScale(this.playerListPage.transform, Vector3.one, 0.12).SetEaseQuadOut();
		this.subPageBin.Add(
			Keyboard.OnKeyDown(Key.Escape, (e) => {
				e.SetCancelled(true);
				this.CloseSubPage();
			}),
		);
	}

	public CloseSubPage(): void {
		this.subPageBin.Clean();
		this.playerListPage.SetActive(false);
		this.generalPage.SetActive(true);
		this.generalPage.transform.localScale = Vector3.one.mul(1.1);
		NativeTween.LocalScale(this.generalPage.transform, Vector3.one, 0.12).SetEaseQuadOut();
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
			if (!Game.gameData) {
				Game.onGameDataLoaded.Wait();
			}
			this.gameTitle.text = Game.gameData!.name;
			this.gameDesc.text = Game.gameData!.description;

			let thumbUrl = AirshipUrl.CDN + "/images/" + Game.gameData!.iconImageId + ".png";
			print("url: " + thumbUrl);
			const tex = Bridge.DownloadTexture2DYielding(thumbUrl);
			this.gameImg.texture = tex;
			NativeTween.GraphicAlpha(this.gameImg, 1, 0.12).SetEaseQuadOut();
		});
	}

	override OnDestroy(): void {
		this.bin.Clean();
	}
}
