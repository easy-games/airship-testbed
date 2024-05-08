import { CameraMode } from "../CameraMode";
import { CameraTransform } from "../CameraTransform";
export declare class FlyCameraMode extends CameraMode {
    private bin;
    private positionSpring;
    private xRotSpring;
    private yRotVelSpring;
    private fovSpring;
    private camera;
    private originalFov;
    private currentFov;
    private keyboard;
    private mouse;
    private readonly keysDown;
    OnStart(camera: Camera, rootTransform: Transform): void;
    OnStop(): void;
    OnUpdate(dt: number): void;
    OnPostUpdate(): void;
    OnLateUpdate(dt: number): CameraTransform;
    private CalculateDirection;
}
