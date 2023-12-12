/// <reference types="@easy-games/compiler-types" />
export declare class Modifier<T extends defined> {
    /** Set of active tickets */
    private tickets;
    /** List of callbacks observing changes to this modifier */
    private ticketObservers;
    /**
     * Add a ticket to the modifier list
     *
     * @returns Function to remove this modifier ticket
     */
    Add(value: T): () => void;
    /** Observe all values within this modifier. Callback fires on ticket add/remove */
    Observe(observer: (values: T[]) => void): () => void;
    /** Trigger all observers when we make a change to the tickets */
    private TriggerObservers;
}
