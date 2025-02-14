import { Game } from "../../Game";
import { Bin } from "../../Util/Bin";

export default class MainMenuQuitButton extends AirshipBehaviour {
	public button: Button;
	public visuals: GameObject;

	private bin = new Bin();
	private shown = true;

	override Start(): void {
		this.bin.Add(
			this.button.onClick.Connect(() => {
				Application.Quit();
			}),
		);

		if (Game.IsMobile()) {
			this.visuals.SetActive(false);
			this.shown = false;
		}
	}

	protected Update(dt: number): void {
		if (Game.IsMobile()) return;
		if (Screen.fullScreen) {
			if (!this.shown) {
				this.visuals.SetActive(true);
				this.shown = false;
			}
		} else {
			if (this.shown) {
				this.visuals.SetActive(false);
				this.shown = false;
			}
		}
	}

	override OnDestroy(): void {
		this.bin.Clean();
	}
}
