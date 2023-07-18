import { ApiHelper } from "CoreShared/ApiHelper";
import { CoreSignals } from "CoreShared/CoreSignals";
import { EasyCore } from "CoreShared/EasyCore";
import {
	FriendRequests,
	FriendsStatus,
	FriendshipRequestResult,
	FriendshipRequestResultObj,
} from "CoreShared/SocketIOMessages/FriendsDtos";
import { PublicUser } from "CoreShared/SocketIOMessages/PublicUser";
import { SIOEventNames } from "CoreShared/SocketIOMessages/SOIEventNames";
import { encode } from "Server/Lib/json";

export class FriendAPI {
	static async InitAsync(): Promise<void> {
		CoreSignals.GameCoordinatorMessage.Connect((signal) => {
			if (signal.messageName === SIOEventNames.friendStatusUpdateMulti) {
				print(`CoreSignals.GameCoordinatorMessage.Connect() signal: ${encode(signal)}`);
			}
		});

		EasyCore.EmitAsync("refresh-friends-status");
	}

	static async GetOnlineFriendsAsync(): Promise<PublicUser[]> {
		return new Array<PublicUser>();
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
