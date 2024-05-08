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
    private static selectedInstanceId?;
    static Init(): void;
    static RegisterEvents(gameObject: GameObject): void;
    static IsPointerOverUI(): boolean;
    static IsPointerOverTarget(target: GameObject): boolean;
    static OnScreenSizeEvent(callback: (width: number, height: number) => void): number;
    /**
     * Subscribe to pointer events for a given target. `targetGameObject` MUST have an `EventTrigger` component
     * to be eligible to receive input events. See the `ShopItem` prefab for an example.
     *
     * @param targetGameObject Target of pointer event.
     * @param callback Callback to run when `targetGameObject` is the subject of a pointer event. Includes direction and button.
     */
    static OnPointerEvent(targetGameObject: GameObject, callback: (direction: PointerDirection, button: PointerButton) => void): EngineEventConnection;
    /**
     * Subscribe to hover events for a given target. `targetGameObject` MUST have an `EventTrigger` component
     * to be eligible to receive input events. See the `ShopItem` prefab for an example.
     *
     * @param targetGameObject Target of hover event.
     * @param callback Callback to run when `targetGameObject` is the subject of a hover event. Includes hover state.
     */
    static OnHoverEvent(targetGameObject: GameObject, callback: (hoverState: HoverState) => void): EngineEventConnection;
    static OnSubmitEvent(targetGameObject: GameObject, callback: () => void): EngineEventConnection;
    static OnInputFieldSubmit(targetGameObject: GameObject, callback: (data: string) => void): EngineEventConnection;
    static OnSelectEvent(targetGameObject: GameObject, callback: () => void): EngineEventConnection;
    static OnDeselectEvent(targetGameObject: GameObject, callback: () => void): EngineEventConnection;
    static OnBeginDragEvent(targetGameObject: GameObject, callback: (data: PointerEventData) => void): EngineEventConnection;
    static OnEndDragEvent(targetGameObject: GameObject, callback: (data: PointerEventData) => void): EngineEventConnection;
    static OnDropEvent(targetGameObject: GameObject, callback: () => void): EngineEventConnection;
    static OnDragEvent(targetGameObject: GameObject, callback: (data: PointerEventData) => void): EngineEventConnection;
    static OnClickEvent(targetGameObject: GameObject, callback: () => void): EngineEventConnection;
    /**
     * This works on Toggles, Sliders, and TMP_InputField
     *
     * For TMP_InputField, the value will always be `0`.
     * @param targetGameObject
     * @param callback
     * @returns
     */
    static OnValueChangeEvent(targetGameObject: GameObject, callback: (value: number) => void): EngineEventConnection;
    static OnToggleValueChangeEvent(targetGameObject: GameObject, callback: (value: boolean) => void): EngineEventConnection;
    static GetSelectedInstanceId(): number | undefined;
    static Register(targetGameObject: GameObject): void;
    /** Fetches and sets the global event interceptor. */
    private static Setup;
    private static CheckForInterceptor;
}
