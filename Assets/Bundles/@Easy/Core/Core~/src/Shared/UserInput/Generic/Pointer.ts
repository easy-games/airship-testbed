import { Bin } from "Shared/Util/Bin";
import { Touchscreen } from "../Touchscreen";
import { Mouse } from "../Mouse";
import { Signal } from "Shared/Util/Signal";
import { PointerButtonSignal } from "../Drivers/Signals/PointerButtonSignal";
import { CanvasAPI } from "Shared/Util/CanvasAPI";

export class Pointer {
	private readonly bin = new Bin();
	private readonly touchscreen = new Touchscreen();
	private readonly mouse = new Mouse();

	public readonly down = new Signal<[event: PointerButtonSignal]>();
	public readonly up = new Signal<[event: PointerButtonSignal]>();
	public readonly moved = new Signal<[location: Vector3]>();

	constructor() {
		this.bin.Add(this.touchscreen);
		this.bin.Add(this.mouse);
		this.bin.Add(this.mouse.leftDown.Proxy(this.down));
		this.bin.Add(this.mouse.leftUp.Proxy(this.up));
		this.bin.Add(this.mouse.moved.Proxy(this.moved));
		this.bin.Connect(this.touchscreen.primaryTouch, (location, phase) => {
			const uiProcessed = CanvasAPI.IsPointerOverUI();
			switch (phase) {
				case TouchPhase.Began:
					this.down.Fire(new PointerButtonSignal(true, uiProcessed));
					break;
				case TouchPhase.Ended:
					this.up.Fire(new PointerButtonSignal(false, uiProcessed));
					break;
				case TouchPhase.Moved:
					this.moved.Fire(location);
					break;
			}
		});
		this.bin.Add(this.down);
		this.bin.Add(this.up);
		this.bin.Add(this.moved);
	}

	/**
	 * Cleans up the pointer listeners.
	 */
	public Destroy() {
		this.bin.Destroy();
	}
}
