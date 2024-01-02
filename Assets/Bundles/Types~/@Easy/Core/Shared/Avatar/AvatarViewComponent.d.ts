/// <reference types="@easy-games/compiler-types" />
export default class AvatarViewComponent extends AirshipBehaviour {
    HumanEntityGo?: GameObject;
    AvatarHolder?: Transform;
    CameraTransform?: Transform;
    CameraWaypointDefault?: Transform;
    CameraWaypointHead?: Transform;
    CameraWaypointFeet?: Transform;
    CameraWaypointHands?: Transform;
    CameraWaypointBack?: Transform;
    DragSpeedMod: number;
    CameraTransitionDuration: number;
    Dragging: boolean;
    AccessoryBuilder?: AccessoryBuilder;
    private targetTransform?;
    private mouse?;
    private lastMousePos;
    OnStart(): void;
    ShowAvatar(): void;
    HideAvatar(): void;
    FocusSlot(slotType: AccessorySlot): void;
}
