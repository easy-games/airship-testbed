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
	private static friendsCacheByStatus = new Map<UserStatus, FriendStatusData[]>();
	private static friendsCache = new Map<string, FriendStatusData>();

	static async InitAsync(): Promise<void> {
		CoreSignals.GameCoordinatorMessage.Connect((signal) => {
			if (signal.messageName === SIOEventNames.friendStatusUpdateMulti) {
				const friendStatusDatasArrays = decode<FriendStatusData[][]>(signal.jsonMessage);

				// Update friends cache with new info.
				friendStatusDatasArrays.forEach((fsdArray) => {
					fsdArray.forEach((fsd) => {
						this.friendsCache.set(fsd.userId, fsd);

						CoreSignals.FriendUserStatusChanged.Fire({ friendUid: fsd.userId, status: fsd.status });
					});
				});

				// Update friends cache status map.
				this.friendsCacheByStatus.clear();
				this.friendsCache.forEach((fsd) => {
					let fsds = this.friendsCacheByStatus.get(fsd.status);

					if (fsds === undefined) {
						fsds = new Array<FriendStatusData>();
						this.friendsCacheByStatus.set(fsd.status, fsds);
					}

					fsds.push(fsd);
				});
			}
		});

		EasyCore.EmitAsync("refresh-friends-status");

		SetInterval(
			3,
			() => {
				print(
					`FriendAPI.InitAsync.SetInterval() friendsCache: ${encode(
						this.friendsCache,
					)}, this.friendsCacheByStatus: ${encode(this.friendsCacheByStatus)}`,
				);
			},
			true,
		);
	}

	static GetFriendsWithStatus(status: UserStatus): FriendStatusData[] {
		const fsds = this.friendsCacheByStatus.get(status);
		return fsds === undefined ? new Array<FriendStatusData>(0) : fsds;
	}

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
