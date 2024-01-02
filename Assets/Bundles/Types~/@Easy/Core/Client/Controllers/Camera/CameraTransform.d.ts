/// <reference types="@easy-games/types" />
/// <reference types="@easy-games/types" />
/**
 * Unique class for holding the position and rotation of the camera. Used by `CameraMode` classes.
 */
export declare class CameraTransform {
    static readonly Identity: CameraTransform;
    /** The position of the camera in 3D world space. */
    readonly Position: Vector3;
    /** The rotation of the camera in 3D world space. */
    readonly Rotation: Quaternion;
    static FromTransform(transform: Transform): CameraTransform;
    constructor(position?: Vector3, rotation?: Quaternion);
    Lerp(other: CameraTransform, alpha: number): CameraTransform;
}
