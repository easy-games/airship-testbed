import { ApiHelper } from "CoreShared/ApiHelper";
import { EasyCore } from "CoreShared/EasyCore";
import { FriendRequests, FriendsStatus, FriendshipRequestResult } from "CoreShared/SocketIOMessages/FriendsDtos";
import { PublicUser } from "CoreShared/SocketIOMessages/PublicUser";
import { encode } from "Server/Lib/json";

export class FriendAPI {
	static async getFriendsAsync(): Promise<PublicUser[]> {
		const headers = EasyCore.getHeadersMap();

		try {
			return EasyCore.getAsync(`${ApiHelper.USER_SERVICE_URL}/friends/self`, undefined, headers);
		} catch (e) {
			print(`Unable to get friends for current user. error: ${e}`);
			return new Array<PublicUser>();
		}
	}

	static async getStatusWithOtherUserAsync(otherUserUid: string): Promise<FriendsStatus> {
		const headers = EasyCore.getHeadersMap();

		return EasyCore.getAsync(
			`${ApiHelper.USER_SERVICE_URL}/friends/uid/${otherUserUid}/status`,
			undefined,
			headers,
		);
	}

	static async getFriendRequestsAsync(): Promise<FriendRequests> {
		const headers = EasyCore.getHeadersMap();

		return EasyCore.getAsync(`${ApiHelper.USER_SERVICE_URL}/friends/requests/self`, undefined, headers);
	}

	static async requestFriendshipAsync(discriminatedUserName: string): Promise<FriendshipRequestResult> {
		const headers = EasyCore.getHeadersMap();

		return EasyCore.postAsync<FriendshipRequestResult>(
			`${ApiHelper.USER_SERVICE_URL}/friends/requests/self`,
			encode({ discriminatedUsername: discriminatedUserName }),
			undefined,
			headers,
		);
	}

	static async terminateFriendshipAsync(otherUserUid: string): Promise<void> {
		const parameters = new Map<string, string>();
		parameters.set("uid", otherUserUid);

		const headers = EasyCore.getHeadersMap();

		return EasyCore.deleteAsync(`${ApiHelper.USER_SERVICE_URL}/friends/uid/${otherUserUid}`, parameters, headers);
	}
}
