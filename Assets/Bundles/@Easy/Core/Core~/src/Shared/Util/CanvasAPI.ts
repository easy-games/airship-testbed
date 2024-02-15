/** Pointer button. */
export enum PointerButton {
	LEFT,
	RIGHT,
	MIDDLE,
}

/** Pointer direction. */
export enum PointerDirection {
	DOWN,
	UP,
}

/** Hover state. */
export enum HoverState {
	ENTER,
	EXIT,
}

export class CanvasAPI {
	/** Global event interceptor. */
	private static eventInterceptor: CanvasUIEventInterceptor | undefined;

	private static canvasUIEvents: CanvasUIEvents;
	private static canvasHitDetector: CanvasHitDetector;
	private static selectedInstanceId?: number;

	public static Init(): void {
		this.canvasUIEvents = GameObject.Find("CanvasUIEvents").GetComponent<CanvasUIEvents>();
		this.canvasHitDetector = this.canvasUIEvents.gameObject.GetComponent<CanvasHitDetector>();
	}

	public static RegisterEvents(gameObject: GameObject): void {
		this.canvasUIEvents.RegisterEvents(gameObject);
	}

	public static IsPointerOverUI(): boolean {
		return this.canvasHitDetector.IsPointerOverUI();
	}

	public static IsPointerOverTarget(target: GameObject): boolean {
		return this.canvasHitDetector.IsPointerOverTarget(target);
	}

	public static OnScreenSizeEvent(callback: (width: number, height: number) => void) {
		return this.eventInterceptor!.OnScreenSizeChangeEvent((width, height) => {
			callback(width as number, height as number);
		});
	}

	/**
	 * Subscribe to pointer events for a given target. `targetGameObject` MUST have an `EventTrigger` component
	 * to be eligible to receive input events. See the `ShopItem` prefab for an example.
	 *
	 * @param targetGameObject Target of pointer event.
	 * @param callback Callback to run when `targetGameObject` is the subject of a pointer event. Includes direction and button.
	 */
	public static OnPointerEvent(
		targetGameObject: GameObject,
		callback: (direction: PointerDirection, button: PointerButton) => void,
	): EngineEventConnection {
		this.Setup(targetGameObject);
		let id = targetGameObject.GetInstanceID();
		return this.eventInterceptor!.OnPointerEvent((instanceId, direction, button) => {
			/* Only run callback if instance ids match. */
			if (instanceId === id) {
				callback(direction as PointerDirection, button as PointerButton);
			}
		});
	}

	/**
	 * Subscribe to hover events for a given target. `targetGameObject` MUST have an `EventTrigger` component
	 * to be eligible to receive input events. See the `ShopItem` prefab for an example.
	 *
	 * @param targetGameObject Target of hover event.
	 * @param callback Callback to run when `targetGameObject` is the subject of a hover event. Includes hover state.
	 */
	public static OnHoverEvent(
		targetGameObject: GameObject,
		callback: (hoverState: HoverState) => void,
	): EngineEventConnection {
		this.Setup(targetGameObject);
		let id = targetGameObject.GetInstanceID();
		return this.eventInterceptor!.OnHoverEvent((instanceId, hoverState) => {
			/* Only run callback if instance ids match. */
			if (instanceId === id) {
				callback(hoverState as HoverState);
			}
		});
	}

	public static OnSubmitEvent(targetGameObject: GameObject, callback: () => void): EngineEventConnection {
		this.Setup(targetGameObject);
		let id = targetGameObject.GetInstanceID();
		return this.eventInterceptor!.OnSubmitEvent((instanceId) => {
			/* Only run callback if instance ids match. */
			if (instanceId === id) {
				callback();
			}
		});
	}

	public static OnInputFieldSubmit(
		targetGameObject: GameObject,
		callback: (data: string) => void,
	): EngineEventConnection {
		this.Setup(targetGameObject);
		return this.eventInterceptor!.OnInputFieldSubmitEvent((instanceId, data) => {
			/* Only run callback if instance ids match. */
			if (instanceId === targetGameObject.GetInstanceID()) {
				callback(data);
			}
		});
	}

