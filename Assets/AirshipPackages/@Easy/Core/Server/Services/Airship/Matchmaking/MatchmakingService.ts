import { MatchmakingServiceBridgeTopics, ServerBridgeApiCreateGroup, ServerBridgeApiGetGroupById, ServerBridgeApiGetGroupByUserId, ServerBridgeApiJoinQueue, ServerBridgeApiLeaveQueue } from "@Easy/Core/Server/ProtectedServices/Airship/Matchmaking/MatchmakingService";
import {
	PartyServiceBridgeTopics,
	ServerBridgeApiGetPartyById,
	ServerBridgeApiGetPartyForUserId,
} from "@Easy/Core/Server/ProtectedServices/Airship/Party/PartyService";
import { Platform } from "@Easy/Core/Shared/Airship";
import { JoinQueueDto } from "@Easy/Core/Shared/Airship/Types/Inputs/AirshipMatchmaking";
import { Group } from "@Easy/Core/Shared/Airship/Types/Outputs/AirshipMatchmaking";
import { GameServerPartyData } from "@Easy/Core/Shared/Airship/Types/Outputs/AirshipParty";
import { ContextBridgeUtil } from "@Easy/Core/Shared/Airship/Util/ContextBridgeUtil";
import { Service } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";

/**
 * Allows access to player party information.
 */
@Service({})
export class AirshipMatchmakingService {
	constructor() {
		if (!Game.IsServer()) return;

		Platform.Server.Matchmaking = this;
	}

	protected OnStart(): void {}


	/**
	 * Creates a matchmaking group. Groups are used to group together players who are looking for matches together.
	 * When matchmaking in a queue groups will be paired with other groups based on the queue configuration.
	 * @param userIds The userIds of the players to add to the group
	 * @returns The group that was created
	 */
	public async CreateGroup(userIds: string[]): Promise<Group> {
		const result = await ContextBridgeUtil.PromisifyBridgeInvoke<ServerBridgeApiCreateGroup>(
			MatchmakingServiceBridgeTopics.CreateGroup,
			LuauContext.Protected,
			userIds,
		);
		if (!result.success) throw result.error;
		return result.data;
	}

	/**
	 * Gets a group by its id.
	 * @param groupId The id of the group
	 * @returns The group if it exists, undefined otherwise
	 */
	public async GetGroupById(groupId: string): Promise<Group | undefined> {
		const result = await ContextBridgeUtil.PromisifyBridgeInvoke<ServerBridgeApiGetGroupById>(
			MatchmakingServiceBridgeTopics.GetGroupById,
			LuauContext.Protected,
			groupId,
		);
		if (!result.success) throw result.error;
		return result.data;
	}

	/**
	 * Gets a group by the userId of a player.
	 * @param uid The userId of the player
	 * @returns The group if it exists, undefined otherwise
	 */
	public async GetGroupByUserId(uid: string): Promise<Group | undefined> {
		const result = await ContextBridgeUtil.PromisifyBridgeInvoke<ServerBridgeApiGetGroupByUserId>(
			MatchmakingServiceBridgeTopics.GetGroupByUserId,
			LuauContext.Protected,
			uid,
		);
		if (!result.success) throw result.error;
		return result.data;
	}

	/**
	 * Given a group, joins the matchmaking queue looking for other players to play with.
	 * @param body The body of the request, containing the queueId, groupId, and information about the players in the group.
	 * @returns undefined if the request was successful, otherwise an error message.
	 */
	public async JoinQueue(body: JoinQueueDto): Promise<void> {
		const result = await ContextBridgeUtil.PromisifyBridgeInvoke<ServerBridgeApiJoinQueue>(
			MatchmakingServiceBridgeTopics.JoinQueue,
			LuauContext.Protected,
			body,
		);
		if (!result.success) throw result.error;
		return result.data;
	}

	/**
	 * Remove a group from a matchmaking queue.
	 * @param body The body of the request, containing the groupId.
	 * @returns undefined if the request was successful, otherwise an error message.
	 */
	public async LeaveQueue(groupId: string): Promise<void> {
		const result = await ContextBridgeUtil.PromisifyBridgeInvoke<ServerBridgeApiLeaveQueue>(
			MatchmakingServiceBridgeTopics.LeaveQueue,
			LuauContext.Protected,
			groupId,
		);
		if (!result.success) throw result.error;
		return result.data;
	}
}
