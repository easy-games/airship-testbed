/// <reference types="compiler-types" />
import { OnStart } from "../../../Shared/Flamework";
import { Result } from "../../../Shared/Types/Result";
export declare class MatchmakingService implements OnStart {
    constructor();
    OnStart(): void;
    /**
     * Gets the currently available matchmaking regions. Some or all of these regions can be provided
     * to the JoinPartyToQueue function to select the regions the party will matchmake in.
     *
     * In cases of small player counts, it may be better to always queue users to all regions instead
     * of allowing them to select their preferred regions.
     * @returns A list of currently available matchmaking regions.
     */
    GetMatchmakingRegions(): Promise<Result<string[], undefined>>;
    /**
     * Joins a party to the provided queue. The optional regions array can be used to overwrite the regions
     * this party will matchmake in. By default, the regions the party leader has selected will be used.
     * Refer to the GetMatchmakingRegions function for more information about matchmaking regions.
     * @param partyId The party to queue
     * @param queueId The name of the queue the party should join
     * @param regions The regions this party should queue in. This overwrites the party leader selections.
     */
    JoinPartyToQueue(partyId: string, queueId: string, regions?: string[]): Promise<Result<undefined, undefined>>;
    /**
     * Removes the party from queue.
     * @param partyId The id of the party
     */
    RemovePartyFromQueue(partyId: string): Promise<Result<undefined, undefined>>;
}
