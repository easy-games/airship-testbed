import { MainMenuController } from "@Easy/Core/Client/MainMenuControllers/MainMenuController";
import { MainMenuPageType } from "@Easy/Core/Client/MainMenuControllers/MainMenuPageName";
import { Dependency } from "../../Flamework";
import { Bin } from "../../Util/Bin";
import { CanvasAPI } from "../../Util/CanvasAPI";
import { ColorUtil } from "../../Util/ColorUtil";

export default class MobileNavButton extends AirshipBehaviour {
	public iconImage!: Image;
	public selectedSprite!: Sprite;
	public text!: TMP_Text;
	public button!: Button;
	public pageName!: string;

	private startingSprite!: Sprite;

	private bin = new Bin();
	private selected = false;
	private deselectedColor = ColorUtil.HexToColor("898D90");

	public Start(): void {
		this.startingSprite = this.iconImage.sprite;
		this.iconImage.color = this.deselectedColor;
		this.text.color = this.deselectedColor;
	}

	public OnEnable(): void {
		task.delay(0, () => {
			const mainMenuController = Dependency<MainMenuController>();
			if (mainMenuController.currentPage?.pageType === this.pageName) {
				this.SetSelected(true);
			} else {
				this.SetSelected(false);
			}
			mainMenuController.onCurrentPageChanged.Connect((page) => {
				this.SetSelected(page === this.pageName);
			});
		});

		this.bin.AddEngineEventConnection(
			CanvasAPI.OnClickEvent(this.button.gameObject, () => {
				print("clicked " + this.pageName);
				this.SetSelected(true);
				Dependency<MainMenuController>().RouteToPage(this.pageName as MainMenuPageType);
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
			this.iconImage.sprite = this.startingSprite;
			this.iconImage.color = this.deselectedColor;
			this.text.color = this.deselectedColor;
		}
	}

	public OnDisable(): void {
		this.bin.Clean();
	}
}
