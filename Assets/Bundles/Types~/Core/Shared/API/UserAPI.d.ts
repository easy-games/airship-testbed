import { PublicUser } from "Shared/SocketIOMessages/PublicUser";
import { UserStatus } from "Shared/SocketIOMessages/Status";
import { UpdateUserDto } from "Shared/SocketIOMessages/UpdateUserDto";
export declare class UserAPI {
    private static currentUser;
    static InitAsync(): Promise<void>;
    static GetCurrentUser(): PublicUser | undefined;
    static GetUserAsync(discriminatedUserName: string): Promise<PublicUser | undefined>;
    static UpdateCurrentUserDataAsync(updateUserDto: UpdateUserDto): Promise<any>;
    static UpdateCurrentUserStatus(userStatus: UserStatus, gameName: string): void;
}
