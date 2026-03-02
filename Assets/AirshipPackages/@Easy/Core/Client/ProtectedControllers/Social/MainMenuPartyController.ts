import { AirshipPartyInternalSnapshot } from "@Easy/Core/Shared/Airship/Types/AirshipParty";
import { AirshipUserStatusData } from "@Easy/Core/Shared/Airship/Types/AirshipUser";
import { AudioManager } from "@Easy/Core/Shared/Audio/AudioManager";
import { CoreContext } from "@Easy/Core/Shared/CoreClientContext";
import { Controller, Dependency } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { Protected } from "@Easy/Core/Shared/Protected";
import { GameCoordinatorClient } from "@Easy/Core/Shared/TypePackages/game-coordinator-types";
import { UnityMakeRequest } from "@Easy/Core/Shared/TypePackages/UnityMakeRequest";
import { Result } from "@Easy/Core/Shared/Types/Result";
import { AirshipUrl } from "@Easy/Core/Shared/Util/AirshipUrl";
import { ChatColor } from "@Easy/Core/Shared/Util/ChatColor";
import { Signal } from "@Easy/Core/Shared/Util/Signal";
import { MainMenuController } from "../MainMenuController";
import { SocketController } from "../Socket/SocketController";
import { ProtectedFriendsController } from "./FriendsController";
import { SocialNotificationType } from "./SocialNotificationType";

const client = new GameCoordinatorClient(UnityMakeRequest(AirshipUrl.GameCoordinator));

@Controller({})
export class MainMenuPartyController {
	public party: AirshipPartyInternalSnapshot | undefined;
	public onPartyChanged = new Signal<
		[newParty: AirshipPartyInternalSnapshot | undefined, oldParty: AirshipPartyInternalSnapshot | undefined]
	>();

	public partyLeaderStatus: AirshipUserStatusData | undefined;
	public onPartyLeaderStatusChanged = new Signal<
		[newStatus: AirshipUserStatusData | undefined, oldStatus: AirshipUserStatusData | undefined]
	>();

	constructor(
		private readonly mainMenuController: MainMenuController,
		private readonly socketController: SocketController,
	) {}

	/**
	 * @returns True if both a party leader and party has more than 1 player.
	 */
	public IsPartyLeader(): boolean {
		if (!this.party) return false;
		if (!Protected.User.localUser) return false;

		return this.party.leader === Protected.User.localUser.uid && this.party.members.size() > 1;
	}

	protected OnStart(): void {
		this.socketController.On<AirshipPartyInternalSnapshot>("game-coordinator/party-update", (data) => {
			if (!Game.IsInGame()) print("game-coordinator/party-member-status-update-multi:", data);
			let oldParty = this.party;
			this.party = data;
			this.onPartyChanged.Fire(data, oldParty);
		});

		this.socketController.On<AirshipUserStatusData[]>(
			"game-coordinator/party-member-status-update-multi",
			(data) => {
				if (!Game.IsInGame()) print("game-coordinator/party-member-status-update-multi:", data);
				if (!this.party) return;

				const partyLeader = data.find((d) => d.userId === this.party!.leader);
				const oldLeaderStatus = this.partyLeaderStatus;
				this.partyLeaderStatus = partyLeader;
				this.onPartyLeaderStatusChanged.Fire(partyLeader, oldLeaderStatus);
			},
		);

		Dependency<ProtectedFriendsController>().socialNotificationHandlers.set(
			SocialNotificationType.PartyInvite,
			(username, userId, result, extraData) => {
				const data = extraData as AirshipPartyInternalSnapshot;
				if (result) {
					try {
						print("Requesting to join party id=" + data.partyId);
						const [success, result] = client.party.joinParty({ partyId: data.partyId }).await();
						if (!success) {
							Debug.LogError("Failed to join party: " + result);
							return;
						}
						Dependency<ProtectedFriendsController>().FireNotificationKey("party-invite:" + data.leader);
					} catch {
						// empty
					}
				} else {
					// We don't have an endpoint for declining party invite. just close the UI.
					Dependency<ProtectedFriendsController>().FireNotificationKey("party-invite:" + data.leader);
				}
			},
		);

		this.socketController.On<AirshipPartyInternalSnapshot>("game-coordinator/party-invite", (data) => {
			Dependency<ProtectedFriendsController>().AddSocialNotification(
				SocialNotificationType.PartyInvite,
				"party-invite:" + data.leader,
				"Party Invite",
				data.members[0].username,
				data.members[0].uid,
				data,
			);
			AudioManager.PlayGlobal("AirshipPackages/@Easy/Core/Sound/FriendRequest.mp3", {
				volumeScale: 0.3,
			});
			if (Game.coreContext === CoreContext.GAME) {
				Game.localPlayer.SendMessage(
					ChatColor.Yellow(data.members[0].username) + ChatColor.Gray(" invited you to their party."),
				);
			}
		});

		// load from cache
		// this.SetupReferences();

		// task.spawn(() => {
		// 	Protected.User.WaitForLocalUser();
		// 	if (!this.partyUpdateReceived) {
		// 		const partyString = StateManager.GetString("airship:party");
		// 		if (partyString) {
		// 			this.party = json.decode(partyString);
		// 		}
		// 	}

		// 	// Note: we should merge UpdateParty() with partyCard.UpdateInfo().
		// 	// For now, we need to call this first.
		// 	this.UpdateParty();

		// 	if (!this.partyLeaderStatusReceived) {
		// 		const partyLeaderStatusString = StateManager.GetString("airship:party-leader-status");
		// 		if (partyLeaderStatusString) {
		// 			this.partyCard.UpdateInfo(json.decode(partyLeaderStatusString));
		// 		}
		// 	}
		// });
	}

	/**
	 * Sends an invite to the provided user, allowing them to join the existing party.
	 * @param userIdToAdd The userId of the user to invite
	 */
	public async InviteUser(userIdToAdd: string): Promise<Result<undefined, undefined>> {
		try {
			await client.party.inviteUser({ userToAdd: userIdToAdd });
			return { success: true, data: undefined };
		} catch {
			return {
				success: false,
				error: undefined,
			};
		}
	}

	/**
	 * Allows the party leader to remove users from the party. A client can always remove itself from the
	 * current party by calling this function and providing their own user id.
	 * @param userIdToRemove
	 */
	public async RemoveUser(userIdToRemove: string): Promise<Result<undefined, undefined>> {
		try {
			await client.party.removeFromParty({ userToRemove: userIdToRemove });
			return { success: true, data: undefined };
		} catch {
			return {
				success: false,
				error: undefined,
			};
		}
	}

	/**
	 * Joins the user to the provided party id. This may fail if the user is not allowed to join the party.
	 * @param partyId The id of the party
	 */
	public async JoinParty(partyId: string): Promise<Result<undefined, undefined>> {
		try {
			await client.party.joinParty({ partyId });
			return { success: true, data: undefined };
		} catch {
			return { success: false, error: undefined };
		}
	}
}
