import Character from "../Character/Character";
import { CameraReferences } from "./CameraReferences";
export declare class FirstPersonCameraSystem {
    readonly character: Character;
    private bobLerpMod;
    cameras: CameraReferences;
    private sprintingBob;
    private walkingBob;
    private slidingBob;
    private targetBobData;
    private currentBobData;
    private targetBobStrength;
    private currentBobStrength;
    /** If true the viewmodel will be positioned so the camera is located where the head is */
    private positionViewmodelCameraUnderHead;
    /** Positions viewmodel at some static offset from the camera.
     * Only applies if `positionViewmodelCameraUnderHead` is false. */
    private cameraSpineOffset;
    /** Rotates viewmodel at some static offset from the camera.
     * Only applies if `positionViewmodelCameraUnderHead` is false. */
    private cameraSpineRotOffset;
    private inFirstPerson;
    private bin;
    private currentTime;
    private viewmodelController;
    private defaultSpineRotation;
    constructor(character: Character, startInFirstPerson: boolean);
    Destroy(): void;
    private LateUpdate;
    OnMovementStateChange(state: CharacterState): void;
    OnFirstPersonChanged(isFirstPerson: boolean): void;
}
