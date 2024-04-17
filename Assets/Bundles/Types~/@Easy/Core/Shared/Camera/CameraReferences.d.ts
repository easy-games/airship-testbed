/// <reference types="compiler-types" />
export declare class CameraReferences {
    private static instances;
    static Instance(): CameraReferences;
    private mouse;
    readonly cameraHolder?: Transform;
    readonly mainCamera?: Camera;
    readonly fpsCamera?: Camera;
    readonly uiCamera?: Camera;
    private exists;
    constructor();
    DoesCameraRigExist(): boolean;
    /**
     *
     * @param distance
     * @returns Will return undefined if a Voxel World doesn't exist.
     */
    RaycastVoxelFromCamera(distance: number): VoxelRaycastResult | undefined;
    RaycastPhysicsFromCamera(distance: number, layerMask?: number): LuaTuple<[hit: true, point: Vector3, normal: Vector3, collider: Collider] | [hit: false, point: undefined, normal: undefined, collider: undefined]>;
    GetRayFromCamera(distance: number): Ray;
}
