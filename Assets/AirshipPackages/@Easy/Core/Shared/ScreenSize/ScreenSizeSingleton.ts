import { OnStart, Singleton } from "@Easy/Core/Shared/Flamework";
import { AssetCache } from "../AssetCache/AssetCache";
import { CoreRefs } from "../CoreRefs";
import { Game } from "../Game";
import { ScreenSizeType } from "../MainMenu/Singletons/ScreenSizeType";
import { Bin } from "../Util/Bin";
import { Signal } from "../Util/Signal";
import { OnUpdate } from "../Util/Timer";

@Singleton({})
export class ScreenSizeSingleton implements OnStart {
	public sizeType: ScreenSizeType = "md";
	public onSizeChanged = new Signal<[sizeType: ScreenSizeType, size: Vector2]>();

	public screenSize!: Vector2;
	private firstRun = true;

	constructor() {
		this.screenSize = new Vector2(Screen.width, Screen.height);
	}

	OnStart(): void {
		const readOnlyCanvasGO = Object.Instantiate(
			AssetCache.LoadAsset("AirshipPackages/@Easy/Core/Prefabs/UI/AirshipReadOnlyCanvas.prefab"),
			CoreRefs.rootTransform,
		);
		const canvasRect = readOnlyCanvasGO.transform as RectTransform;
		const canvasScaler = readOnlyCanvasGO.gameObject.GetComponent<CanvasScaler>()!;

		let lastTime = 0;
		OnUpdate.Connect((dt) => {
			if (canvasRect.sizeDelta !== this.screenSize || this.firstRun) {
				this.firstRun = false;
				lastTime = Time.time;
				this.screenSize = canvasRect.sizeDelta;

				const scaleFactor = Game.GetScaleFactor();
				canvasScaler.scaleFactor = scaleFactor;

				let sizeType: ScreenSizeType = "md";
				if (Game.IsPortrait()) {
					if (this.screenSize.x < 500) {
						sizeType = "sm";
					}
				} else {
					if (this.screenSize.x <= 1200) {
						sizeType = "sm";
					} else if (this.screenSize.x >= 1560) {
						sizeType = "lg";
					}
				}
				this.sizeType = sizeType;
				this.onSizeChanged.Fire(this.sizeType, this.screenSize);
			}
		});
	}

	public ObserveScreenSize(observer: (sizeType: ScreenSizeType, size: Vector2) => (() => void) | void): Bin {
		const bin = new Bin();
		let cleanup = observer(this.sizeType, this.screenSize);

		bin.Add(
			this.onSizeChanged.Connect((newSize) => {
				cleanup?.();
				cleanup = observer(newSize, this.screenSize);
			}),
		);

		return bin;
	}
}
