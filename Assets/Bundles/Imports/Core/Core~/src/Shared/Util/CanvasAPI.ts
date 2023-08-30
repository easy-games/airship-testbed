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

	public static Init(): void {
		this.canvasUIEvents = GameObject.Find("CanvasUIEvents").GetComponent<CanvasUIEvents>();
		this.canvasHitDetector = this.canvasUIEvents.gameObject.GetComponent<CanvasHitDetector>();
	}

	public static RegisterEvents(gameObject: GameObject): void {
		this.canvasUIEvents.RegisterEvents(gameObject);
	}

	public static IsPointerOverUI() {
		return this.canvasHitDetector.IsPointerOverUI();
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
	): void {
		this.Setup(targetGameObject);
		this.eventInterceptor!.OnPointerEvent((instanceId, direction, button) => {
			/* Only run callback if instance ids match. */
			if (instanceId === targetGameObject.GetInstanceID()) {
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
	public static OnHoverEvent(targetGameObject: GameObject, callback: (hoverState: HoverState) => void): void {
		this.Setup(targetGameObject);
		this.eventInterceptor!.OnHoverEvent((instanceId, hoverState) => {
			/* Only run callback if instance ids match. */
			if (instanceId === targetGameObject.GetInstanceID()) {
				callback(hoverState as HoverState);
			}
		});
	}

	public static OnSubmitEvent(targetGameObject: GameObject, callback: () => void): void {
		this.Setup(targetGameObject);
		this.eventInterceptor!.OnSubmitEvent((instanceId) => {
			/* Only run callback if instance ids match. */
			if (instanceId === targetGameObject.GetInstanceID()) {
				callback();
			}
		});
	}

	public static OnInputFieldSubmit(targetGameObject: GameObject, callback: (data: string) => void): void {
		this.Setup(targetGameObject);
		this.eventInterceptor!.OnInputFieldSubmitEvent((instanceId, data) => {
			/* Only run callback if instance ids match. */
			if (instanceId === targetGameObject.GetInstanceID()) {
				callback(data);
			}
		});
	}

	public static OnSelectEvent(targetGameObject: GameObject, callback: () => void): void {
		this.Setup(targetGameObject);
		this.eventInterceptor!.OnSelectEvent((instanceId) => {
			/* Only run callback if instance ids match. */
			if (instanceId === targetGameObject.GetInstanceID()) {
				callback();
			}
		});
	}

	public static OnDeselectEvent(targetGameObject: GameObject, callback: () => void): void {
		this.Setup(targetGameObject);
		this.eventInterceptor!.OnDeselectEvent((instanceId) => {
			/* Only run callback if instance ids match. */
			if (instanceId === targetGameObject.GetInstanceID()) {
				callback();
			}
		});
	}

	public static OnClickEvent(targetGameObject: GameObject, callback: () => void): void {
		this.Setup(targetGameObject);
		this.eventInterceptor!.OnClickEvent((instanceId) => {
			/* Only run callback if instance ids match. */
			if (instanceId === targetGameObject.GetInstanceID()) {
				callback();
			}
		});
	}

	public static OnValueChangeEvent(targetGameObject: GameObject, callback: (value: number) => void): void {
		this.Setup(targetGameObject);
		this.eventInterceptor!.OnValueChangeEvent((instanceId, value) => {
			if (instanceId === targetGameObject.GetInstanceID()) {
				callback(value);
			}
		});
	}

	/** Fetches and sets the global event interceptor. */
	private static Setup(gameObject: GameObject): void {
		if (CanvasAPI.eventInterceptor === undefined) {
			this.eventInterceptor =
				GameObject.Find("CanvasUIEventsInterceptor").GetComponent<CanvasUIEventInterceptor>();
		}
		this.RegisterEvents(gameObject);
	}
}
