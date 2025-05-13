import { AirshipMatchmakingGroup, AirshipMatchConfig } from "@Easy/Core/Shared/Airship/Types/Matchmaking";
import { Service } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import {
	GameCoordinatorClient,
	GameCoordinatorMatchmaking,
} from "@Easy/Core/Shared/TypePackages/game-coordinator-types";
import { UnityMakeRequest } from "@Easy/Core/Shared/TypePackages/UnityMakeRequest";
import { AirshipUrl } from "@Easy/Core/Shared/Util/AirshipUrl";

export const enum MatchmakingServiceBridgeTopics {
	CreateGroup = "MatchmakingService:CreateGroup",
	GetGroupById = "MatchmakingService:GetGroupById",
	GetGroupByUserId = "MatchmakingService:GetGroupByUserId",
	JoinQueue = "MatchmakingService:JoinQueue",
	LeaveQueue = "MatchmakingService:LeaveQueue",
	GetMatchConfig = "MatchmakingService:GetMatchConfig",
}

export type ServerBridgeApiCreateGroup = (userIds: string[]) => AirshipMatchmakingGroup;
export type ServerBridgeApiGetGroupById = (groupId: string) => AirshipMatchmakingGroup | undefined;
export type ServerBridgeApiGetGroupByUserId = (uid: string) => AirshipMatchmakingGroup | undefined;
export type ServerBridgeApiJoinQueue = (body: GameCoordinatorMatchmaking.JoinQueueDto) => undefined;
export type ServerBridgeApiLeaveQueue = (groupId: string) => undefined;
export type ServerBridgeApiGetMatchConfig = () => AirshipMatchConfig | undefined;

const client = new GameCoordinatorClient(UnityMakeRequest(AirshipUrl.GameCoordinator));

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

	public async CreateGroup(userIds: string[]): Promise<AirshipMatchmakingGroup> {
		const result = await client.groups.createGroup({ userIds });
		return result.group;
	}

	public async GetGroupById(groupId: string): Promise<AirshipMatchmakingGroup | undefined> {
		const result = await client.groups.getGroupById({ groupId });
		return result.group;
	}

	public async GetGroupByUserId(uid: string): Promise<AirshipMatchmakingGroup | undefined> {
		const result = await client.groups.getGroupForUserId({ uid });
		return result.group;
	}

	public async JoinQueue(body: GameCoordinatorMatchmaking.JoinQueueDto): Promise<undefined> {
		await client.matchmaking.joinQueue(body);
	}

	public async LeaveQueue(groupId: string): Promise<undefined> {
		await client.matchmaking.leaveQueue({ groupId });
	}

	public async GetMatchConfig(): Promise<AirshipMatchConfig | undefined> {
		const serverBootstrap = GameObject.Find("ServerBootstrap").GetComponent<ServerBootstrap>()!;
		const gs = serverBootstrap.GetGameServer();
		try {
			const matchConfigString = gs?.ObjectMeta.Annotations.Get("MatchConfig");
			if (!matchConfigString) return undefined;

			const matchConfig = json.decode(matchConfigString);
			return matchConfig as AirshipMatchConfig;
		} catch (err) {
			return undefined;
		}
	}

	protected OnStart(): void { }
}
