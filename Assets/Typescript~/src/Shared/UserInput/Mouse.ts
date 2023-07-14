import { Bin } from "Shared/Util/Bin";
import { Signal } from "Shared/Util/Signal";
import { MouseDriver } from "./Drivers/MouseDriver";

const mouseUnlockerKeys = new Set<number>();
let mouseUnlockerIdCounter = 1;

export class Mouse {
	private readonly bin = new Bin();
	private readonly mouseDriver = MouseDriver.instance();

	public readonly LeftDown = new Signal<void>();
	public readonly LeftUp = new Signal<void>();
	public readonly RightDown = new Signal<void>();
	public readonly RightUp = new Signal<void>();
	public readonly MiddleDown = new Signal<void>();
	public readonly MiddleUp = new Signal<void>();
	public readonly Scrolled = new Signal<[delta: number]>();
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
		this.bin.Add(this.LeftDown);
		this.bin.Add(this.LeftUp);
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

		this.bin.Connect(this.mouseDriver.LeftButtonChanged, (isDown) => {
			this.isLeftDown = isDown;
			if (isDown) {
				this.LeftDown.Fire();
			} else {
				this.LeftUp.Fire();
			}
		});

		this.bin.Connect(this.mouseDriver.RightButtonChanged, (isDown) => {
			this.isRightDown = isDown;
			if (isDown) {
				this.RightDown.Fire();
			} else {
				this.RightUp.Fire();
			}
		});

		this.bin.Connect(this.mouseDriver.MiddleButtonChanged, (isDown) => {
			this.isMiddleDown = isDown;
			if (isDown) {
				this.MiddleDown.Fire();
			} else {
				this.MiddleUp.Fire();
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
