import { Signal } from "Shared/Util/Signal";

export class MouseDriver {
	private static inst: MouseDriver;

	public readonly LeftButtonChanged = new Signal<[isDown: boolean]>();
	public readonly RightButtonChanged = new Signal<[isDown: boolean]>();
	public readonly MiddleButtonChanged = new Signal<[isDown: boolean]>();
	public readonly Scrolled = new Signal<[delta: number]>();
	public readonly Moved = new Signal<[location: Vector3]>();
	// public readonly Delta = new Signal<[delta: Vector3]>();

	private readonly inputProxy = UserInputService.InputProxy;

	private constructor() {
		this.inputProxy.OnLeftMouseButtonPressEvent((isDown) => {
			this.LeftButtonChanged.Fire(isDown);
		});
		this.inputProxy.OnRightMouseButtonPressEvent((isDown) => {
			this.RightButtonChanged.Fire(isDown);
		});
		this.inputProxy.OnMiddleMouseButtonPressEvent((isDown) => {
			this.MiddleButtonChanged.Fire(isDown);
		});
		this.inputProxy.OnMouseScrollEvent((scrollAmount) => {
			this.Scrolled.Fire(scrollAmount);
		});
		this.inputProxy.OnMouseMoveEvent((location) => {
			this.Moved.Fire(location);
		});
		// this.inputProxy.OnMouseDeltaEvent((delta) => {
		// 	this.Delta.Fire(delta);
		// });
	}

	public IsLeftDown() {
		return this.inputProxy.IsLeftMouseButtonDown();
	}

	public IsRightDown() {
		return this.inputProxy.IsRightMouseButtonDown();
	}

	public IsMiddleDown() {
		return this.inputProxy.IsMiddleMouseButtonDown();
	}

	public GetLocation() {
		return this.inputProxy.GetMouseLocation();
	}

	public GetDelta() {
		return this.inputProxy.GetMouseDelta();
	}

	public SetLocation(position: Vector3) {
		this.inputProxy.SetMouseLocation(position);
	}

	public IsLocked() {
		return this.inputProxy.IsMouseLocked();
	}

	public SetLocked(locked: boolean) {
		this.inputProxy.SetMouseLocked(locked);
	}

	/** **NOTE:** Internal only. Use `Mouse` class instead. */
	public static instance() {
		return (this.inst ??= new MouseDriver());
	}
}
