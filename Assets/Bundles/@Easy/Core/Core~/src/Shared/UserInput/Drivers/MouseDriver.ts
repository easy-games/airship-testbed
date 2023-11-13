import { Signal } from "Shared/Util/Signal";
import { PointerButtonSignal } from "./Signals/PointerButtonSignal";
import { ScrollSignal } from "./Signals/ScrollSignal";
import { CanvasAPI } from "Shared/Util/CanvasAPI";

export class MouseDriver {
	private static inst: MouseDriver;

	public readonly LeftButtonChanged = new Signal<[mouseEvent: PointerButtonSignal]>();
	public readonly RightButtonChanged = new Signal<[mouseEvent: PointerButtonSignal]>();
	public readonly MiddleButtonChanged = new Signal<[mouseEvent: PointerButtonSignal]>();
	public readonly Scrolled = new Signal<[event: ScrollSignal]>();
	public readonly Moved = new Signal<[location: Vector3]>();
	// public readonly Delta = new Signal<[delta: Vector3]>();

	private readonly inputProxy = UserInputService.InputProxy;

	private constructor() {
		this.inputProxy.OnLeftMouseButtonPressEvent((isDown) => {
			const uiProcessed = CanvasAPI.IsPointerOverUI();
			const event = new PointerButtonSignal(isDown, uiProcessed);
			this.LeftButtonChanged.Fire(event);
		});
		this.inputProxy.OnRightMouseButtonPressEvent((isDown) => {
			const uiProcessed = CanvasAPI.IsPointerOverUI();
			const event = new PointerButtonSignal(isDown, uiProcessed);
			this.RightButtonChanged.Fire(event);
		});
		this.inputProxy.OnMiddleMouseButtonPressEvent((isDown) => {
			const uiProcessed = CanvasAPI.IsPointerOverUI();
			const event = new PointerButtonSignal(isDown, uiProcessed);
			this.MiddleButtonChanged.Fire(event);
		});
		this.inputProxy.OnMouseScrollEvent((scrollAmount) => {
			const uiProcessed = CanvasAPI.IsPointerOverUI();
			const event = new ScrollSignal(scrollAmount, uiProcessed);
			this.Scrolled.Fire(event);
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
