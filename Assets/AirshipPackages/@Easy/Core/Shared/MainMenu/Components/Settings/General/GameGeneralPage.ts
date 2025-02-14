import { Dependency } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { Keyboard } from "@Easy/Core/Shared/UserInput";
import { AirshipUrl } from "@Easy/Core/Shared/Util/AirshipUrl";
import { AppManager } from "@Easy/Core/Shared/Util/AppManager";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { MainMenuSingleton } from "../../../Singletons/MainMenuSingleton";
import { SettingsPageSingleton } from "../../../Singletons/SettingsPageSingleton";
import MainMenuPageComponent from "../../MainMenuPageComponent";
import { SettingsTab } from "../SettingsPageName";
import EscapeMenuButton from "./EscapeMenuButton";

export default class GameGeneralPage extends MainMenuPageComponent {
	public settingsBtn: Button;
	public keybindsBtn: Button;
	public buttonsContainer: RectTransform;
	public playerListBtn: Button;
	public playerListBackBtn: Button;
	public disconnectBtn: EscapeMenuButton;
	public resumeBtn: Button;

	public leaveMatchBtn: EscapeMenuButton;
	public leaveMatchSpacer: GameObject;

	public generalPage: GameObject;
	public playerListPage: GameObject;

	@Header("Game")
	public gameTitle: TMP_Text;
	public gameDesc: TMP_Text;
	public gameImg: RawImage;

	private bin = new Bin();
	private subPageBin = new Bin();

	public OnEnable(): void {
		this.generalPage.SetActive(true);
		this.playerListPage.SetActive(false);

		const mainMenu = Dependency<MainMenuSingleton>();
		if (mainMenu.leaveMatchButtonData) {
			this.leaveMatchBtn.text.text = mainMenu.leaveMatchButtonData.text;
			this.leaveMatchBtn.gameObject.SetActive(true);
			this.leaveMatchSpacer.gameObject.SetActive(true);
			this.disconnectBtn.text.text = "Quit to Main Menu";
		}
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
		this.bin.Add(
			this.settingsBtn.onClick.Connect(() => {
				Dependency<SettingsPageSingleton>().Open(SettingsTab.Game);
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
			this.disconnectBtn.button.onClick.Connect(() => {
				task.spawn(() => {
					TransferManager.Instance.Disconnect();
				});
			}),
		);
		this.bin.Add(
			this.leaveMatchBtn.button.onClick.Connect(() => {
				task.spawn(() => {
					AppManager.Close();
					contextbridge.broadcast("Menu:LeaveMatchBtnPressed");
				});
			}),
		);
		this.bin.Add(
			this.resumeBtn.onClick.Connect(() => {
				AppManager.Close();
			}),
		);

		task.spawn(() => {
			if (!Game.gameData) {
				Game.onGameDataLoaded.Wait();
			}
			this.gameTitle.text = Game.gameData!.name;
			this.gameDesc.text = Game.gameData!.description;

			let thumbUrl = AirshipUrl.CDN + "/images/" + Game.gameData!.iconImageId + ".png";
			const tex = Bridge.DownloadTexture2DYielding(thumbUrl);
			this.gameImg.texture = tex;
			NativeTween.GraphicAlpha(this.gameImg, 1, 0.12).SetEaseQuadOut();
		});
	}

	override OnDestroy(): void {
		this.bin.Clean();
	}
}
