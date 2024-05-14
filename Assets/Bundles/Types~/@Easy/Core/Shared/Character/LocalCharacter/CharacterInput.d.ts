import Character from "../Character";
export declare class CharacterInput {
    private readonly character;
    private readonly bin;
    private readonly movement;
    private disablers;
    private disablerCounter;
    private enabled;
    private autoSprinting;
    /** If true holding the sprint key will not result in sprinting */
    private blockSprint;
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
    /**
     * Set wether sprint is blocked. When true the player's sprint key won't result in sprint state.
     */
    SetSprintBlocked(blocked: boolean): void;
    /** Returns true if player's sprint is currently blocked. */
    IsSprintBlocked(): boolean;
}
