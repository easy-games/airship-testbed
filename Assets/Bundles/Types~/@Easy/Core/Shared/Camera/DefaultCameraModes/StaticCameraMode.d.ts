import { CameraMode } from "../CameraMode";
import { CameraTransform } from "../CameraTransform";
export declare class StaticCameraMode extends CameraMode {
    private transform;
    constructor(position: Vector3, rotation: Quaternion);
    OnStart(camera: Camera, rootTransform: Transform): void;
    OnStop(): void;
    OnUpdate(dt: number): void;
    OnPostUpdate(): void;
    OnLateUpdate(): CameraTransform;
}
