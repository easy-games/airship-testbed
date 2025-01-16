import { JoinQueueDto } from "@Easy/Core/Shared/Airship/Types/Inputs/AirshipMatchmaking";
import { Group, MatchConfig } from "@Easy/Core/Shared/Airship/Types/Outputs/AirshipMatchmaking";
import { Service } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { HttpRetry } from "@Easy/Core/Shared/Http/HttpRetry";
import { AirshipUrl } from "@Easy/Core/Shared/Util/AirshipUrl";

export const enum MatchmakingServiceBridgeTopics {
	CreateGroup = "MatchmakingService:CreateGroup",
	GetGroupById = "MatchmakingService:GetGroupById",
	GetGroupByUserId = "MatchmakingService:GetGroupByUserId",
	JoinQueue = "MatchmakingService:JoinQueue",
	LeaveQueue = "MatchmakingService:LeaveQueue",
	GetMatchConfig = "MatchmakingService:GetMatchConfig",
}

export type ServerBridgeApiCreateGroup = (userIds: string[]) => Group;
export type ServerBridgeApiGetGroupById = (groupId: string) => Group | undefined;
export type ServerBridgeApiGetGroupByUserId = (uid: string) => Group | undefined;
export type ServerBridgeApiJoinQueue = (body: JoinQueueDto) => undefined;
export type ServerBridgeApiLeaveQueue = (groupId: string) => undefined;
export type ServerBridgeApiGetMatchConfig = () => MatchConfig | undefined;

@Service({})
export class ProtectedMatchmakingService {
	constructor() {
		if (!Game.IsServer()) return;

		contextbridge.callback<ServerBridgeApiCreateGroup>(MatchmakingServiceBridgeTopics.CreateGroup, (_, userIds) =>
			this.CreateGroup(userIds).expect(),
		);

		contextbridge.callback<ServerBridgeApiGetGroupById>(MatchmakingServiceBridgeTopics.GetGroupById, (_, groupId) =>
			this.GetGroupById(groupId).expect(),
		);

		contextbridge.callback<ServerBridgeApiGetGroupByUserId>(
			MatchmakingServiceBridgeTopics.GetGroupByUserId,
			(_, uid) => this.GetGroupByUserId(uid).expect(),
		);

		contextbridge.callback<ServerBridgeApiJoinQueue>(MatchmakingServiceBridgeTopics.JoinQueue, (_, body) =>
			this.JoinQueue(body).expect(),
		);

		contextbridge.callback<ServerBridgeApiLeaveQueue>(MatchmakingServiceBridgeTopics.LeaveQueue, (_, groupId) =>
			this.LeaveQueue(groupId).expect(),
		);

		contextbridge.callback<ServerBridgeApiGetMatchConfig>(MatchmakingServiceBridgeTopics.GetMatchConfig, (_) => {
			return this.GetMatchConfig().expect();
		});
	}

	public async CreateGroup(userIds: string[]): Promise<Group> {
		const result = await HttpRetry(() => InternalHttpManager.PostAsync(
			`${AirshipUrl.GameCoordinator}/groups`,
			json.encode({
				userIds,
			}),
		), { retryKey: "post/game-coordinator/groups" });

		if (!result.success || result.statusCode > 299) {
			warn(`Unable to create group. Status Code: ${result.statusCode}.\n`, result.error);
			throw result.error;
		}

		return json.decode<{ group: Group }>(result.data).group;
	}

	public async GetGroupById(groupId: string): Promise<Group | undefined> {
		const result = await HttpRetry(
			() => InternalHttpManager.GetAsync(`${AirshipUrl.GameCoordinator}/groups/group-id/${groupId}`),
			{ retryKey: "get/game-coordinator/groups/group-id/:groupId" },
		)

		if (!result.success || result.statusCode > 299) {
			warn(
				`An error occurred while trying to find group with id ${groupId}. Status Code: ${result.statusCode}.\n`,
				result.error,
			);
			throw result.error;
		}

		return json.decode<{ group: Group | undefined }>(result.data).group;
	}

	public async GetGroupByUserId(uid: string): Promise<Group | undefined> {
		const result = await HttpRetry(
			() => InternalHttpManager.GetAsync(`${AirshipUrl.GameCoordinator}/groups/uid/${uid}`),
			{ retryKey: "get/game-coordinator/groups/uid/:uid" },
		)

		if (!result.success || result.statusCode > 299) {
			warn(
				`An error occurred while trying to find group for user with id ${uid}. Status Code: ${result.statusCode}.\n`,
				result.error,
			);
			throw result.error;
		}

		return json.decode<{ group: Group | undefined }>(result.data).group;
	}

	public async JoinQueue(body: JoinQueueDto): Promise<undefined> {
		const result = await HttpRetry(() => InternalHttpManager.PostAsync(
			`${AirshipUrl.GameCoordinator}/matchmaking/queue/join`,
			json.encode(body),
		), { retryKey: "post/game-coordinator/matchmaking/queue/join" });

		if (!result.success || result.statusCode > 299) {
			warn(
				`An error occurred while attempting to join queue: ${body.queueId} group: ${body.groupId}. Status Code: ${result.statusCode}.\n`,
				result.error,
			);
			throw result.error;
		}

		return undefined;
	}

	public async LeaveQueue(groupId: string): Promise<undefined> {
		const result = await HttpRetry(() => InternalHttpManager.PostAsync(
			`${AirshipUrl.GameCoordinator}/matchmaking/queue/leave`,
			json.encode({ groupId }),
		), { retryKey: "post/game-coordinator/matchmaking/queue/leave" });

		if (!result.success || result.statusCode > 299) {
			warn(
				`An error occurred while attempting to leave queue for group: ${groupId}. Status Code: ${result.statusCode}.\n`,
				result.error,
			);
			throw result.error;
		}

		return undefined;
	}

	public async GetMatchConfig(): Promise<MatchConfig | undefined> {
		const serverBootstrap = GameObject.Find("ServerBootstrap").GetComponent<ServerBootstrap>()!;
		const gs = serverBootstrap.GetGameServer();
		try {
			const matchConfigString = gs?.ObjectMeta.Annotations.Get("MatchConfig");
			if (!matchConfigString) return undefined;

			const matchConfig = json.decode(matchConfigString);
			return matchConfig as MatchConfig;
		} catch (err) {
			return undefined;
		}
	}

	protected OnStart(): void {}
}
