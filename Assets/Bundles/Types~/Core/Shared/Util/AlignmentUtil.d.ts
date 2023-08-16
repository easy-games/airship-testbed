/// <reference types="@easy-games/types" />
/// <reference types="@easy-games/types" />
export declare class AlignmentUtil {
    private static up;
    private static down;
    private static right;
    private static left;
    private static forward;
    private static back;
    static GetWorldRotationForLookingAt(sourceTransform: Transform, forward: KnownVectorType, up: KnownVectorType, worldForward: Vector3, worldUp: Vector3): Quaternion;
    static GetWorldVectorFromVectorType(sourceTransform: Transform, knownVectorType: KnownVectorType): Vector3;
}
