/// <reference types="@easy-games/compiler-types" />
import { FriendRequests, FriendStatusData, FriendsStatus, FriendshipRequestResultObj } from "../SocketIOMessages/FriendsDtos";
import { PublicUser } from "../SocketIOMessages/PublicUser";
import { UserStatus } from "../SocketIOMessages/Status";
export declare class FriendAPI {
    private static friendsCacheByStatus;
    private static friendsCache;
    static InitAsync(): Promise<void>;
    private static RefreshFriendsCache;
    static GetFriendStatusData(discriminatedUsername: string): FriendStatusData | undefined;
    static GetFriendsWithStatus(status?: UserStatus | undefined): FriendStatusData[];
    static GetFriendsAsync(): Promise<PublicUser[]>;
    static GetStatusWithOtherUserAsync(otherUserUid: string): Promise<FriendsStatus>;
    static GetFriendRequestsAsync(): Promise<FriendRequests>;
    static RequestFriendshipAsync(discriminatedUsername: string): Promise<FriendshipRequestResultObj>;
    static TerminateFriendshipAsync(otherUserUid: string): Promise<void>;
}
