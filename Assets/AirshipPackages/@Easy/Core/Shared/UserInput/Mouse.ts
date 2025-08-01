import { Signal } from "@Easy/Core/Shared/Util/Signal";
import { Game } from "../Game";
import { CanvasAPI } from "../Util/CanvasAPI";
import { PointerButtonSignal } from "./Drivers/Signals/PointerButtonSignal";
import { ScrollSignal } from "./Drivers/Signals/ScrollSignal";

const inputBridge = InputBridge.Instance;

const mouseUnlockerKeys = new Set<number>();
let mouseUnlockerIdCounter = 1;

if (Game.IsGameLuauContext()) {
	inputBridge.SetMouseLocked(true);
}

export interface MouseUnlocker {
	Destroy(): void;
}

export class Mouse {
	public static readonly onLeftDown = new Signal<[event: PointerButtonSignal]>();
	public static readonly onLeftUp = new Signal<[event: PointerButtonSignal]>();
	public static readonly onRightDown = new Signal<[event: PointerButtonSignal]>();
	public static readonly onRightUp = new Signal<[event: PointerButtonSignal]>();
	public static readonly onMiddleDown = new Signal<[event: PointerButtonSignal]>();
	public static readonly onMiddleUp = new Signal<[event: PointerButtonSignal]>();
	public static readonly onForwardDown = new Signal<[event: PointerButtonSignal]>();
	public static readonly onForwardUp = new Signal<[event: PointerButtonSignal]>();
	public static readonly onBackDown = new Signal<[event: PointerButtonSignal]>();
	public static readonly onBackUp = new Signal<[event: PointerButtonSignal]>();
	public static readonly onScrolled = new Signal<[event: ScrollSignal]>();
	public static readonly onMoved = new Signal<[position: Vector2]>();
	// public readonly Delta = new Signal<[delta: Vector2]>();

	public static readonly isLeftDown = inputBridge.IsLeftMouseButtonDown();
	public static readonly isRightDown = inputBridge.IsRightMouseButtonDown();
	public static readonly isMiddleDown = inputBridge.IsMiddleMouseButtonDown();
	public static readonly isBackDown = inputBridge.IsBackMouseButtonDown();
	public static readonly isForwardDown = inputBridge.IsForwardMouseButtonDown();
	public static readonly position = inputBridge.GetMousePosition();

	constructor() {
		error(
			"Invalid usage of Mouse API. Do not use Mouse constructor. Instead, use static properties. Example: Mouse.isLeftDown",
		);
	}

	/**
	 * @deprecated
	 * @param button
	 * @param callback
	 * @returns
	 */
	public static OnButtonDown(button: MouseButton, callback: (event: PointerButtonSignal) => void) {
		switch (button) {
			case MouseButton.LeftButton:
				return Mouse.onLeftDown.Connect(callback);
			case MouseButton.MiddleButton:
				return Mouse.onMiddleDown.Connect(callback);
			case MouseButton.RightButton:
				return Mouse.onRightDown.Connect(callback);
			case MouseButton.BackButton:
				return Mouse.onBackDown.Connect(callback);
			case MouseButton.ForwardButton:
				return Mouse.onForwardDown.Connect(callback);
		}
	}

	/**
	 * @deprecated
	 * @param button
	 * @param callback
	 * @returns
	 */
	public static OnButtonUp(button: MouseButton, callback: (event: PointerButtonSignal) => void) {
		switch (button) {
			case MouseButton.LeftButton:
				return Mouse.onLeftUp.Connect(callback);
			case MouseButton.MiddleButton:
				return Mouse.onMiddleUp.Connect(callback);
			case MouseButton.RightButton:
				return Mouse.onRightUp.Connect(callback);
			case MouseButton.BackButton:
				return Mouse.onBackUp.Connect(callback);
			case MouseButton.ForwardButton:
				return Mouse.onForwardUp.Connect(callback);
		}
	}

	/** Gets the position of the mouse on-screen as a Vector3, with the Z axis set to 0. */
	public static GetPositionVector3() {
		const pos = Mouse.position;
		return new Vector3(pos.x, pos.y, 0);
	}

	/** Gets the mouse's change in position on-screen over the last frame. */
	public static GetDelta() {
		return inputBridge.GetMouseDelta();
	}

	/**
	 * Unlocks the mouse.
	 * Returns a cleanup function that can be called to lock the mouse.
	 *
	 * This pattern is used to allow many different systems unlock the mouse without stomping on each other.
	 *
	 * Example:
	 * ```
	 * const cleanupUnlocker = Mouse.AddUnlocker();
	 * // ... some time later when we want to "re-lock" the mouse.
	 * cleanupUnlocker();
	 * ```
	 * ------
	 * You can also add the unlocker to a bin for even easier cleanup!
	 * ```
	 * const bin = new Bin();
	 * bin.Add(Mouse.AddUnlocker());
	 *
	 * // some time later
	 * bin.Clean();
	 * ```
	 */
	public static AddUnlocker(): () => void {
		if (contextbridge.current() === LuauContext.Protected && Game.IsInGame()) {
			let id = Mouse.AddUnlockerInternal();
			return () => {
				contextbridge.invoke<(id: number) => void>("Mouse:RemoveUnlocker", LuauContext.Game, id);
			};
		}

		const id = this.AddUnlockerInternal();
		mouseUnlockerIdCounter++;
		mouseUnlockerKeys.add(id);

		inputBridge.SetMouseLocked(false);

		return () => {
			this.RemoveUnlocker(id);
		};
	}

