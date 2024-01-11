/// <reference types="@easy-games/compiler-types" />
import { OnStart } from "../../../../node_modules/@easy-games/flamework-core";
import { Result } from "../../../Shared/Types/Result";
/**
 * This controller provides information about the users current party as well as functions
 * for managing parties.
 */
export declare class PartyController implements OnStart {
    OnStart(): void;
    /**
     * Sends an invite to the provided user, allowing them to join the existing party.
     * @param userIdToAdd The userId of the user to invite
     */
    InviteUser(userIdToAdd: string): Promise<Result<undefined, undefined>>;
    /**
     * Allows the party leader to remove users from the party. A client can always remove itself from the
     * current party by calling this function and providing their own user id.
     * @param userIdToRemove
     */
    RemoveUser(userIdToRemove: string): Promise<Result<undefined, undefined>>;
    /**
     * Joins the user to the provided party id. This may fail if the user is not allowed to join the party.
     * @param partyId The id of the party
     */
    JoinParty(partyId: string): Promise<Result<undefined, undefined>>;
}
