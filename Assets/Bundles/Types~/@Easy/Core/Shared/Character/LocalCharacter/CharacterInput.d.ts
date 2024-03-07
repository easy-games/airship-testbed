import Character from "../Character";
export declare class CharacterInput {
    private readonly character;
    private readonly bin;
    private readonly movement;
    private disablers;
    private disablerCounter;
    private enabled;
    private autoSprinting;
    private queuedMoveDirection;
    constructor(character: Character);
    /**
     * Sets whether or not the Humanoid Driver is enabled. If disabled, then the
     * character will not move from user input.
     * @param enabled Enabled state.
     */
    SetEnabled(enabled: boolean): void;
    SetQueuedMoveDirection(dir: Vector3): void;
    /** Returns `true` if the Humanoid Driver is enabled. */
    IsEnabled(): boolean;
    IsSprinting(): boolean;
    AddDisabler(): () => void;
    private InitControls;
    Destroy(): void;
}
