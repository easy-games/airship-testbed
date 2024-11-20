import { Airship, Platform } from "@Easy/Core/Shared/Airship";
import { Game } from "@Easy/Core/Shared/Game";
import ProximityPrompt from "@Easy/Core/Shared/Input/ProximityPrompts/ProximityPrompt";
import MatchmakerSingleton from "./MatchmakerSingleton";
import { NetworkFunction } from "@Easy/Core/Shared/Network/NetworkFunction";
import { Player } from "@Easy/Core/Shared/Player/Player";

export enum MatchmakingAction {
	CreateGroup,
	GroupJoinQueue,
	GroupLeaveQueue,
	GetGroupStatus,
	ClientGetCurrentGroup,
	ServerUserGetCurrentGroup,
	ClientLeaveQueue,
}

const clientActions = new Set<MatchmakingAction>([
	MatchmakingAction.ClientGetCurrentGroup,
	MatchmakingAction.ClientLeaveQueue,
]);

export default class MatchmakerButton extends AirshipBehaviour {
	public prompt: ProximityPrompt;
	public action: MatchmakingAction;
	private matchmakerSingleton: MatchmakerSingleton;
	private performAction: NetworkFunction<{}, void>;

	override Start(): void {
		this.performAction = new NetworkFunction<{}, void>(`MatchmakerButton:PerformAction:${this.action}`);
		this.matchmakerSingleton = MatchmakerSingleton.Get();
		this.prompt.onActivated.Connect(() => {
			if (Game.IsClient()) {
				if (clientActions.has(this.action)) {
					print(`[${this.gameObject.name}] Performing action: ${this.action}`);
					this.PerformAction(Game.localPlayer);
				} else {
					print(`[${this.gameObject.name}] Sending action to server`);
					this.performAction.client.FireServer({});
				}
			}
		});
		if (Game.IsServer()) {
			this.performAction.server.SetCallback((player, action) => {
				this.PerformAction(player);
			});
		}
	}

	private PerformAction(player: Player): void {
		print(`[${this.gameObject.name}] Performing action: ${this.action}`);
		switch (this.action) {
			case MatchmakingAction.CreateGroup:
				this.CreateGroup();
				break;
			case MatchmakingAction.GroupJoinQueue:
				this.GroupJoinQueue();
				break;
			case MatchmakingAction.GroupLeaveQueue:
				this.GroupLeaveQueue();
				break;
			case MatchmakingAction.GetGroupStatus:
				this.GetGroupStatus();
				break;
			case MatchmakingAction.ClientGetCurrentGroup:
				this.ClientGetCurrentGroup();
				break;
			case MatchmakingAction.ServerUserGetCurrentGroup:
				this.ServerUserGetCurrentGroup(player);
				break;
			case MatchmakingAction.ClientLeaveQueue:
				this.ClientLeaveQueue();
				break;
			default:
				print("Unknown action");
				break;
		}
	}

	private CreateGroup(): void {
		if (!Game.IsServer()) return;
		const users = Airship.Players.GetPlayers();
		const userIds = users.map((u) => u.userId);
		const [success, result] = Platform.Server.Matchmaking.CreateGroup(userIds).await();
		if (!success || !result) {
			print("Failed to create group: " + json.encode(result));
			return;
		}
		this.matchmakerSingleton.groupId = result.groupId;
		print("Successfully created group: " + result.groupId);
	}

	private GroupJoinQueue(): void {
		if (!Game.IsServer()) return;
		if (!this.matchmakerSingleton.groupId) {
			print("Group ID not set, cannot join queue");
			return;
		}
		const [success, result] = Platform.Server.Matchmaking.JoinQueue({
			groupId: this.matchmakerSingleton.groupId,
			queueId: "testqueue1",
		}).await();
		if (!success) {
			print("Failed to join queue: " + json.encode(result));
			return;
		}
		print("Successfully joined queue");
	}

	private GroupLeaveQueue(): void {
		if (!Game.IsServer()) return;
		if (!this.matchmakerSingleton.groupId) {
			print("Group ID not set, cannot leave queue");
			return;
		}

		const [success, result] = Platform.Server.Matchmaking.LeaveQueue(this.matchmakerSingleton.groupId).await();
		if (!success) {
			print("Failed to leave queue: " + json.encode(result));
			return;
		}
		print("Successfully left queue");
	}

	private GetGroupStatus(): void {
		if (!Game.IsServer()) return;
		if (!this.matchmakerSingleton.groupId) {
			print("Group ID not set, cannot get group status");
			return;
		}
		const [success, result] = Platform.Server.Matchmaking.GetGroupById(this.matchmakerSingleton.groupId).await();
		if (!success) {
			print("Failed to get group status: " + json.encode(result));
			return;
		}
		print("Successfully got group status: " + json.encode(result));
	}

	private ServerUserGetCurrentGroup(player: Player): void {
		if (!Game.IsServer()) return;
		const [success, result] = Platform.Server.Matchmaking.GetGroupByUserId(player.userId).await();
		if (!success) {
			print("Failed to get current group: " + json.encode(result));
			return;
		}
		print(`Successfully got current group for player ${player.userId}: ${json.encode(result)}`);
	}

	private ClientGetCurrentGroup(): void {
		if (!Game.IsClient()) return;
		print("Attempting to get current group for client");
		const [success, result] = Platform.Client.Matchmaking.GetCurrentGroup().await();
		if (!success) {
			print("Failed to get current group: " + json.encode(result));
			return;
		}
		print("Successfully got current group: " + json.encode(result));
	}

	private ClientLeaveQueue(): void {
		if (!Game.IsClient()) return;
		print("Attempting to leave queue for client");
		const [success, _] = Platform.Client.Matchmaking.LeaveQueue().await();
		if (!success) {
			print("Failed to leave queue");
			return;
		}
		print("Successfully left queue");
	}

	override OnDestroy(): void {}
}