	/**
	 * Used to detect if pointer is over a UI raycast target.
	 *
	 * This is useful to prevent actions when interacting with UI (like a sword swing).
	 *
	 * **This will only check for raycast targets on the "UI" layer.**
	 * Make sure your UI is set to the UI layer to work with this method.
	 *
	 * @returns True if mouse is hovering above a ui raycast target.
	 */
	public static IsOverUI(): boolean {
		return CanvasAPI.IsPointerOverUI();
	}

	private static AddUnlockerInternal(): number {
		if (contextbridge.current() === LuauContext.Protected && Game.IsInGame()) {
			let id: number;

			// This method is sometimes called before the contextbridge callback is setup.
			// So we keep trying until success.
			let success = false;
			while (!success) {
				try {
					id = contextbridge.invoke<() => number>("Mouse:AddUnlocker", LuauContext.Game);
					success = true;
				} catch (err) {
					task.unscaledWait();
				}
			}
			return id!;
		}

		const id = mouseUnlockerIdCounter;
		mouseUnlockerIdCounter++;
		mouseUnlockerKeys.add(id);

		inputBridge.SetMouseLocked(false);

		return id;
	}

	private static RemoveUnlocker(id: number): void {
		if (contextbridge.current() === LuauContext.Protected && Game.IsInGame()) {
			contextbridge.invoke<(id: number) => void>("Mouse:RemoveUnlocker", LuauContext.Game, id);
			return;
		}
		mouseUnlockerKeys.delete(id);
		if (mouseUnlockerKeys.size() === 0) {
			inputBridge.SetMouseLocked(true);
		}
	}

	public static ClearAllUnlockers(): void {
		mouseUnlockerKeys.clear();
		inputBridge.SetMouseLocked(true);
	}

	public static WarpCursorPosition(position: Vector2): void {
		inputBridge.WarpCursorPosition(position);
	}

	/** Check if the mouse is locked. */
	public static IsLocked() {
		return inputBridge.IsMouseLocked();
	}

	public static SetCursorVisible(isVisible: boolean) {
		inputBridge.SetCursorVisible(isVisible);
	}

	public HideCursor() {}
}

if (Game.IsGameLuauContext()) {
	// cast as "any" so we can use private methods
	let mouseUntyped = Mouse as unknown as {
		AddUnlockerInternal(): number;
		RemoveUnlocker(id: number): void;
	};

	contextbridge.callback<() => number>("Mouse:AddUnlocker", () => {
		let id = mouseUntyped.AddUnlockerInternal();
		return id;
	});

	contextbridge.callback<(from: LuauContext, id: number) => void>("Mouse:RemoveUnlocker", (from, id) => {
		mouseUntyped.RemoveUnlocker(id);
	});
}

inputBridge.OnForwardMouseButtonPressEvent((isDown) => {
	const uiProcessed = CanvasAPI.IsPointerOverUI();
	const event = new PointerButtonSignal(isDown, uiProcessed);
	if (isDown) {
		(Mouse.isForwardDown as boolean) = true;
		Mouse.onForwardDown.Fire(event);
	} else {
		(Mouse.isForwardDown as boolean) = false;
		Mouse.onForwardUp.Fire(event);
	}
});
inputBridge.OnBackMouseButtonPressEvent((isDown) => {
	const uiProcessed = CanvasAPI.IsPointerOverUI();
	const event = new PointerButtonSignal(isDown, uiProcessed);
	if (isDown) {
		(Mouse.isBackDown as boolean) = true;
		Mouse.onBackDown.Fire(event);
	} else {
		(Mouse.isBackDown as boolean) = false;
		Mouse.onBackUp.Fire(event);
	}
});
inputBridge.OnLeftMouseButtonPressEvent((isDown) => {
	const uiProcessed = CanvasAPI.IsPointerOverUI();
	const event = new PointerButtonSignal(isDown, uiProcessed);
	if (isDown) {
		(Mouse.isLeftDown as boolean) = true;
		Mouse.onLeftDown.Fire(event);
	} else {
		(Mouse.isLeftDown as boolean) = false;
		Mouse.onLeftUp.Fire(event);
	}
});
inputBridge.OnRightMouseButtonPressEvent((isDown) => {
	const uiProcessed = CanvasAPI.IsPointerOverUI();
	const event = new PointerButtonSignal(isDown, uiProcessed);
	if (isDown) {
		(Mouse.isRightDown as boolean) = true;
		Mouse.onRightDown.Fire(event);
	} else {
		(Mouse.isRightDown as boolean) = false;
		Mouse.onRightUp.Fire(event);
	}
});
inputBridge.OnMiddleMouseButtonPressEvent((isDown) => {
	const uiProcessed = CanvasAPI.IsPointerOverUI();
	const event = new PointerButtonSignal(isDown, uiProcessed);
	if (isDown) {
		(Mouse.isMiddleDown as boolean) = true;
		Mouse.onMiddleDown.Fire(event);
	} else {
		(Mouse.isMiddleDown as boolean) = false;
		Mouse.onMiddleUp.Fire(event);
	}
});
inputBridge.OnMouseScrollEvent((scrollAmount) => {
	const uiProcessed = CanvasAPI.IsPointerOverUI();
	const event = new ScrollSignal(scrollAmount, uiProcessed);
	Mouse.onScrolled.Fire(event);
});
inputBridge.OnMouseMoveEvent((pos) => {
	(Mouse.position as Vector2) = pos;
	Mouse.onMoved.Fire(pos);
});
