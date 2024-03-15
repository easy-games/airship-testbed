import Character from "../../Character/Character";
import { CameraMode, CameraTransform } from "..";
export declare class HumanoidCameraMode extends CameraMode {
    private character;
    private graphicalCharacterGO;
    private readonly bin;
    private lookVector;
    private readonly movement;
    private occlusionCam;
    private lookBackwards;
    private readonly attachTo;
    private lockView;
    private firstPerson;
    private rightClicking;
    private rightClickPos;
    private camRight;
    private lastAttachToPos;
    private yOffset;
    private yOffsetSpring;
    private readonly preferred;
    private readonly keyboard;
    private readonly touchscreen;
    private readonly mouse;
    private readonly clientSettingsController;
    private spineBone;
    constructor(character: Character, graphicalCharacterGO: GameObject, initialFirstPerson: boolean);
    private SetupMobileControls;
    OnStart(camera: Camera, rootTransform: Transform): void;
    OnStop(): void;
    OnUpdate(dt: number): void;
    OnLateUpdate(dt: number): CameraTransform;
    OnPostUpdate(camera: Camera): void;
    SetFirstPerson(firstPerson: boolean): void;
    private SetYOffset;
    SetLookBackwards(lookBackwards: boolean): void;
    /**
     * Explicitly set the direction of the camera on the Y-axis based on the given directional vector.
     */
    SetDirection(direction: Vector3): void;
    private GetCamYOffset;
}
