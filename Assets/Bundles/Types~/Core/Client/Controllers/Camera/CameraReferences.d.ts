/// <reference types="@easy-games/types" />
/// <reference types="@easy-games/types" />
/// <reference types="@easy-games/compiler-types" />
export declare class CameraReferences {
    private static _instance;
    static Instance(): CameraReferences;
    private mouse;
    readonly mainCamera: Camera;
    readonly fpsCamera: Camera;
    readonly uiCamera: Camera;
    constructor();
    RaycastVoxelFromCamera(distance: number): VoxelRaycastResult;
    RaycastPhysicsFromCamera(distance: number, layerMask?: number): LuaTuple<[hit: true, point: Vector3, normal: Vector3, collider: Collider] | [hit: false, point: undefined, normal: undefined, collider: undefined]>;
    GetRayFromCamera(distance: number): Ray;
}
