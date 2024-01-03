import { Bin } from "Shared/Util/Bin";
import { Signal } from "Shared/Util/Signal";
import { GestureDriver } from "./Drivers/GestureDriver";
import { TouchscreenDriver } from "./Drivers/TouchscreenDriver";

export class Touchscreen {
	private readonly bin = new Bin();
	private readonly touchscreenDriver = TouchscreenDriver.Instance();
	private readonly gestureDriver = new GestureDriver();

	public readonly touch = new Signal<[touchIndex: number, position: Vector3, phase: TouchPhase]>();
	public readonly touchTap = new Signal<[touchIndex: number, position: Vector3, phase: InputActionPhase]>();

	public readonly primaryTouch = new Signal<[position: Vector3, phase: TouchPhase]>();
	public readonly primaryTouchTap = new Signal<[position: Vector3, phase: InputActionPhase]>();

	public readonly pan = new Signal<[position: Vector3, phase: TouchPhase]>();
	public readonly pinch = new Signal<[distance: number, scale: number, phase: TouchPhase]>();

	constructor() {
		this.bin.Add(this.touch);
		this.bin.Add(this.touchTap);
		this.bin.Add(this.primaryTouch);
		this.bin.Add(this.primaryTouchTap);
		this.bin.Add(this.pan);
		this.bin.Add(this.pinch);
		this.bin.Connect(this.touchscreenDriver.touch, (touchIndex, position, phase) => {
			this.touch.Fire(touchIndex, position, phase);
			if (touchIndex === 0) {
				this.primaryTouch.Fire(position, phase);
			}
		});
		this.bin.Connect(this.touchscreenDriver.touchTap, (touchIndex, position, phase) => {
			this.touchTap.Fire(touchIndex, position, phase);
			if (touchIndex === 0) {
				this.primaryTouchTap.Fire(position, phase);
			}
		});
		this.bin.Add(this.gestureDriver);
		this.bin.Add(this.gestureDriver.pan.Proxy(this.pan));
		this.bin.Add(this.gestureDriver.pinch.Proxy(this.pinch));
	}

	/**
	 * Cleans up the touchscreen listener.
	 */
	public Destroy() {
		this.bin.Destroy();
	}
}
