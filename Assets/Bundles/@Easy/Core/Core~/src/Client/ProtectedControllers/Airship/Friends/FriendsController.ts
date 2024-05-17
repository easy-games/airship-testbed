import { Platform } from "@Easy/Core/Shared/Airship";
import { Controller, OnStart } from "@Easy/Core/Shared/Flamework";
import { PublicUser } from "@Easy/Core/Shared/SocketIOMessages/PublicUser";
import { Result } from "@Easy/Core/Shared/Types/Result";
import { AirshipUrl } from "@Easy/Core/Shared/Util/AirshipUrl";
import { RunUtil } from "@Easy/Core/Shared/Util/RunUtil";
import { DecodeJSON } from "@Easy/Core/Shared/json";

@Controller({})
export class FriendsController implements OnStart {
	constructor() {
		if (RunUtil.IsClient()) Platform.client.friends = this;
	}

	OnStart(): void {}

	/**
	 * Gets the users friends list.
	 * @returns A list of friends.
	 */
	public async GetFriends(): Promise<Result<PublicUser[], undefined>> {
		const res = InternalHttpManager.GetAsync(`${AirshipUrl.GameCoordinator}/friends/self`);

		if (!res.success || res.statusCode > 299) {
			warn(`Unable to get friends. Status Code ${res.statusCode}.\n`, res.data);
			return {
				success: false,
				data: undefined,
			};
		}

		return {
			success: true,
			data: DecodeJSON(res.data) as PublicUser[],
		};
	}

	/**
	 * Checks if the user is friends with the user provided.
	 * @param userId The user id to check friend status with.
	 * @returns True if friends, false otherwise.
	 */
	public async IsFriendsWith(userId: string): Promise<Result<boolean, undefined>> {
		const res = InternalHttpManager.GetAsync(`${AirshipUrl.GameCoordinator}/friends/uid/${userId}/status`);

		if (!res.success || res.statusCode > 299) {
			warn(`Unable to get friends. Status Code ${res.statusCode}.\n`, res.data);
			return {
				success: false,
				data: undefined,
			};
		}

		const data = DecodeJSON(res.data) as { areFriends: boolean };

		return {
			success: true,
			data: data.areFriends,
		};
	}
}
