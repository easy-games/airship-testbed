import { Controller, OnStart } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { PublicUser } from "@Easy/Core/Shared/SocketIOMessages/PublicUser";
import { Result } from "@Easy/Core/Shared/Types/Result";
import { AirshipUrl } from "@Easy/Core/Shared/Util/AirshipUrl";
import { DecodeJSON } from "@Easy/Core/Shared/json";

export enum FriendsControllerBridgeTopics {
	GetFriends = "FriendsController:GetFriends",
	IsFriendsWith = "FriendsController:IsFriendsWith",
}

export type BridgeApiGetFriends = () => Result<PublicUser[], undefined>;
export type BrigdeApiIsFriendsWith = (userId: string) => Result<boolean, undefined>;

@Controller({})
export class FriendsController implements OnStart {
	constructor() {
		if (!Game.IsClient()) return;

		contextbridge.callback<BridgeApiGetFriends>(FriendsControllerBridgeTopics.GetFriends, (_) => {
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
		});

		contextbridge.callback<BrigdeApiIsFriendsWith>(FriendsControllerBridgeTopics.IsFriendsWith, (_, userId) => {
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
		});
	}

	OnStart(): void {}
}
