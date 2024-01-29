/// <reference types="@easy-games/compiler-types" />
export default class AvatarViewComponent extends AirshipBehaviour {
    humanEntityGo?: GameObject;
    avatarHolder?: Transform;
    cameraTransform?: Transform;
    cameraWaypointDefault?: Transform;
    cameraWaypointHead?: Transform;
    cameraWaypointFeet?: Transform;
    cameraWaypointHands?: Transform;
    cameraWaypointBack?: Transform;
    cameraWaypointCenterHero?: Transform;
    cameraWaypointBirdsEye?: Transform;
    dragSpeedMod: number;
    cameraTransitionDuration: number;
    dragging: boolean;
    accessoryBuilder?: AccessoryBuilder;
    private targetTransform?;
    private mouse?;
    private lastMousePos;
    Start(): void;
    ShowAvatar(): void;
    HideAvatar(): void;
    ResetAvatar(): void;
    CameraFocusSlot(slotType: AccessorySlot): void;
    CameraFocusTransform(transform?: Transform, instant?: boolean): void;
}
