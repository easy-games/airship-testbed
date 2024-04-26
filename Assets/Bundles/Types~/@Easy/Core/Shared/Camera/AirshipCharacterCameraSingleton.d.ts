import { OnStart } from "../Flamework";
import { CameraMode } from ".";
import { CharacterCameraMode } from "../Character/LocalCharacter/CharacterCameraMode";
import { Signal } from "../Util/Signal";
import { CameraSystem } from "./CameraSystem";
import { CharacterCameraType } from "./CharacterCameraType";
import { HumanoidCameraMode } from "./DefaultCameraModes/HumanoidCameraMode";
interface ViewModelUpdate {
    /** Target position of the view model. Update to change. */
    position: Vector3;
    /** Target rotation of the view model. Update to change. */
    rotation: Quaternion;
}
export declare class AirshipCharacterCameraSingleton implements OnStart {
    static readonly cameraReferenceKey = "CameraRig";
    canToggleFirstPerson: boolean;
    private lookBackwards;
    /** Fires whenever the user requests to look (or stop looking) backwards. */
    readonly lookBackwardsChanged: Signal<[lookBackwards: boolean]>;
    /** The underlying camera system for the game. */
    readonly cameraSystem?: CameraSystem;
    /** Current state of local character (relevant to the camera system). */
    private characterState;
    private sprintFovMultiplier;
    private firstPerson;
    /** Fires whenever the user changes their first-person state. */
    readonly firstPersonChanged: Signal<[isFirstPerson: boolean]>;
    /** Fires before view model updates with position and rotation. Change these values to adjust view model position. */
    onViewModelUpdate: Signal<[data: ViewModelUpdate]>;
    private fps?;
    humanoidCameraMode: HumanoidCameraMode | undefined;
    private orbitCameraMode;
    private characterCameraMode;
    constructor();
    OnStart(): void;
    /**
     * Sets whether or not the camera system is enabled. Disable the
     * camera system if custom camera code is being used.
     */
    SetEnabled(enabled: boolean): void;
    /**
     * Returns `true` if the camera system is enabled.
     */
    IsEnabled(): boolean | undefined;
    /**
     * Set the current camera mode.
     *
     * @param mode New mode.
     */
    SetMode(mode: CameraMode): void;
    /**
     * Sets the camera to a static view.
     */
    ClearMode(): void;
    /**
     * Set the camera's field-of-view.
     * @param fieldOfView Field of view.
     * @param smooth If `true` the FOV will transition smoothly to the target.
     */
    SetFOV(targetCamera: CharacterCameraType, fieldOfView: number, smooth?: boolean): void;
    /**
     * Returns the camera's field-of-view.
     */
    GetFOV(targetCamera: CharacterCameraType): number;
    /** Updates FOV to reflect the current character state object */
    private MakeFOVReflectCharacterState;
    /**
     * Sets multiplier on base FOV when sprinting. For example if FOV is 80 and multipler is 1.1 the player FOV
     * while sprinting will be 88.
     *
     * @param multipler Sprint FOV multiplier, set to 1 to disable sprint FOV. Defaults to 1.08
     */
    SetSprintFOVMultiplier(multipler: number): void;
    /** Returns `true` if the player is in first-person mode. */
    IsFirstPerson(): boolean;
    /** Observes the current first-person state. */
    ObserveFirstPerson(observer: (isFirstPerson: boolean) => CleanupFunc): () => void;
    private CreateHumanoidCameraMode;
    private CreateOrbitCameraMode;
    SetCharacterCameraMode(mode: CharacterCameraMode): void;
    private SetLookBackwards;
    ToggleFirstPerson(): void;
    /**
     * Changes the preferred perspective for the local character.
     *
     * This will only work if using {@link CharacterCameraMode.Locked}. You can set this with {@link SetCharacterCameraMode()}
     */
    SetFirstPerson(value: boolean): void;
    /** Observes whether or not the player wants to look backwards. */
    ObserveLookBackwards(observer: (lookBackwards: boolean) => CleanupFunc): () => void;
}
export {};
