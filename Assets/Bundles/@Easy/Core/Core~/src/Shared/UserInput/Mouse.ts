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

	public readonly leftDown = new Signal<[event: PointerButtonSignal]>();
	public readonly leftUp = new Signal<[event: PointerButtonSignal]>();
	public readonly rightDown = new Signal<[event: PointerButtonSignal]>();
	public readonly rightUp = new Signal<[event: PointerButtonSignal]>();
	public readonly middleDown = new Signal<[event: PointerButtonSignal]>();
	public readonly middleUp = new Signal<[event: PointerButtonSignal]>();
	public readonly scrolled = new Signal<[event: ScrollSignal]>();
	public readonly moved = new Signal<[location: Vector3]>();
	// public readonly Delta = new Signal<[delta: Vector3]>();

	private isLeftDown = false;
	private isRightDown = false;
	private isMiddleDown = false;
	private location = new Vector3(0, 0, 0);

	constructor() {
		// Track signals in bin:
		this.bin.Add(this.leftDown);
		this.bin.Add(this.leftUp);
		this.bin.Add(this.rightDown);
		this.bin.Add(this.rightUp);
		this.bin.Add(this.middleDown);
		this.bin.Add(this.middleUp);
		this.bin.Add(this.scrolled);
		this.bin.Add(this.moved);
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

		this.bin.Connect(this.mouseDriver.leftButtonChanged, (event) => {
			this.isLeftDown = event.isDown;
			if (event.isDown) {
				this.leftDown.Fire(event);
			} else {
				this.leftUp.Fire(event);
			}
		});

		this.bin.Connect(this.mouseDriver.rightButtonChanged, (event) => {
			this.isRightDown = event.isDown;
			if (event.isDown) {
				this.rightDown.Fire(event);
			} else {
				this.rightUp.Fire(event);
			}
		});

		this.bin.Connect(this.mouseDriver.middleButtonChanged, (event) => {
			this.isMiddleDown = event.isDown;
			if (event.isDown) {
				this.middleDown.Fire(event);
			} else {
				this.middleUp.Fire(event);
			}
		});

		this.bin.Connect(this.mouseDriver.moved, (location) => {
			this.location = location;
			this.moved.Fire(location);
		});

		// this.bin.Connect(this.mouseDriver.Delta, (delta) => {
		// 	this.Delta.Fire(delta);
		// });

		this.bin.Connect(this.mouseDriver.scrolled, (delta) => {
			this.scrolled.Fire(delta);
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

	public ToggleMouseVisibility(isVisible: boolean) {
		this.mouseDriver.ToggleMouseVisibility(isVisible);
	}

	public HideCursor() {}
}
