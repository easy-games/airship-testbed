import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { Touchscreen } from "../Touchscreen";
import { Mouse } from "../Mouse";
import { Signal } from "@Easy/Core/Shared/Util/Signal";
import { PointerButtonSignal } from "../Drivers/Signals/PointerButtonSignal";
import { CanvasAPI } from "@Easy/Core/Shared/Util/CanvasAPI";

export class Pointer {
	private readonly bin = new Bin();
	private readonly touchscreen = new Touchscreen();
	private readonly mouse = new Mouse();

	public readonly down = new Signal<[event: PointerButtonSignal]>();
	public readonly up = new Signal<[event: PointerButtonSignal]>();
	public readonly moved = new Signal<[location: Vector2]>();

	constructor() {
		this.bin.Add(this.touchscreen);
		this.bin.Add(this.mouse);
		this.bin.Add(this.mouse.leftDown.Proxy(this.down));
		this.bin.Add(this.mouse.leftUp.Proxy(this.up));
		this.bin.Add(this.mouse.moved.Proxy(this.moved));
		this.bin.Connect(this.touchscreen.primaryTouch, (position, phase) => {
			const uiProcessed = CanvasAPI.IsPointerOverUI();
			switch (phase) {
				case TouchPhase.Began:
					this.down.Fire(new PointerButtonSignal(true, uiProcessed));
					break;
				case TouchPhase.Ended:
					this.up.Fire(new PointerButtonSignal(false, uiProcessed));
					break;
				case TouchPhase.Moved:
					this.moved.Fire(new Vector2(position.x, position.y));
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
