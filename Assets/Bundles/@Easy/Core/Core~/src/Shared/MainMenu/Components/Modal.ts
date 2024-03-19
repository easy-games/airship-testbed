import { Dependency } from "../../Flamework";
import { Bin } from "../../Util/Bin";
import { MainMenuSingleton } from "../Singletons/MainMenuSingleton";

export default class Modal extends AirshipBehaviour {
	private rect!: RectTransform;
	private bin = new Bin();

	private startingOffsetMin!: Vector2;
	private startingOffsetMax!: Vector2;
	private startingAnchorMin!: Vector2;
	private startingAnchorMax!: Vector2;

	public Awake(): void {
		this.rect = this.gameObject.GetComponent<RectTransform>();
		this.startingOffsetMin = this.rect.offsetMin;
		this.startingOffsetMax = this.rect.offsetMax;
		this.startingAnchorMin = this.rect.anchorMin;
		this.startingAnchorMax = this.rect.anchorMax;
	}

	override OnEnable(): void {
		const mainMenu = Dependency<MainMenuSingleton>();
		this.bin.Add(
			mainMenu.ObserveScreenSize((size) => {
				if (size === "sm") {
					this.rect.anchorMin = new Vector2(0, 0);
					this.rect.anchorMax = new Vector2(1, 1);
					this.rect.offsetMin = new Vector2(10, 100);
					this.rect.offsetMax = new Vector2(-10, -50);
				} else {
					this.rect.offsetMin = this.startingOffsetMin;
					this.rect.offsetMax = this.startingOffsetMax;
					this.rect.anchorMin = this.startingAnchorMin;
					this.rect.anchorMax = this.startingAnchorMax;
				}
			}),
		);
	}

	override OnDisable(): void {}
}
