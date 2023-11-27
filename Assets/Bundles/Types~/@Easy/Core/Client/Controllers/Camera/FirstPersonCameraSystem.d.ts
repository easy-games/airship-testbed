import { EntityReferences } from "../../../Shared/Entity/Entity";
import { CameraReferences } from "./CameraReferences";
export declare class FirstPersonCameraSystem {
    cameras: CameraReferences;
    private sprintingBob;
    private slidingBob;
    private bobData;
    private manualSpineOffset;
    private calculatedSpineOffset;
    private entityReferences;
    private cameraVars;
    private trackedHeadRotation;
    private inFirstPerson;
    private bin;
    private originalSpineMiddlePosition;
    private originalSpineTopPosition;
    private originalShoulderLPosition;
    private originalShoulderRPosition;
    private bobStrength;
    constructor(entityReferences: EntityReferences, startInFirstPerson: boolean);
    Destroy(): void;
    private LateUpdate;
    OnMovementStateChange(state: EntityState): void;
    OnFirstPersonChanged(isFirstPerson: boolean): void;
}
