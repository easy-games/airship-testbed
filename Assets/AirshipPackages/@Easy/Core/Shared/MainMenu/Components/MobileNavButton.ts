import { MainMenuController } from "@Easy/Core/Client/ProtectedControllers/MainMenuController";
import { MainMenuPageType } from "@Easy/Core/Client/ProtectedControllers/MainMenuPageName";
import { Dependency } from "../../Flamework";
import { Game } from "../../Game";
import { Bin } from "../../Util/Bin";
import { CanvasAPI } from "../../Util/CanvasAPI";
import { ColorUtil } from "../../Util/ColorUtil";

export default class MobileNavButton extends AirshipBehaviour {
	public iconImage: Image;
	public selectedSprite: Sprite;
	public unselectedSprite: Sprite;
	public text: TMP_Text;
	public button: Button;
	public page: MainMenuPageType;

	private bin = new Bin();
	private selected = false;
	private deselectedColor = ColorUtil.HexToColor("898D90");

	public Start(): void {
		this.iconImage.color = this.deselectedColor;
		this.text.color = this.deselectedColor;
	}

	public OnEnable(): void {
		if (!(Game.IsMobile() && Game.IsPortrait())) return;
		task.unscaledDelay(0, () => {
			const mainMenuController = Dependency<MainMenuController>();
			if (mainMenuController.currentPage?.pageType === this.page) {
				this.SetSelected(true);
			} else {
				this.SetSelected(false);
			}
			mainMenuController.onPageChange.Connect((event) => {
				this.SetSelected(event.newPage === this.page);
			});
		});

		this.bin.AddEngineEventConnection(
			CanvasAPI.OnClickEvent(this.button.gameObject, () => {
				this.SetSelected(true);
				Dependency<MainMenuController>().RouteToPage(this.page);
			}),
		);
	}

	public SetSelected(selected: boolean) {
		this.selected = selected;

		if (selected) {
			this.iconImage.sprite = this.selectedSprite;
			this.iconImage.color = Color.white;
			this.text.color = Color.white;
		} else {
			this.iconImage.sprite = this.unselectedSprite;
			this.iconImage.color = this.deselectedColor;
			this.text.color = this.deselectedColor;
		}
	}

	public OnDisable(): void {
		this.bin.Clean();
	}
}