	public static OnSelectEvent(targetGameObject: GameObject, callback: () => void): EngineEventConnection {
		this.Setup(targetGameObject);
		let id = targetGameObject.GetInstanceID();
		return this.eventInterceptor!.OnSelectEvent((instanceId) => {
			/* Only run callback if instance ids match. */
			if (instanceId === id) {
				callback();
			}
		});
	}

	public static OnDeselectEvent(targetGameObject: GameObject, callback: () => void): EngineEventConnection {
		this.Setup(targetGameObject);
		let id = targetGameObject.GetInstanceID();
		return this.eventInterceptor!.OnDeselectEvent((instanceId) => {
			/* Only run callback if instance ids match. */
			if (instanceId === id) {
				callback();
			}
		});
	}

	public static OnBeginDragEvent(targetGameObject: GameObject, callback: () => void): EngineEventConnection {
		this.Setup(targetGameObject);
		let id = targetGameObject.GetInstanceID();
		return this.eventInterceptor!.OnBeginDragEvent((instanceId) => {
			/* Only run callback if instance ids match. */
			if (instanceId === id) {
				callback();
			}
		});
	}

	public static OnEndDragEvent(targetGameObject: GameObject, callback: () => void): EngineEventConnection {
		this.Setup(targetGameObject);
		return this.eventInterceptor!.OnEndDragEvent((instanceId) => {
			/* Only run callback if instance ids match. */
			if (instanceId === targetGameObject.GetInstanceID()) {
				callback();
			}
		});
	}

	public static OnDropEvent(targetGameObject: GameObject, callback: () => void): EngineEventConnection {
		this.Setup(targetGameObject);
		return this.eventInterceptor!.OnDropEvent((instanceId) => {
			/* Only run callback if instance ids match. */
			if (instanceId === targetGameObject.GetInstanceID()) {
				callback();
			}
		});
	}

	public static OnDragEvent(targetGameObject: GameObject, callback: () => void): EngineEventConnection {
		this.Setup(targetGameObject);
		return this.eventInterceptor!.OnDragEvent((instanceId) => {
			/* Only run callback if instance ids match. */
			if (instanceId === targetGameObject.GetInstanceID()) {
				callback();
			}
		});
	}

	public static OnClickEvent(targetGameObject: GameObject, callback: () => void): EngineEventConnection {
		this.Setup(targetGameObject);
		const id = targetGameObject.GetInstanceID();
		return this.eventInterceptor!.OnClickEvent((instanceId) => {
			/* Only run callback if instance ids match. */
			if (instanceId === id) {
				callback();
			}
		});
	}

	/**
	 * This works on Toggles, Sliders, and TMP_InputField
	 *
	 * For TMP_InputField, the value will always be `0`.
	 * @param targetGameObject
	 * @param callback
	 * @returns
	 */
	public static OnValueChangeEvent(
		targetGameObject: GameObject,
		callback: (value: number) => void,
	): EngineEventConnection {
		this.Setup(targetGameObject);
		return this.eventInterceptor!.OnValueChangeEvent((instanceId, value) => {
			if (instanceId === targetGameObject.GetInstanceID()) {
				callback(value);
			}
		});
	}

	public static OnToggleValueChangeEvent(
		targetGameObject: GameObject,
		callback: (value: boolean) => void,
	): EngineEventConnection {
		this.Setup(targetGameObject);
		return this.eventInterceptor!.OnToggleValueChangeEvent((instanceId, value) => {
			if (instanceId === targetGameObject.GetInstanceID()) {
				callback(value);
			}
		});
	}

	public static GetSelectedInstanceId(): number | undefined {
		return this.selectedInstanceId;
	}

	public static Register(targetGameObject: GameObject) {
		this.Setup(targetGameObject);
	}

	/** Fetches and sets the global event interceptor. */
	private static Setup(gameObject: GameObject): void {
		if (CanvasAPI.eventInterceptor === undefined) {
			this.eventInterceptor =
				GameObject.Find("CanvasUIEventsInterceptor").GetComponent<CanvasUIEventInterceptor>();

			this.eventInterceptor.OnSelectEvent((instanceId) => {
				this.selectedInstanceId = instanceId;
			});

			this.eventInterceptor.OnDeselectEvent((instanceId) => {
				if (this.selectedInstanceId !== instanceId) return;
				this.selectedInstanceId = undefined;
			});
		}
		this.RegisterEvents(gameObject);
	}
}
