/// <reference types="@easy-games/compiler-types" />
import { OnStart } from "../../../../node_modules/@easy-games/flamework-core";
import { PublicUser } from "../../../Shared/SocketIOMessages/PublicUser";
import { Result } from "../../../Shared/Types/Result";
/**
 * Provides access to user information.
 */
export declare class UserController implements OnStart {
    OnStart(): void;
    /**
     * Gets a users data by their username.
     * @param username The username of the user
     */
    GetUser(username: string): Promise<Result<PublicUser | undefined, undefined>>;
}
