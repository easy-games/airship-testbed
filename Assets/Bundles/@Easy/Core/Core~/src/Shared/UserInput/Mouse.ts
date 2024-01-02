import { Bin } from "Shared/Util/Bin";
import { Signal } from "Shared/Util/Signal";
import { MouseDriver } from "./Drivers/MouseDriver";
import { PointerButtonSignal } from "./Drivers/Signals/PointerButtonSignal";
import { ScrollSignal } from "./Drivers/Signals/ScrollSignal";

const mouseUnlockerKeys = new Set<number>();
let mouseUnlockerIdCounter = 1;

export class Mouse {
	private readonly bin = new Bin();
	private readonly mouseDriver = MouseDriver.Instance();

	public readonly LeftDown = new Signal<[event: PointerButtonSignal]>();
	public readonly LeftUp = new Signal<[event: PointerButtonSignal]>();
	public readonly RightDown = new Signal<[event: PointerButtonSignal]>();
	public readonly RightUp = new Signal<[event: PointerButtonSignal]>();
	public readonly MiddleDown = new Signal<[event: PointerButtonSignal]>();
	public readonly MiddleUp = new Signal<[event: PointerButtonSignal]>();
	public readonly Scrolled = new Signal<[event: ScrollSignal]>();
	public readonly Moved = new Signal<[location: Vector3]>();
	// public readonly Delta = new Signal<[delta: Vector3]>();

	private isLeftDown = false;
	private isRightDown = false;
	private isMiddleDown = false;
	private location = new Vector3(0, 0, 0);

	constructor() {
		// Track signals in bin:
		this.bin.Add(this.LeftDown);
		this.bin.Add(this.LeftUp);
		this.bin.Add(this.RightDown);
		this.bin.Add(this.RightUp);
		this.bin.Add(this.MiddleDown);
		this.bin.Add(this.MiddleUp);
		this.bin.Add(this.Scrolled);
		this.bin.Add(this.Moved);
		// this.bin.Add(this.Delta);

		// Initial states:
		this.isLeftDown = this.mouseDriver.IsLeftDown();
		this.isRightDown = this.mouseDriver.IsRightDown();
		this.isMiddleDown = this.mouseDriver.IsMiddleDown();
		this.location = this.mouseDriver.GetLocation();

		if (mouseUnlockerKeys.size() === 0) {
			this.mouseDriver.SetLocked(true);
		}

		// Connect to mouse driver:

		this.bin.Connect(this.mouseDriver.LeftButtonChanged, (event) => {
			this.isLeftDown = event.isDown;
			if (event.isDown) {
				this.LeftDown.Fire(event);
			} else {
				this.LeftUp.Fire(event);
			}
		});

		this.bin.Connect(this.mouseDriver.RightButtonChanged, (event) => {
			this.isRightDown = event.isDown;
			if (event.isDown) {
				this.RightDown.Fire(event);
			} else {
				this.RightUp.Fire(event);
			}
		});

		this.bin.Connect(this.mouseDriver.MiddleButtonChanged, (event) => {
			this.isMiddleDown = event.isDown;
			if (event.isDown) {
				this.MiddleDown.Fire(event);
			} else {
				this.MiddleUp.Fire(event);
			}
		});

		this.bin.Connect(this.mouseDriver.Moved, (location) => {
			this.location = location;
			this.Moved.Fire(location);
		});

		// this.bin.Connect(this.mouseDriver.Delta, (delta) => {
		// 	this.Delta.Fire(delta);
		// });

		this.bin.Connect(this.mouseDriver.Scrolled, (delta) => {
			this.Scrolled.Fire(delta);
		});
	}

	/** Returns `true` if the left mouse button is down. */
	public IsLeftButtonDown() {
		return this.isLeftDown;
	}

	/** Returns `true` if the right mouse button is down. */
	public IsRightButtonDown() {
		return this.isRightDown;
	}

	/** Returns `true` if the middle mouse button is down. */
	public IsMiddleButtonDown() {
		return this.isMiddleDown;
	}

	/** Gets the position of the mouse on-screen. */
	public GetLocation() {
		return this.location;
	}

	/** Sets the position of the mouse on-screen. */
	public SetLocation(position: Vector3) {
		this.mouseDriver.SetLocation(position);
	}

	/** Gets the mouse's change in position on-screen over the last frame. */
	public GetDelta() {
		return this.mouseDriver.GetDelta();
	}

	/**
	 * Locks the mouse.
	 * Returns an ID that can be used to unlock the mouse.
	 */
	public AddUnlocker(): number {
		const id = mouseUnlockerIdCounter;
		mouseUnlockerIdCounter++;
		mouseUnlockerKeys.add(id);

		this.mouseDriver.SetLocked(false);

		return id;
	}

	public RemoveUnlocker(id: number): void {
		mouseUnlockerKeys.delete(id);
		if (mouseUnlockerKeys.size() === 0) {
			this.mouseDriver.SetLocked(true);
		}
	}

	public ClearAllLockers(): void {
		mouseUnlockerKeys.clear();
		this.mouseDriver.SetLocked(true);
	}

	/** Check if the mouse is locked. */
	public IsLocked() {
		return this.mouseDriver.IsLocked();
	}

	/** Cleans up the mouse. */
	public Destroy() {
		this.bin.Destroy();
	}
}
