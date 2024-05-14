/// <reference types="compiler-types" />
export interface StatusModifierEntry {
}
/**
 * A status modifier holds a list of modifiers for some properties. It takes a reducer
 * function that runs whenever this list changes (this is where you can calculate & apply changes).
 *
 * Ex: In a movement status modifier you might have a property blockSprint and in your reducer if any
 * modifier has blockSprint=true you would call SetSprintBlocked. This way you could have multiple sources
 * blocking sprint without overwriting eachother.
 */
export declare class StatusModifier<T extends StatusModifierEntry> {
    private reduce;
    private modifiers;
    constructor(reduce: (modifiers: T[], statusModifier: StatusModifier<T>) => void);
    /**
     * Adds a modifier (this will run the reducer).
     *
     * @returns A Destroy function to remove the modifier. This can be passed to a Bin.
     */
    AddModifier(modifier: T): {
        Destroy: () => boolean;
    };
    /**
     * Removes a modfier. If it existed (and was removed) this will run the reducer. Returns true
     * if the modifier was removed.
     */
    RemoveModifier(modifier: T): boolean;
    /** Can be used to manually rerun modifiers. Usually this will run when a modifier is added or removed. */
    UpdateModifiers(): void;
    /**
     * Returns all active modifiers.
     */
    GetModifiers(): Set<T>;
    /**
     * Clears all modifiers (this will run the reducer).
     */
    Clear(): void;
    /**
     * Overwrites the existing reducer and immediately runs the new reducer.
     */
    SetReducer(reduce: (modifiers: T[], statusModifier: StatusModifier<T>) => void): void;
}
