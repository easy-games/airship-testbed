import { CameraMode } from "../CameraMode";
import { CameraTransform } from "../CameraTransform";
export declare class OrbitCameraMode implements CameraMode {
    private transform;
    private readonly distance;
    private readonly bin;
    private occlusionCam;
    private rotationX;
    private rotationY;
    private lockView;
    private rightClicking;
    private rightClickPos;
    private camRight;
    private lastAttachToPos;
    private lastCamPos;
    private readonly preferred;
    private readonly keyboard;
    private readonly touchscreen;
    private readonly mouse;
    constructor(transform: Transform, distance: number);
    private SetupMobileControls;
    SetTransform(transform: Transform): void;
    OnStart(camera: Camera): void;
    OnStop(): void;
    OnUpdate(dt: number): void;
    OnLateUpdate(dt: number): CameraTransform;
    OnPostUpdate(camera: Camera): void;
}
