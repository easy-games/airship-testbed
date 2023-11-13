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

	public readonly Down = new Signal<[event: PointerButtonSignal]>();
	public readonly Up = new Signal<[event: PointerButtonSignal]>();
	public readonly Moved = new Signal<[location: Vector3]>();

	constructor() {
		this.bin.Add(this.touchscreen);
		this.bin.Add(this.mouse);
		this.bin.Add(this.mouse.LeftDown.Proxy(this.Down));
		this.bin.Add(this.mouse.LeftUp.Proxy(this.Up));
		this.bin.Add(this.mouse.Moved.Proxy(this.Moved));
		this.bin.Connect(this.touchscreen.PrimaryTouch, (location, phase) => {
			const uiProcessed = CanvasAPI.IsPointerOverUI();
			switch (phase) {
				case TouchPhase.Began:
					this.Down.Fire(new PointerButtonSignal(true, uiProcessed));
					break;
				case TouchPhase.Ended:
					this.Up.Fire(new PointerButtonSignal(false, uiProcessed));
					break;
				case TouchPhase.Moved:
					this.Moved.Fire(location);
					break;
			}
		});
		this.bin.Add(this.Down);
		this.bin.Add(this.Up);
		this.bin.Add(this.Moved);
	}

	/**
	 * Cleans up the pointer listeners.
	 */
	public Destroy() {
		this.bin.Destroy();
	}
}
