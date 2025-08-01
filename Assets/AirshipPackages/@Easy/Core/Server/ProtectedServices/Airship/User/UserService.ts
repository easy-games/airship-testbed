import { AirshipUser } from "@Easy/Core/Shared/Airship/Types/AirshipUser";
import { Service } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { HttpRetryInstance } from "@Easy/Core/Shared/Http/HttpRetry";
import { GameCoordinatorClient } from "@Easy/Core/Shared/TypePackages/game-coordinator-types";
import { UnityMakeRequest } from "@Easy/Core/Shared/TypePackages/UnityMakeRequest";
import { AirshipUrl } from "@Easy/Core/Shared/Util/AirshipUrl";

export const enum UserServiceBridgeTopics {
	GetUserByUsername = "UserService:GetUserByUsername",
	GetUserById = "UserService:GetUserById",
	GetUsersById = "UserService:GetUsersById",
	GetUserLocationsById = "UserService:GetUserLocationsById",
}

export type ServerBridgeApiGetUserByUsername = (username: string) => AirshipUser | undefined;
export type ServerBridgeApiGetUserById = (userId: string) => AirshipUser | undefined;
export type ServerBridgeApiGetUsersById = (userIds: string[], strict?: boolean) => { [userId: string]: AirshipUser };
export type ServerBridgeApiGetUserLocationsById = (userIds: string[]) => {
	[userId: string]:
		| {
				serverId: string;
		  }
		| undefined;
};

const client = new GameCoordinatorClient(UnityMakeRequest(AirshipUrl.GameCoordinator));

@Service({})
export class ProtectedUserService {
	private readonly httpRetry = HttpRetryInstance();

	constructor() {
		if (!Game.IsServer()) return;

		contextbridge.callback<ServerBridgeApiGetUserByUsername>(
			UserServiceBridgeTopics.GetUserByUsername,
			(_, username) => {
				return this.GetUserByUsername(username).expect();
			},
		);

		contextbridge.callback<ServerBridgeApiGetUserById>(UserServiceBridgeTopics.GetUserById, (_, userId) => {
			return this.GetUserById(userId).expect();
		});

		contextbridge.callback<ServerBridgeApiGetUsersById>(
			UserServiceBridgeTopics.GetUsersById,
			(_, userIds, strict = false) => {
				return this.GetUsersById(userIds, strict).expect();
			},
		);

		contextbridge.callback<ServerBridgeApiGetUserLocationsById>(
			UserServiceBridgeTopics.GetUserLocationsById,
			(_, userIds) => {
				return this.GetUserLocationsById(userIds).expect();
			},
		);
	}

	public async GetUserByUsername(username: string): Promise<ReturnType<ServerBridgeApiGetUserByUsername>> {
		const result = await client.users.findByUsername({ username });
		return result.user;
	}

	public async GetUserById(userId: string): Promise<ReturnType<ServerBridgeApiGetUserById>> {
		const result = await client.users.getByUid({ params: { uid: userId } });
		return result.user;
	}

	public async GetUsersById(
		userIds: string[],
		strict: boolean = false,
	): Promise<ReturnType<ServerBridgeApiGetUsersById>> {
		if (userIds.size() === 0) {
			return {};
		}

		let array = await client.users.find({ users: userIds, strict });
		const map: Record<string, AirshipUser> = {};
		array.forEach((u) => (map[u.uid] = u));

		return map;
	}

	public async GetUserLocationsById(userIds: string[]): Promise<ReturnType<ServerBridgeApiGetUserLocationsById>> {
		if (userIds.size() === 0) {
			return {};
		}

		return await client.userLocations.find({ userIds });
	}

	protected OnStart(): void {}
}
