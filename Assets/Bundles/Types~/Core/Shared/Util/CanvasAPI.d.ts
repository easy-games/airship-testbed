/** Pointer button. */
export declare enum PointerButton {
    LEFT = 0,
    RIGHT = 1,
    MIDDLE = 2
}
/** Pointer direction. */
export declare enum PointerDirection {
    DOWN = 0,
    UP = 1
}
/** Hover state. */
export declare enum HoverState {
    ENTER = 0,
    EXIT = 1
}
export declare class CanvasAPI {
    /** Global event interceptor. */
    private static eventInterceptor;
    private static canvasUIEvents;
    private static canvasHitDetector;
    static Init(): void;
    static RegisterEvents(gameObject: GameObject): void;
    static IsPointerOverUI(): boolean;
    /**
     * Subscribe to pointer events for a given target. `targetGameObject` MUST have an `EventTrigger` component
     * to be eligible to receive input events. See the `ShopItem` prefab for an example.
     *
     * @param targetGameObject Target of pointer event.
     * @param callback Callback to run when `targetGameObject` is the subject of a pointer event. Includes direction and button.
     */
    static OnPointerEvent(targetGameObject: GameObject, callback: (direction: PointerDirection, button: PointerButton) => void): void;
    /**
     * Subscribe to hover events for a given target. `targetGameObject` MUST have an `EventTrigger` component
     * to be eligible to receive input events. See the `ShopItem` prefab for an example.
     *
     * @param targetGameObject Target of hover event.
     * @param callback Callback to run when `targetGameObject` is the subject of a hover event. Includes hover state.
     */
    static OnHoverEvent(targetGameObject: GameObject, callback: (hoverState: HoverState) => void): void;
    static OnSubmitEvent(targetGameObject: GameObject, callback: () => void): void;
    static OnSelectEvent(targetGameObject: GameObject, callback: () => void): void;
    static OnDeselectEvent(targetGameObject: GameObject, callback: () => void): void;
    static OnClickEvent(targetGameObject: GameObject, callback: () => void): void;
    static OnValueChangeEvent(targetGameObject: GameObject, callback: (value: number) => void): void;
    /** Fetches and sets the global event interceptor. */
    private static Setup;
}
