import { ApiHelper } from "CoreShared/ApiHelper";
import { CoreSignals } from "CoreShared/CoreSignals";
import { EasyCore } from "CoreShared/EasyCore";
import { PublicUser } from "CoreShared/SocketIOMessages/PublicUser";
import { SIOEventNames } from "CoreShared/SocketIOMessages/SOIEventNames";
import { decode, encode } from "Server/Lib/json";
import {
	FriendRequests,
	FriendStatusData,
	FriendsStatus,
	FriendshipRequestResultObj,
} from "CoreShared/SocketIOMessages/FriendsDtos";
import { SetInterval } from "Shared/Util/Timer";
import { UserStatus } from "CoreShared/SocketIOMessages/Status";

export class FriendAPI {
	private static onlineFriendsCache = new Map<UserStatus, FriendStatusData>();
	private static friendsCache = new Map<string, FriendStatusData>();

	static async InitAsync(): Promise<void> {
		CoreSignals.GameCoordinatorMessage.Connect((signal) => {
			if (signal.messageName === SIOEventNames.friendStatusUpdateMulti) {
				const friendStatusDatasArrays = decode<FriendStatusData[][]>(signal.jsonMessage);

				friendStatusDatasArrays.forEach((fsdArray) => {
					fsdArray.forEach((fsd) => {
						this.friendsCache.set(fsd.userId, fsd);
					});
				});
			}
		});

		EasyCore.EmitAsync("refresh-friends-status");

		SetInterval(
			3,
			() => {
				print(`FriendAPI.InitAsync.SetInterval() friendsCache: ${encode(this.friendsCache)}`);
			},
			true,
		);
	}

	// static GetFriendsWithStatus(statuses: UserStatus[]): Promise<FriendStatusData[]> {
	// 	return this.friendsCache.
	// }

	static async GetFriendsAsync(): Promise<PublicUser[]> {
		const headers = EasyCore.GetHeadersMap();

		try {
			return EasyCore.GetAsync(`${ApiHelper.USER_SERVICE_URL}/friends/self`, undefined, headers);
		} catch (e) {
			print(`Unable to get friends for current user. error: ${e}`);
			return new Array<PublicUser>();
		}
	}

	static async GetStatusWithOtherUserAsync(otherUserUid: string): Promise<FriendsStatus> {
		const headers = EasyCore.GetHeadersMap();

		return EasyCore.GetAsync(
			`${ApiHelper.USER_SERVICE_URL}/friends/uid/${otherUserUid}/status`,
			undefined,
			headers,
		);
	}

	static async GetFriendRequestsAsync(): Promise<FriendRequests> {
		const headers = EasyCore.GetHeadersMap();

		return EasyCore.GetAsync(`${ApiHelper.USER_SERVICE_URL}/friends/requests/self`, undefined, headers);
	}

	static async RequestFriendshipAsync(discriminatedUserName: string): Promise<FriendshipRequestResultObj> {
		const headers = EasyCore.GetHeadersMap();

		return EasyCore.PostAsync<FriendshipRequestResultObj>(
			`${ApiHelper.USER_SERVICE_URL}/friends/requests/self`,
			encode({ discriminatedUsername: discriminatedUserName }),
			undefined,
			headers,
		);
	}

	static async TerminateFriendshipAsync(otherUserUid: string): Promise<void> {
		const parameters = new Map<string, string>();
		parameters.set("uid", otherUserUid);

		const headers = EasyCore.GetHeadersMap();

		return EasyCore.DeleteAsync(`${ApiHelper.USER_SERVICE_URL}/friends/uid/${otherUserUid}`, parameters, headers);
	}
}
