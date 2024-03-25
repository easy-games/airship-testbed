/// <reference types="compiler-types" />
export declare enum AvatarRenderSlot {
    BODY = 0,
    FACE = 1,
    HAIR = 2,
    HEAD = 3,
    TORSO = 4,
    BACK = 5,
    HANDS = 6,
    LEGS = 7,
    FEET = 8
}
export default class AvatarRenderComponent extends AirshipBehaviour {
    private readonly itemRenderSize;
    private readonly profileRenderSize;
    private renderTexture?;
    private backdrops;
    builder: AccessoryBuilder;
    backdropHolder: GameObject;
    captureCamera: Camera;
    cameraTransforms: Transform[];
    cameraDistanceBase: number;
    cameraDistanceMod: number;
    uploadThumbnails: boolean;
    Start(): void;
    Init(): void;
    RenderCharacter(): void;
    private Render;
    private AlignCamera;
    private SetCameraAccessory;
    private SetCameraTransform;
}
