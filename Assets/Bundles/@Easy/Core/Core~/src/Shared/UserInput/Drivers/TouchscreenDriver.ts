import { Signal } from "Shared/Util/Signal";

export class TouchscreenDriver {
	private static inst: TouchscreenDriver;

	public readonly Touch = new Signal<[touchIndex: number, position: Vector3, phase: TouchPhase]>();
	public readonly TouchTap = new Signal<[touchIndex: number, position: Vector3, phase: InputActionPhase]>();

	private constructor() {
		// UserInputService.InputProxy.OnTouchEvent((touchIndex, position, phase) => {
		// 	this.Touch.Fire(touchIndex, position, phase);
		// });
		// UserInputService.InputProxy.OnTouchTapEvent((touchIndex, position, phase) => {
		// 	this.TouchTap.Fire(touchIndex, position, phase);
		// });
	}

	/** **NOTE:** Internal only. Use `Touchscreen` class instead. */
	public static Instance() {
		return (this.inst ??= new TouchscreenDriver());
	}
}
