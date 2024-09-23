import { GameServerPartyData } from "@Easy/Core/Shared/Airship/Types/Outputs/AirshipParty";
import { Service } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { Result } from "@Easy/Core/Shared/Types/Result";
import { AirshipUrl } from "@Easy/Core/Shared/Util/AirshipUrl";
import { DecodeJSON, EncodeJSON } from "@Easy/Core/Shared/json";
import { Group } from "@Easy/Core/Shared/Airship/Types/Outputs/AirshipMatchmaking";
import { JoinQueueDto } from "@Easy/Core/Shared/Airship/Types/Inputs/AirshipMatchmaking";
import { awaitToResult, processResponse } from "@Easy/Core/Shared/Util/AirshipUtil";

export const enum MatchmakingServiceBridgeTopics {
	CreateGroup = "MatchmakingService:CreateGroup",
	GetGroupById = "MatchmakingService:GetGroupById",
	GetGroupByUserId = "MatchmakingService:GetGroupByUserId",
	JoinQueue = "MatchmakingService:JoinQueue",
	LeaveQueue = "MatchmakingService:LeaveQueue",
}

export type ServerBridgeApiCreateGroup = (userIds: string[]) => Result<Group, string>;
export type ServerBridgeApiGetGroupById = (groupId: string) => Result<Group | undefined, string>;
export type ServerBridgeApiGetGroupByUserId = (uid: string) => Result<Group | undefined, string>;
export type ServerBridgeApiJoinQueue = (body: JoinQueueDto) => Result<undefined, string>;
export type ServerBridgeApiLeaveQueue = (groupId: string) => Result<undefined, string>;

@Service({})
export class ProtectedMatchmakingService {
	constructor() {
		if (!Game.IsServer()) return;

		contextbridge.callback<ServerBridgeApiCreateGroup>(
			MatchmakingServiceBridgeTopics.CreateGroup,
			(_, userIds) => awaitToResult(this.CreateGroup(userIds)),
		);

		contextbridge.callback<ServerBridgeApiGetGroupById>(
			MatchmakingServiceBridgeTopics.GetGroupById,
			(_, groupId) => awaitToResult(this.GetGroupById(groupId)),
		);

		contextbridge.callback<ServerBridgeApiGetGroupByUserId>(
			MatchmakingServiceBridgeTopics.GetGroupByUserId,
			(_, uid) => awaitToResult(this.GetGroupByUserId(uid)),
		);

		contextbridge.callback<ServerBridgeApiJoinQueue>(
			MatchmakingServiceBridgeTopics.JoinQueue,
			(_, body) => awaitToResult(this.JoinQueue(body)),
		);

		contextbridge.callback<ServerBridgeApiLeaveQueue>(
			MatchmakingServiceBridgeTopics.LeaveQueue,
			(_, groupId) => awaitToResult(this.LeaveQueue(groupId)),
		);
	}

	public async CreateGroup(userIds: string[]): Promise<Result<Group, string>> {
		print(`protected: MatchmakingService.CreateGroup: ${EncodeJSON(userIds)}`);
		const res = InternalHttpManager.PostAsync(`${AirshipUrl.GameCoordinator}/groups`, EncodeJSON({
			userIds,
		}));

		return processResponse(res, "Unable to create group", {allowEmptyData: false});
	}

	public async GetGroupById(groupId: string): Promise<Result<Group | undefined, string>> {
		print(`protected: MatchmakingService.GetGroupById: ${groupId}`);
		const res = InternalHttpManager.GetAsync(`${AirshipUrl.GameCoordinator}/groups/group-id/${groupId}`);

		return processResponse(res, `An error occurred while trying to find group with id ${groupId}`, {allowEmptyData: true});
	}

	public async GetGroupByUserId(uid: string): Promise<Result<Group | undefined, string>> {
		print(`protected: MatchmakingService.GetGroupByUserId: ${uid}`);
		const res = InternalHttpManager.GetAsync(`${AirshipUrl.GameCoordinator}/groups/uid/${uid}`);

		return processResponse(res, `An error occurred while trying to find group for user with id ${uid}`, {allowEmptyData: true});
	}

	public async JoinQueue(body: JoinQueueDto): Promise<Result<undefined, string>> {
		print(`protected: MatchmakingService.JoinQueue: ${EncodeJSON(body)}`);
		const res = InternalHttpManager.PostAsync(`${AirshipUrl.GameCoordinator}/matchmaking/queue/join`, EncodeJSON(body));

		return processResponse(res, `An error occurred while attempting to join queue: ${body.queueId} group: ${body.groupId}`, {allowEmptyData: true, returnErrorBodyForStatusCodes: [400]});
	}

	public async LeaveQueue(groupId: string): Promise<Result<undefined, string>> {
		print(`protected: MatchmakingService.LeaveQueue: ${EncodeJSON({groupId})}`);
		const res = InternalHttpManager.PostAsync(`${AirshipUrl.GameCoordinator}/matchmaking/queue/leave`, EncodeJSON({groupId}));

		return processResponse(res, `An error occurred while attempting to leave queue for group: ${groupId}`, {allowEmptyData: true, returnErrorBodyForStatusCodes: [400]});
	}
	
	protected OnStart(): void {}
}
