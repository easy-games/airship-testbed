import Character from "../../../Shared/Character/Character";
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
    private headSpineOffset;
    private inFirstPerson;
    private bin;
    private currentTime;
    private viewmodelController;
    constructor(character: Character, startInFirstPerson: boolean);
    Destroy(): void;
    private LateUpdate;
    OnMovementStateChange(state: CharacterState): void;
    OnFirstPersonChanged(isFirstPerson: boolean): void;
}
