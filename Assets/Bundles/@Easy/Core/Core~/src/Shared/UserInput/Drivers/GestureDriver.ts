import { Bin } from "Shared/Util/Bin";
import { Signal } from "Shared/Util/Signal";
// import { DirectionV3, DistanceV3, DotV3, LerpV3, MagnitudeV3 } from "Shared/Util/Vector3Util";
import { TouchscreenDriver } from "./TouchscreenDriver";

// -1 would be a perfect pinch:
const PINCH_DOT_THRESHOLD = -0.8;

class OneFingerGestureCapture {
	public readonly pan = new Signal<[position: Vector3, phase: TouchPhase]>();

	constructor() {}

	public Update(position: Vector3, phase: TouchPhase) {
		this.pan.Fire(position, phase);
	}

	public Destroy() {
		this.pan.Destroy();
	}
}

class TwoFingerGestureCapture {
	private readonly centerStart: Vector3;
	private readonly startDistance: number;

	public readonly pinch = new Signal<[distance: number, scale: number, phase: TouchPhase]>();

	private pinching = false;
	private lastPinchDistance = 0;
	private lastPinchScale = 1;

	constructor(
		private readonly primaryStart: Vector3,
		private readonly secondaryStart: Vector3,
	) {
		this.centerStart = primaryStart.Lerp(secondaryStart, 0.5);
		this.startDistance = primaryStart.Distance(secondaryStart);
	}

	public Update(primary: Vector3, secondary: Vector3) {
		const primaryDir = primary.sub(this.centerStart).normalized;
		const secondaryDir = secondary.sub(this.centerStart).normalized;
		const dot = primaryDir.Dot(secondaryDir);
		if (dot <= PINCH_DOT_THRESHOLD) {
			// Good pinch
			const started = !this.pinching;
			if (started) {
				this.pinching = true;
			}
			const distanceBetween = primary.Distance(secondary);
			const distance = math.abs(distanceBetween - this.startDistance);
			const scale = distanceBetween / this.startDistance;
			this.lastPinchDistance = distance;
			this.lastPinchScale = scale;
			this.pinch.Fire(distance, scale, started ? TouchPhase.Began : TouchPhase.Moved);
		} else {
			// Bad pinch
			if (this.pinching) {
				this.pinching = false;
				this.pinch.Fire(this.lastPinchDistance, this.lastPinchScale, TouchPhase.Ended);
			}
		}
	}

	public Destroy() {
		if (this.pinching) {
			this.pinch.Fire(this.lastPinchDistance, this.lastPinchScale, TouchPhase.Ended);
		}
		this.pinch.Destroy();
	}
}

export class GestureDriver {
	private readonly bin = new Bin();
	private readonly touchscreenDriver = TouchscreenDriver.Instance();

	public readonly pan = new Signal<[position: Vector3, phase: TouchPhase]>();
	public readonly pinch = new Signal<[distance: number, scale: number, phase: TouchPhase]>();

	private readonly positions = new Map<number, Vector3>();

	private oneFingerGestureCapture?: OneFingerGestureCapture;
	private twoFingerGestureCapture?: TwoFingerGestureCapture;

	constructor() {
		this.bin.Add(this.pan);
		this.bin.Add(this.pinch);

		this.bin.Connect(this.touchscreenDriver.touch, (touchIndex, position, phase) => {
			switch (phase) {
				case TouchPhase.Began:
				case TouchPhase.Moved:
					this.positions.set(touchIndex, position);
					if (touchIndex === 0 && this.hasOneTouching()) {
						if (this.oneFingerGestureCapture === undefined) {
							this.oneFingerGestureCapture = new OneFingerGestureCapture();
							this.oneFingerGestureCapture.pan.Proxy(this.pan);
						}
						this.oneFingerGestureCapture.Update(position, phase);
					} else if ((touchIndex === 0 || touchIndex === 1) && this.hasTwoTouching()) {
						const primary = this.positions.get(0)!;
						const secondary = this.positions.get(1)!;
						if (this.twoFingerGestureCapture === undefined) {
							this.twoFingerGestureCapture = new TwoFingerGestureCapture(primary, secondary);
							this.twoFingerGestureCapture.pinch.Proxy(this.pinch);
						}
						this.twoFingerGestureCapture.Update(primary, secondary);
					}
					break;
				case TouchPhase.Ended:
					this.positions.delete(touchIndex);
					if (touchIndex === 0 && this.oneFingerGestureCapture !== undefined) {
						this.oneFingerGestureCapture.Update(position, phase);
						this.oneFingerGestureCapture.Destroy();
						this.oneFingerGestureCapture = undefined;
					}
					if ((touchIndex === 0 || touchIndex === 1) && this.twoFingerGestureCapture !== undefined) {
						this.twoFingerGestureCapture.Destroy();
						this.twoFingerGestureCapture = undefined;
					}
					break;
			}
		});
	}

	private hasOneTouching() {
		return this.positions.has(0) && !this.positions.has(1);
	}

	private hasTwoTouching() {
		return this.positions.has(0) && this.positions.has(1) && !this.positions.has(2);
	}

	public Destroy() {
		this.oneFingerGestureCapture?.Destroy();
		this.twoFingerGestureCapture?.Destroy();
		this.bin.Destroy();
	}
}
