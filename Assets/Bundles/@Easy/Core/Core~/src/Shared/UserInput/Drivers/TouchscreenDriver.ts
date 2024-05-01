import { Signal } from "Shared/Util/Signal";

export class TouchscreenDriver {
	private static inst: TouchscreenDriver;

	public readonly touch = new Signal<[touchIndex: number, position: Vector3, phase: TouchPhase]>();
	public readonly touchTap = new Signal<[touchIndex: number, position: Vector3, phase: InputActionPhase]>();

	private constructor() {
		// InputBridge.Instance.OnTouchEvent((touchIndex, position, phase) => {
		// 	this.Touch.Fire(touchIndex, position, phase);
		// });
		// InputBridge.Instance.OnTouchTapEvent((touchIndex, position, phase) => {
		// 	this.TouchTap.Fire(touchIndex, position, phase);
		// });
	}

	/** **NOTE:** Internal only. Use `Touchscreen` class instead. */
	public static Instance() {
		return (this.inst ??= new TouchscreenDriver());
	}
}
