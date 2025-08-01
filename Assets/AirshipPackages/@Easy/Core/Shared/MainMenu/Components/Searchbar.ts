import { Dependency } from "../../Flamework";
import { Game } from "../../Game";
import { Bin } from "../../Util/Bin";
import { MainMenuSingleton } from "../Singletons/MainMenuSingleton";

export default class Searchbar extends AirshipBehaviour {
	@Header("References")
	public urlText!: TMP_Text;
	public layoutElement!: LayoutElement;

	private bin = new Bin();

	public OnEnable(): void {
		const mainMenu = Dependency<MainMenuSingleton>();
		this.bin.Add(
			mainMenu.ObserveScreenSize((sizeType, size) => {
				if (sizeType === "sm") {
					// this.urlText.gameObject.SetActive(false);
					if (Game.IsMobile()) {
						this.layoutElement.preferredWidth = Game.IsLandscape() ? 240 : 240;
						this.layoutElement.flexibleWidth = 0;
					} else {
						this.layoutElement.preferredWidth = 200;
					}
				} else {
					this.urlText.gameObject.SetActive(true);
					this.layoutElement.preferredWidth = 280;
				}
			}),
		);
	}

	public OnDisable(): void {
		this.bin.Clean();
	}
}
