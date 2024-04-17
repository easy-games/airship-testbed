import { CanvasAPI } from "Shared/Util/CanvasAPI";
import { Signal } from "Shared/Util/Signal";
import { PointerButtonSignal } from "./Signals/PointerButtonSignal";
import { ScrollSignal } from "./Signals/ScrollSignal";

export class MouseDriver {
	private static inst: MouseDriver;

	public readonly leftButtonChanged = new Signal<[mouseEvent: PointerButtonSignal]>();
	public readonly rightButtonChanged = new Signal<[mouseEvent: PointerButtonSignal]>();
	public readonly middleButtonChanged = new Signal<[mouseEvent: PointerButtonSignal]>();
	public readonly scrolled = new Signal<[event: ScrollSignal]>();
	public readonly moved = new Signal<[position: Vector2]>();

	private readonly inputBridge = InputBridge.Instance;

	private constructor() {
		this.inputBridge.OnLeftMouseButtonPressEvent((isDown) => {
			const uiProcessed = CanvasAPI.IsPointerOverUI();
			const event = new PointerButtonSignal(isDown, uiProcessed);
			this.leftButtonChanged.Fire(event);
		});
		this.inputBridge.OnRightMouseButtonPressEvent((isDown) => {
			const uiProcessed = CanvasAPI.IsPointerOverUI();
			const event = new PointerButtonSignal(isDown, uiProcessed);
			this.rightButtonChanged.Fire(event);
		});
		this.inputBridge.OnMiddleMouseButtonPressEvent((isDown) => {
			const uiProcessed = CanvasAPI.IsPointerOverUI();
			const event = new PointerButtonSignal(isDown, uiProcessed);
			this.middleButtonChanged.Fire(event);
		});
		this.inputBridge.OnMouseScrollEvent((scrollAmount) => {
			const uiProcessed = CanvasAPI.IsPointerOverUI();
			const event = new ScrollSignal(scrollAmount, uiProcessed);
			this.scrolled.Fire(event);
		});
		this.inputBridge.OnMouseMoveEvent((position) => {
			this.moved.Fire(position);
		});
	}

	public IsLeftDown() {
		return this.inputBridge.IsLeftMouseButtonDown();
	}

	public IsRightDown() {
		return this.inputBridge.IsRightMouseButtonDown();
	}

	public IsMiddleDown() {
		return this.inputBridge.IsMiddleMouseButtonDown();
	}

	public GetPosition() {
		return this.inputBridge.GetMousePosition();
	}

	public GetDelta() {
		return this.inputBridge.GetMouseDelta();
	}

	public IsLocked() {
		return this.inputBridge.IsMouseLocked();
	}

	public SetLocked(locked: boolean) {
		this.inputBridge.SetMouseLocked(locked);
	}

	public ToggleMouseVisibility(isVisible: boolean) {
		this.inputBridge.ToggleMouseVisibility(isVisible);
	}

	/** **NOTE:** Internal only. Use `Mouse` class instead. */
	public static Instance() {
		return (this.inst ??= new MouseDriver());
	}
}
