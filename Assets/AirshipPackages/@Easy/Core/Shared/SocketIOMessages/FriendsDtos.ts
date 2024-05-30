import { PublicUser } from "./PublicUser";
import { UserStatus } from "./Status";

export type FriendshipRequestResult = "initiated" | "accepted";

export type FriendshipRequestResultObj = { result: FriendshipRequestResult };

export interface FriendRequests {
	outgoingRequests: PublicUser[];
	incomingRequests: PublicUser[];
	friends: PublicUser[];
}

export interface FriendsOfUsers {
	[uid: string]: PublicUser[];
}

export type FriendsStatus = { isFriends: boolean };

export interface RequestFriendDto {
	username: string;
}

export type FriendStatusData = {
	userId: string;
	username: string;
	status: UserStatus;
	game: string;
};
