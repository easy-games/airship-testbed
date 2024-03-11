import { OnStart, Singleton } from "Shared/Flamework";
import { Bin } from "../../Util/Bin";
import { Modifier } from "../../Util/Modifier";
import { Signal } from "../../Util/Signal";
import { ScreenSizeType } from "./ScreenSizeType";

@Singleton({})
export class MainMenuSingleton implements OnStart {
	public sizeType: ScreenSizeType = "md";
	public onSizeTypeChanged = new Signal<ScreenSizeType>();

	public screenSize!: Vector2;

	public navbarModifier = new Modifier<{ hidden: boolean }>();

	constructor() {
		this.screenSize = new Vector2(Screen.width, Screen.height);
	}

	OnStart(): void {}

	public ObserveScreenSizeType(observer: (size: ScreenSizeType) => (() => void) | void): Bin {
		const bin = new Bin();
		let cleanup = observer(this.sizeType);

		bin.Add(
			this.onSizeTypeChanged.Connect((newSize) => {
				cleanup?.();
				cleanup = observer(newSize);
			}),
		);

		return bin;
	}
}
