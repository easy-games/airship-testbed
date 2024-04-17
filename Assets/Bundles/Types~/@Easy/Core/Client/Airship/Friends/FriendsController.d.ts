/// <reference types="compiler-types" />
import { OnStart } from "../../../Shared/Flamework";
import { PublicUser } from "../../../Shared/SocketIOMessages/PublicUser";
import { Result } from "../../../Shared/Types/Result";
export declare class FriendsController implements OnStart {
    constructor();
    OnStart(): void;
    /**
     * Gets the users friends list.
     * @returns A list of friends.
     */
    GetFriends(): Promise<Result<PublicUser[], undefined>>;
    /**
     * Checks if the user is friends with the user provided.
     * @param userId The user id to check friend status with.
     * @returns True if friends, false otherwise.
     */
    IsFriendsWith(userId: string): Promise<Result<boolean, undefined>>;
}
