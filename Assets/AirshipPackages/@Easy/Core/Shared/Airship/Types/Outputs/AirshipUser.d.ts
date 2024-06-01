export interface PublicUser {
	uid: string;
	username: string;
	statusText?: string;
}

export enum UserStatus {
	OFFLINE = "offline",
	ONLINE = "online",
	IN_GAME = "in_game",
}

interface BaseUserData {
	userId: string;
	username: string;
	usernameLower: string;
	statusText?: string;
	profileImageId?: string;
}

interface BaseUserStatus<S extends UserStatus> extends BaseUserData {
	status: S;
	metadata?: any;
}

type UserOfflineStatus = BaseUserStatus<UserStatus.OFFLINE>;

type UserOnlineStatus = BaseUserStatus<UserStatus.ONLINE>;

interface UserInGameStatus extends BaseUserStatus<UserStatus.IN_GAME> {
	game: { name: string; icon: string };
	gameId: string;
	serverId?: string;
}

export type UserStatusData = UserOfflineStatus | UserOnlineStatus | UserInGameStatus;
