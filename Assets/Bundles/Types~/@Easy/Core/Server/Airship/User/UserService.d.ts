/// <reference types="@easy-games/compiler-types" />
import { OnStart } from "../../../../node_modules/@easy-games/flamework-core";
import { PublicUser } from "../../../Shared/SocketIOMessages/PublicUser";
import { Result } from "../../../Shared/Types/Result";
/**
 * Provides access to user information.
 */
export declare class UserService implements OnStart {
    OnStart(): void;
    GetUserByUsername(username: string): Promise<Result<PublicUser | undefined, undefined>>;
    GetUserById(userId: string): Promise<Result<PublicUser | undefined, undefined>>;
    /**
     * Gets multiple users at once. This function will not succeed if it is unable to
     * resolve all provided ids into a user.
     * @param userIds The userIds to get.
     * @param strict Specifies if all users must be found. If set to false, the function will
     * succeed even if not all userIds resolve to a user.
     * @returns An array of user objects.
     */
    GetUsersById(userIds: string[], strict?: "true" | "false"): Promise<Result<PublicUser[], undefined>>;
}
