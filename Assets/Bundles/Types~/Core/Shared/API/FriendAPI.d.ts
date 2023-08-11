import { FriendRequests, FriendStatusData, FriendsStatus, FriendshipRequestResultObj } from "Shared/SocketIOMessages/FriendsDtos";
import { PublicUser } from "Shared/SocketIOMessages/PublicUser";
import { UserStatus } from "Shared/SocketIOMessages/Status";
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
