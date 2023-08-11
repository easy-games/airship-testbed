import { Bin } from "Shared/Util/Bin";
import { Touchscreen } from "../Touchscreen";
import { Mouse } from "../Mouse";
import { Signal } from "Shared/Util/Signal";

export class Pointer {
	private readonly bin = new Bin();
	private readonly touchscreen = new Touchscreen();
	private readonly mouse = new Mouse();

	public readonly Down = new Signal<void>();
	public readonly Up = new Signal<void>();
	public readonly Moved = new Signal<[location: Vector3]>();

	constructor() {
		this.bin.Add(this.touchscreen);
		this.bin.Add(this.mouse);
		this.bin.Add(this.mouse.LeftDown.Proxy(this.Down));
		this.bin.Add(this.mouse.LeftUp.Proxy(this.Up));
		this.bin.Add(this.mouse.Moved.Proxy(this.Moved));
		this.bin.Connect(this.touchscreen.PrimaryTouch, (location, phase) => {
			switch (phase) {
				case TouchPhase.Began:
					this.Down.Fire();
					break;
				case TouchPhase.Ended:
					this.Up.Fire();
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
