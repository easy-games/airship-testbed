import { Airship, Platform } from "@Easy/Core/Shared/Airship";
import { Game } from "@Easy/Core/Shared/Game";
import ProximityPrompt from "@Easy/Core/Shared/Input/ProximityPrompts/ProximityPrompt";
import MatchmakerSingleton from "./MatchmakerSingleton";
import { EncodeJSON } from "@Easy/Core/Shared/json";
import { NetworkFunction } from "@Easy/Core/Shared/Network/NetworkFunction";

export enum MatchmakingAction {
	CreateGroup,
	GroupJoinQueue,
	GroupLeaveQueue,
	GetGroupStatus,
	UserGetCurrentGroup,
}

const clientActions = new Set<MatchmakingAction>([
	MatchmakingAction.UserGetCurrentGroup,
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
					this.PerformAction();
				} else {
					print(`[${this.gameObject.name}] Sending action to server`);
					this.performAction.client.FireServer({});
				}
			}
		});
		if (Game.IsServer()) {
			this.performAction.server.SetCallback((_, action) => {
				this.PerformAction();
			});
		}
	}

	private PerformAction(): void {
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
			case MatchmakingAction.UserGetCurrentGroup:
				this.UserGetCurrentGroup();
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
		if (!success) {
			print("Failed to create group: " + EncodeJSON(result));
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
		const users = Airship.Players.GetPlayers();
		const userIds = users.map((u) => u.userId);
		const [success, result] = Platform.Server.Matchmaking.JoinQueue({
			groupId: this.matchmakerSingleton.groupId,
			queueId: "testqueue1",
			members: userIds.map((u) => ({
				uid: u,
			})),
		}).await();
		if (!success) {
			print("Failed to join queue: " + EncodeJSON(result));
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

		const [success, result] = Platform.Server.Matchmaking.LeaveQueue({
			groupId: this.matchmakerSingleton.groupId,
		}).await();
		if (!success) {
			print("Failed to leave queue: " + EncodeJSON(result));
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
			print("Failed to get group status: " + EncodeJSON(result));
			return;
		}
		print("Successfully got group status: " + EncodeJSON(result));
	}

	private UserGetCurrentGroup(): void {
		if (!Game.IsClient()) return;
		const [success, result] = Platform.Client.Matchmaking.GetCurrentGroup().await();
		if (!success) {
			print("Failed to get current group: " + EncodeJSON(result));
			return;
		}
		print("Successfully got current group: " + EncodeJSON(result));
	}

	override OnDestroy(): void { }
}
