import { Dependency } from "../../Flamework";
import { Bin } from "../../Util/Bin";
import { MainMenuSingleton } from "../Singletons/MainMenuSingleton";

export default class Searchbar extends AirshipBehaviour {
	@Header("References")
	public urlText!: TMP_Text;
	public copyButton!: GameObject;
	public divider!: GameObject;
	public layoutElement!: LayoutElement;

	private bin = new Bin();

	public OnEnable(): void {
		const mainMenu = Dependency<MainMenuSingleton>();
		this.bin.Add(
			mainMenu.ObserveScreenSize((sizeType, size) => {
				if (sizeType === "sm") {
					this.urlText.gameObject.SetActive(false);
					this.copyButton.SetActive(false);
					this.divider.SetActive(false);
					this.layoutElement.preferredWidth = 200;
				} else {
					this.urlText.gameObject.SetActive(true);
					this.copyButton.SetActive(true);
					this.divider.SetActive(true);
					this.layoutElement.preferredWidth = 392;
				}
			}),
		);
	}

	public OnDisable(): void {
		this.bin.Clean();
	}
}
