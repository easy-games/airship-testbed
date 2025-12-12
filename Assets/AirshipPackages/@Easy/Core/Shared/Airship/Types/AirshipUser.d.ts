import { GameCoordinatorFriends, GameCoordinatorUsers, GameCoordinatorUserStatus } from "../../TypePackages/game-coordinator-types";

export type AirshipUpdateStatusDto = GameCoordinatorUserStatus.UpdateUserStatusDto;

export type AirshipUser = GameCoordinatorUsers.PublicUser;
export type AirshipFriendWithStatus = GameCoordinatorFriends.FriendWithStatus;
export type AirshipUserStatusData = GameCoordinatorUserStatus.UserStatusData;
