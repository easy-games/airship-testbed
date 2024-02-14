import { OnStart } from "../../Flamework";
import { DataStreamItems } from "../../Util/DataStreamTypes";
import { Signal } from "../../Util/Signal";
import { HumanoidCameraMode } from "../../../Client/Controllers/Camera/DefaultCameraModes/HumanoidCameraMode";
import { CharacterCameraMode } from "./CharacterCameraMode";
import { EntityInput } from "./EntityInput";
import { LocalCharacterInputSignal } from "./LocalCharacterInputSignal";
export declare class LocalCharacterSingleton implements OnStart {
    private firstPerson;
    private lookBackwards;
    private fps?;
    /** Fires whenever the user changes their first-person state. */
    readonly firstPersonChanged: Signal<[isFirstPerson: boolean]>;
    /** Fires whenever the user requests to look (or stop looking) backwards. */
    readonly lookBackwardsChanged: Signal<[lookBackwards: boolean]>;
    private customDataQueue;
    private entityDriver;
    private screenshot;
    entityInput: EntityInput | undefined;
    private prevState;
    private currentState;
    humanoidCameraMode: HumanoidCameraMode | undefined;
    private orbitCameraMode;
    private characterCameraMode;
    private firstSpawn;
    private sprintOverlayEmission?;
    private moveDirWorldSpace;
    readonly onCustomMoveDataProcessed: Signal<void>;
    /**
     * This can be used to change input before it's processed by the entity system.
     */
    readonly onBeforeLocalEntityInput: Signal<LocalCharacterInputSignal>;
    /** Returns `true` if the player is in first-person mode. */
    IsFirstPerson(): boolean;
    /** Observes the current first-person state. */
    ObserveFirstPerson(observer: (isFirstPerson: boolean) => CleanupFunc): () => void;
    /** Observes whether or not the player wants to look backwards. */
    ObserveLookBackwards(observer: (lookBackwards: boolean) => CleanupFunc): () => void;
    /** Add custom data to the move data command stream. */
    AddToMoveData<K extends keyof DataStreamItems, T extends DataStreamItems[K]>(key: K, value: T, 
    /**
     * Fired when the move data has been processed during the tick loop.
     * This will be fired **before** movement is calculated.
     **/
    onProcessedCallback?: () => void): void;
    private TakeScreenshot;
    private GetCamYOffset;
    private CreateHumanoidCameraMode;
    private CreateOrbitCameraMode;
    OnStart(): void;
    SetCharacterCameraMode(mode: CharacterCameraMode): void;
    UpdateFov(): void;
    private SetLookBackwards;
    ToggleFirstPerson(): void;
    /**
     * Changes the preferred perspective for the local character.
     *
     * This will only work if using {@link CharacterCameraMode.Locked}. You can set this with {@link SetCharacterCameraMode()}
     */
    SetFirstPerson(value: boolean): void;
    GetEntityInput(): EntityInput | undefined;
    /**
     * When set to true, the move input will always make "W" point north, "A" west, etc.
     *
     * The default value is false.
     * @param worldSpace True if should use world space. False if should use local space.
     */
    SetMoveDirWorldSpace(worldSpace: boolean): void;
    IsMoveDirWorldSpace(): boolean;
}
