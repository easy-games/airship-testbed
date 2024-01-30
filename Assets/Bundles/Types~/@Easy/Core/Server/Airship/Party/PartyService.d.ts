/// <reference types="@easy-games/compiler-types" />
import { OnStart } from "../../../../node_modules/@easy-games/flamework-core";
import { PartyMode, PartyStatus } from "../../../Shared/SocketIOMessages/Party";
import { PublicUser } from "../../../Shared/SocketIOMessages/PublicUser";
import { Result } from "../../../Shared/Types/Result";
/**
 * Information about a users party.
 */
export interface GameServerPartyData {
    partyId: string;
    leader: string;
    mode: PartyMode;
    lastUpdated: number;
    members: PublicUser[];
    status: PartyStatus;
}
export declare class PartyService implements OnStart {
    constructor();
    OnStart(): void;
    /**
     * Gets the users party. To be allowed access to party information, the user
     * must be playing the current game.
     * @param userId The id of the user
     */
    GetPartyForUserId(userId: string): Promise<Result<GameServerPartyData | undefined, undefined>>;
    /**
     * Gets the party. To be allowed access to party information, the party leader must be playing
     * the current game.
     * @param partyId The id of the party
     */
    GetPartyById(partyId: string): Promise<Result<GameServerPartyData | undefined, undefined>>;
}
