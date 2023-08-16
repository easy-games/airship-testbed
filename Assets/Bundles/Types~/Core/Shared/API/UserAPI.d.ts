/// <reference types="@easy-games/compiler-types" />
import { PublicUser } from "../SocketIOMessages/PublicUser";
import { UserStatus } from "../SocketIOMessages/Status";
import { UpdateUserDto } from "../SocketIOMessages/UpdateUserDto";
export declare class UserAPI {
    private static currentUser;
    static InitAsync(): Promise<void>;
    static GetCurrentUser(): PublicUser | undefined;
    static GetUserAsync(discriminatedUserName: string): Promise<PublicUser | undefined>;
    static UpdateCurrentUserDataAsync(updateUserDto: UpdateUserDto): Promise<void>;
    static UpdateCurrentUserStatus(userStatus: UserStatus, gameName: string): void;
}
