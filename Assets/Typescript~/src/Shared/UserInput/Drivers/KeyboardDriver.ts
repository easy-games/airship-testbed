import { Signal } from "Shared/Util/Signal";
import { KeySignal } from "./Signals/KeySignal";

export class KeyboardDriver {
	public readonly KeyDown = new Signal<[key: KeySignal]>();
	public readonly KeyUp = new Signal<[key: KeySignal]>();

	private static inst: KeyboardDriver;

	private constructor() {
		UserInputService.InputProxy.OnKeyPressEvent((key, isDown) => {
			if (isDown) {
				this.KeyDown.Fire(new KeySignal(key));
			} else {
				this.KeyUp.Fire(new KeySignal(key));
			}
		});
	}

	public IsKeyDown(key: Key) {
		return UserInputService.InputProxy.IsKeyDown(key);
	}

	/** **NOTE:** Internal only. Use `Keyboard` class instead. */
	public static instance() {
		return (this.inst ??= new KeyboardDriver());
	}
}
