/// <reference types="@easy-games/compiler-types" />
export default class AvatarViewComponent extends AirshipBehaviour {
    humanEntityGo?: GameObject;
    avatarHolder?: Transform;
    cameraRigTransform?: Transform;
    avatarCamera?: Camera;
    testTransform?: Transform;
    cameraWaypointDefault?: Transform;
    cameraWaypointHead?: Transform;
    cameraWaypointFeet?: Transform;
    cameraWaypointHands?: Transform;
    cameraWaypointBack?: Transform;
    cameraWaypointCenterHero?: Transform;
    cameraWaypointBirdsEye?: Transform;
    dragSpeedMod: number;
    cameraTransitionDuration: number;
    screenspaceDistance: number;
    dragging: boolean;
    accessoryBuilder?: AccessoryBuilder;
    anim?: CharacterAnimationHelper;
    private targetTransform?;
    private mouse?;
    private lastMousePos;
    private initialized;
    Start(): void;
    ShowAvatar(): void;
    HideAvatar(): void;
    ResetAvatar(): void;
    AlignCamera(screenPos: Vector3): void;
    CameraFocusSlot(slotType: AccessorySlot): void;
    CameraFocusTransform(transform?: Transform, instant?: boolean): void;
}
