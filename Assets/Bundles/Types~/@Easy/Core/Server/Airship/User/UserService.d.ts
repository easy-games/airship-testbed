/// <reference types="compiler-types" />
/// <reference types="compiler-types" />
import { OnStart } from "../../../Shared/Flamework";
import { PublicUser } from "../../../Shared/SocketIOMessages/PublicUser";
import { Result } from "../../../Shared/Types/Result";
export declare class UserService implements OnStart {
    constructor();
    OnStart(): void;
    /**
     * Gets a single user by their username.
     * @param username The username of the user.
     * @returns A user object
     */
    GetUserByUsername(username: string): Promise<Result<PublicUser | undefined, undefined>>;
    /**
     * Gets a single user by their ID.
     * @param userId The users ID
     * @returns A user object
     */
    GetUserById(userId: string): Promise<Result<PublicUser | undefined, undefined>>;
    /**
     * Gets multiple users at once. This function will not succeed if it is unable to
     * resolve all provided ids into a user.
     * @param userIds The userIds to get.
     * @param strict Specifies if all users must be found. If set to false, the function will
     * succeed even if not all userIds resolve to a user.
     * @returns An array of user objects.
     */
    GetUsersById(userIds: string[], strict?: boolean): Promise<Result<{
        map: Record<string, PublicUser>;
        array: PublicUser[];
    }, undefined>>;
}
