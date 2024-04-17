import { Player } from "../Player/Player";
export declare class CustomMoveData {
    /** Player. */
    readonly player: Player;
    /** The server tick in which the event was created. */
    readonly tick: number;
    /** The key. */
    readonly key: string;
    /** The value. */
    readonly value: unknown;
    constructor(
    /** Player. */
    player: Player, 
    /** The server tick in which the event was created. */
    tick: number, 
    /** The key. */
    key: string, 
    /** The value. */
    value: unknown);
}
