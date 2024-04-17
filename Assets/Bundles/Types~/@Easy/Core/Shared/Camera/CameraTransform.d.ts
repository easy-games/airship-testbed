/**
 * Unique class for holding the position and rotation of the camera. Used by `CameraMode` classes.
 */
export declare class CameraTransform {
    static readonly identity: CameraTransform;
    /** The position of the camera in 3D world space. */
    readonly position: Vector3;
    /** The rotation of the camera in 3D world space. */
    readonly rotation: Quaternion;
    static FromTransform(transform: Transform): CameraTransform;
    constructor(position?: Vector3, rotation?: Quaternion);
    Lerp(other: CameraTransform, alpha: number): CameraTransform;
}
