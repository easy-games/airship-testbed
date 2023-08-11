import { Bin } from "Shared/Util/Bin";
import { Signal } from "Shared/Util/Signal";
import { GestureDriver } from "./Drivers/GestureDriver";
import { TouchscreenDriver } from "./Drivers/TouchscreenDriver";

export class Touchscreen {
	private readonly bin = new Bin();
	private readonly touchscreenDriver = TouchscreenDriver.instance();
	private readonly gestureDriver = new GestureDriver();

	public readonly Touch = new Signal<[touchIndex: number, position: Vector3, phase: TouchPhase]>();
	public readonly TouchTap = new Signal<[touchIndex: number, position: Vector3, phase: InputActionPhase]>();

	public readonly PrimaryTouch = new Signal<[position: Vector3, phase: TouchPhase]>();
	public readonly PrimaryTouchTap = new Signal<[position: Vector3, phase: InputActionPhase]>();

	public readonly Pan = new Signal<[position: Vector3, phase: TouchPhase]>();
	public readonly Pinch = new Signal<[distance: number, scale: number, phase: TouchPhase]>();

	constructor() {
		this.bin.Add(this.Touch);
		this.bin.Add(this.TouchTap);
		this.bin.Add(this.PrimaryTouch);
		this.bin.Add(this.PrimaryTouchTap);
		this.bin.Add(this.Pan);
		this.bin.Add(this.Pinch);
		this.bin.Connect(this.touchscreenDriver.Touch, (touchIndex, position, phase) => {
			this.Touch.Fire(touchIndex, position, phase);
			if (touchIndex === 0) {
				this.PrimaryTouch.Fire(position, phase);
			}
		});
		this.bin.Connect(this.touchscreenDriver.TouchTap, (touchIndex, position, phase) => {
			this.TouchTap.Fire(touchIndex, position, phase);
			if (touchIndex === 0) {
				this.PrimaryTouchTap.Fire(position, phase);
			}
		});
		this.bin.Add(this.gestureDriver);
		this.bin.Add(this.gestureDriver.Pan.Proxy(this.Pan));
		this.bin.Add(this.gestureDriver.Pinch.Proxy(this.Pinch));
	}

	/**
	 * Cleans up the touchscreen listener.
	 */
	public Destroy() {
		this.bin.Destroy();
	}
}
