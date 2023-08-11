import { PublicUser } from "./PublicUser";
import { UserStatus } from "./Status";
export declare type FriendshipRequestResult = "initiated" | "accepted";
export declare type FriendshipRequestResultObj = {
    result: FriendshipRequestResult;
};
export interface FriendRequests {
    outgoingRequests: PublicUser[];
    incomingRequests: PublicUser[];
    friends: PublicUser[];
}
export interface FriendsOfUsers {
    [uid: string]: PublicUser[];
}
export declare type FriendsStatus = {
    isFriends: boolean;
};
export interface RequestFriendDto {
    discriminatedUsername: string;
}
export declare type FriendStatusData = {
    discriminatedUsername: string;
    discriminator: string;
    userId: string;
    username: string;
    status: UserStatus;
    game: string;
};
