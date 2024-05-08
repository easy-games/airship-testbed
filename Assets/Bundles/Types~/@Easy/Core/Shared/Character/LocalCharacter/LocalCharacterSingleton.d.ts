import { OnStart } from "../../Flamework";
import { Signal } from "../../Util/Signal";
import { CharacterInput } from "./CharacterInput";
import { LocalCharacterInputSignal } from "./LocalCharacterInputSignal";
export declare class LocalCharacterSingleton implements OnStart {
    readonly stateChanged: Signal<[newState: CharacterState]>;
    private customDataQueue;
    private entityDriver;
    private screenshot;
    input: CharacterInput | undefined;
    private prevState;
    private currentState;
    private firstSpawn;
    private sprintOverlayEmission?;
    private moveDirWorldSpace;
    readonly onCustomMoveDataProcessed: Signal<void>;
    /**
     * This can be used to change input before it's processed by the entity system.
     */
    readonly onBeforeLocalEntityInput: Signal<LocalCharacterInputSignal>;
    /** Add custom data to the move data command stream. */
    AddToMoveData(key: string, value: unknown, 
    /**
     * Fired when the move data has been processed during the tick loop.
     * This will be fired **before** movement is calculated.
     **/
    onProcessedCallback?: () => void): void;
    private TakeScreenshot;
    OnStart(): void;
    GetCharacterInput(): CharacterInput | undefined;
    /**
     * When set to true, the move input will always make "W" point north, "A" west, etc.
     *
     * The default value is false.
     * @param worldSpace True if should use world space. False if should use local space.
     */
    SetMoveDirWorldSpace(worldSpace: boolean): void;
    IsMoveDirWorldSpace(): boolean;
}
