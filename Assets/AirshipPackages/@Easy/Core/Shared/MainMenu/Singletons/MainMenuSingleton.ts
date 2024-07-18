import { MainMenuController } from "@Easy/Core/Client/ProtectedControllers/MainMenuController";
import { Dependency, Singleton } from "@Easy/Core/Shared/Flamework";
import { AssetCache } from "../../AssetCache/AssetCache";
import { Game } from "../../Game";
import { CoreLogger } from "../../Logger/CoreLogger";
import { AppManager } from "../../Util/AppManager";
import { Bin } from "../../Util/Bin";
import { Modifier } from "../../Util/Modifier";
import { Signal } from "../../Util/Signal";
import { OnUpdate } from "../../Util/Timer";
import ConfirmModal from "../Components/Modal/ConfirmModal";
import { ScreenSizeType } from "./ScreenSizeType";

@Singleton({})
export class MainMenuSingleton {
	public sizeType: ScreenSizeType = "md";
	public onSizeChanged = new Signal<[sizeType: ScreenSizeType, size: Vector2]>();

	public screenSize!: Vector2;
	public rawScreenSize!: Vector2;
	private firstRun = true;

	public navbarModifier = new Modifier<{ hidden: boolean }>();
	public socialMenuModifier = new Modifier<{ hidden: boolean }>();

	public readonly hideMobileEscapeButton = false;
	public onHideMobileEscapeButtonChanged = new Signal<boolean>();

	constructor() {
		this.screenSize = new Vector2(Screen.width, Screen.height);
		this.rawScreenSize = new Vector2(Screen.width, Screen.height);
	}

	public SetHideMobileEscapeButton(val: boolean) {
		(this.hideMobileEscapeButton as boolean) = val;
		this.onHideMobileEscapeButtonChanged.Fire(val);
	}

	protected OnStart(): void {
		// const readOnlyCanvasGO = Object.Instantiate(
		// 	AssetCache.LoadAsset("AirshipPackages/@Easy/Core/Prefabs/UI/AirshipReadOnlyCanvas.prefab"),
		// );
		// const canvasRect = readOnlyCanvasGO.transform as RectTransform;
		// const canvasScaler = readOnlyCanvasGO.gameObject.GetComponent<CanvasScaler>()!;

		let lastTime = 0;
		OnUpdate.Connect((dt) => {
			if (this.rawScreenSize.x !== Screen.width || this.rawScreenSize.y !== Screen.height || this.firstRun) {
				this.firstRun = false;
				lastTime = Time.time;
				this.rawScreenSize = new Vector2(Screen.width, Screen.height);

				const scaleFactor = Game.GetScaleFactor();
				this.screenSize = this.rawScreenSize.div(scaleFactor);

				let sizeType: ScreenSizeType = "md";
				if (Game.IsPortrait()) {
					if (this.screenSize.x < 510) {
						sizeType = "sm";
					}
				} else {
					if (this.screenSize.x <= 1200) {
						sizeType = "sm";
					} else if (this.screenSize.x >= 1560) {
						sizeType = "lg";
					}
				}

				CoreLogger.Log(`sizeType: ${sizeType} size: ${this.screenSize}`);

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

	public async ShowConfirmModal(title: string, message: string): Promise<boolean> {
		const go = Object.Instantiate(
			AssetCache.LoadAsset("Assets/AirshipPackages/@Easy/Core/Prefabs/UI/Modals/AirshipConfirmModal.prefab"),
			Dependency<MainMenuController>().mainContentCanvas.transform,
		);
		const confirmModal = go.GetAirshipComponent<ConfirmModal>()!;
		confirmModal.title.text = title;
		confirmModal.message.text = message;

		AppManager.OpenModal(go, {
			sortingOrderOffset: 100,
		});

		const result = confirmModal.onResult.Wait();
		return result;
	}
}
