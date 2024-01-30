import { Controller, OnStart } from "@easy-games/flamework-core";
import { Platform } from "Shared/Airship";
import { PublicUser } from "Shared/SocketIOMessages/PublicUser";
import { Result } from "Shared/Types/Result";
import { RunUtil } from "Shared/Util/RunUtil";
import { DecodeJSON } from "Shared/json";

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
		const res = await FriendsControllerBackend.GetFriends();

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
		const res = await FriendsControllerBackend.IsFriendsWith(userId);

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
