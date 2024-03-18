import { CameraMode } from "../CameraMode";
import { CameraTransform } from "../CameraTransform";
export declare class OrbitCameraMode extends CameraMode {
    private readonly distance;
    private transform;
    private readonly bin;
    private occlusionCam;
    private lockView;
    private rightClicking;
    private rightClickPos;
    private lookVector;
    private lastAttachToPos;
    private readonly entityDriver?;
    private readonly preferred;
    private readonly keyboard;
    private readonly touchscreen;
    private readonly mouse;
    private readonly clientSettingsController;
    constructor(distance: number, transform: Transform, graphicalCharacter?: Transform);
    private SetupMobileControls;
    SetTransform(transform: Transform): void;
    OnStart(camera: Camera, rootTransform: Transform): void;
    OnStop(): void;
    OnUpdate(dt: number): void;
    OnLateUpdate(dt: number): CameraTransform;
    OnPostUpdate(camera: Camera): void;
}
