import { OnStart, Singleton } from "Shared/Flamework";
import { Bin } from "../../Util/Bin";
import { Modifier } from "../../Util/Modifier";
import { Signal } from "../../Util/Signal";
import { ScreenSizeType } from "./ScreenSizeType";

@Singleton({})
export class MainMenuSingleton implements OnStart {
	public sizeType: ScreenSizeType = "md";
	public onSizeChanged = new Signal<[sizeType: ScreenSizeType, size: Vector2]>();

	public screenSize!: Vector2;

	public navbarModifier = new Modifier<{ hidden: boolean }>();
	public socialMenuModifier = new Modifier<{ hidden: boolean }>();

	constructor() {
		this.screenSize = new Vector2(Screen.width, Screen.height);
	}

	OnStart(): void {}

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
