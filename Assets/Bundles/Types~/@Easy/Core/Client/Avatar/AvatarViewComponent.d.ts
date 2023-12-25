/// <reference types="@easy-games/types" />
/// <reference types="@easy-games/types" />
/// <reference types="@easy-games/compiler-types" />
export default class AvatarViewComponent extends AirshipBehaviour {
    humanEntityGo?: GameObject;
    avatarDragBtn?: GameObject;
    cameraWaypointDefault?: Transform;
    cameraWaypointHead?: Transform;
    cameraWaypointFeet?: Transform;
    dragSpeedMod: number;
    cameraLerpMod: number;
    accessoryBuilder?: AccessoryBuilder;
    private targetTransform?;
    OnStart(): void;
    OnUpdate(dt: number): void;
    ShowAvatar(): void;
    HideAvatar(): void;
    FocusSlot(slotType: AccessorySlot): void;
    DragView(mouseDelta: Vector2): void;
}
