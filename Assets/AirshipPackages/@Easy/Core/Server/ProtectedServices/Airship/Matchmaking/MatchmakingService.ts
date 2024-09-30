import { Service } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { AirshipUrl } from "@Easy/Core/Shared/Util/AirshipUrl";
import { DecodeJSON, EncodeJSON } from "@Easy/Core/Shared/json";
import { Group } from "@Easy/Core/Shared/Airship/Types/Outputs/AirshipMatchmaking";
import { JoinQueueDto } from "@Easy/Core/Shared/Airship/Types/Inputs/AirshipMatchmaking";

export const enum MatchmakingServiceBridgeTopics {
	CreateGroup = "MatchmakingService:CreateGroup",
	GetGroupById = "MatchmakingService:GetGroupById",
	GetGroupByUserId = "MatchmakingService:GetGroupByUserId",
	JoinQueue = "MatchmakingService:JoinQueue",
	LeaveQueue = "MatchmakingService:LeaveQueue",
}

export type ServerBridgeApiCreateGroup = (userIds: string[]) => Group;
export type ServerBridgeApiGetGroupById = (groupId: string) => Group | undefined;
export type ServerBridgeApiGetGroupByUserId = (uid: string) => Group | undefined;
export type ServerBridgeApiJoinQueue = (body: JoinQueueDto) => undefined;
export type ServerBridgeApiLeaveQueue = (groupId: string) => undefined;

@Service({})
export class ProtectedMatchmakingService {
	constructor() {
		if (!Game.IsServer()) return;

		contextbridge.callback<ServerBridgeApiCreateGroup>(
			MatchmakingServiceBridgeTopics.CreateGroup,
			(_, userIds) => this.CreateGroup(userIds).expect(),
		);

		contextbridge.callback<ServerBridgeApiGetGroupById>(
			MatchmakingServiceBridgeTopics.GetGroupById,
			(_, groupId) => this.GetGroupById(groupId).expect(),
		);

		contextbridge.callback<ServerBridgeApiGetGroupByUserId>(
			MatchmakingServiceBridgeTopics.GetGroupByUserId,
			(_, uid) => this.GetGroupByUserId(uid).expect(),
		);

		contextbridge.callback<ServerBridgeApiJoinQueue>(
			MatchmakingServiceBridgeTopics.JoinQueue,
			(_, body) => this.JoinQueue(body).expect(),
		);

		contextbridge.callback<ServerBridgeApiLeaveQueue>(
			MatchmakingServiceBridgeTopics.LeaveQueue,
			(_, groupId) => this.LeaveQueue(groupId).expect(),
		);
	}

	public async CreateGroup(userIds: string[]): Promise<Group> {
		const result = InternalHttpManager.PostAsync(`${AirshipUrl.GameCoordinator}/groups`, EncodeJSON({
			userIds,
		}));

		if (!result.success || result.statusCode > 299) {
			warn(`Unable to create group. Status Code: ${result.statusCode}.\n`, result.error);
			throw result.error;
		}

		return DecodeJSON(result.data) as Group;
	}

	public async GetGroupById(groupId: string): Promise<Group | undefined> {
		const result = InternalHttpManager.GetAsync(`${AirshipUrl.GameCoordinator}/groups/group-id/${groupId}`);

		if (!result.success || result.statusCode > 299) {
			warn(`An error occurred while trying to find group with id ${groupId}. Status Code: ${result.statusCode}.\n`, result.error);
			throw result.error;
		}

		if (!result.data) {
			return undefined;
		}

		return DecodeJSON(result.data) as Group;
	}

	public async GetGroupByUserId(uid: string): Promise<Group | undefined> {
		const result = InternalHttpManager.GetAsync(`${AirshipUrl.GameCoordinator}/groups/uid/${uid}`);

		if (!result.success || result.statusCode > 299) {
			warn(`An error occurred while trying to find group for user with id ${uid}. Status Code: ${result.statusCode}.\n`, result.error);
			throw result.error;
		}

		if (!result.data) {
			return undefined;
		}

		return DecodeJSON(result.data) as Group;
	}

	public async JoinQueue(body: JoinQueueDto): Promise<undefined> {
		const result = InternalHttpManager.PostAsync(`${AirshipUrl.GameCoordinator}/matchmaking/queue/join`, EncodeJSON(body));

		if (!result.success || result.statusCode > 299) {
			if (result.statusCode === 400) {
				throw result.error;
			}

			warn(`An error occurred while attempting to join queue: ${body.queueId} group: ${body.groupId}. Status Code: ${result.statusCode}.\n`, result.error);
			throw result.error;
		}

		return undefined;
	}

	public async LeaveQueue(groupId: string): Promise<undefined> {
		const result = InternalHttpManager.PostAsync(`${AirshipUrl.GameCoordinator}/matchmaking/queue/leave`, EncodeJSON({ groupId }));

		if (!result.success || result.statusCode > 299) {
			if (result.statusCode === 400) {
				throw result.error;
			}

			warn(`An error occurred while attempting to leave queue for group: ${groupId}. Status Code: ${result.statusCode}.\n`, result.error);
			throw result.error;
		}

		return undefined;
	}

	protected OnStart(): void { }
}
